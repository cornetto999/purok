import { extractBarangayFromFileName } from "./barangay-data";
import { normalizePurokName } from "./import-entry-sheet";
import { supabase } from "./supabase";
import type { Barangay, Purok, Household, Member, CivilStatus } from "./types";
import { duplicateKey, type PendingDuplicate } from "./store";

export interface BatchItem {
  id: string;
  file: File;
  fileName: string;
  detectedBarangay: string;
  targetBarangay: string;
  rowCount: number;
  memberCount: number;
  householdCount: number;
  purokCount: number;
  status: "pending" | "processing" | "success" | "failed";
  errorMessage?: string;
}

interface RawEntryRow {
  PN: string;
  SN: string;
  LAST: string;
  FIRST: string;
  MIDDLE: string;
  ADDRESS: string;
  CODE: string;
  PL: string;
  HL: string;
  HM: string;
  REMARKS: string;
}

const str = (v: unknown): string => String(v ?? "").trim();
const hasValue = (v: unknown): boolean => str(v) !== "";

export function isExcelFile(file: File): boolean {
  const name = file.name.toLowerCase();
  return name.endsWith(".xlsx") || name.endsWith(".xls");
}

export function createBatchItem(file: File): BatchItem {
  const detected = extractBarangayFromFileName(file.name);
  return {
    id: `${file.name}-${file.lastModified}-${Math.random().toString(36).slice(2, 7)}`,
    file,
    fileName: file.name,
    detectedBarangay: detected,
    targetBarangay: detected,
    rowCount: 0,
    memberCount: 0,
    householdCount: 0,
    purokCount: 0,
    status: "pending",
  };
}

/**
 * Parses and processes a single RV Excel file through the 5 steps:
 * 1. Identify Barangay
 * 2. Database Check (find or auto-create Barangay)
 * 3. Parse "ENTRY" Sheet
 * 4. Relational Mapping (Puroks, Households, Members with barangayId)
 * 5. Commit to Database
 */
export async function processSingleFile(
  item: BatchItem,
  targetBarangayOverride?: string,
): Promise<{
  barangayId: number;
  barangayName: string;
  memberCount: number;
  householdCount: number;
  purokCount: number;
  duplicateCount: number;
}> {
  // Step 1: Identify Barangay
  const barangayName = (targetBarangayOverride || item.targetBarangay || item.detectedBarangay).trim();

  // Edge case: Validate file format
  if (!isExcelFile(item.file)) {
    throw new Error("Invalid file format. Please upload .xlsx or .xls file.");
  }

  // Step 2: Database Check / Auto-Create Barangay
  const { data: existingB, error: bFindErr } = await supabase
    .from("barangays")
    .select("*")
    .ilike("name", barangayName)
    .limit(1);

  if (bFindErr) {
    throw new Error(`Database error checking barangay: ${bFindErr.message}`);
  }

  let barangayId: number;
  if (existingB && existingB.length > 0) {
    barangayId = existingB[0].id;
  } else {
    // Auto-create barangay
    const { data: createdB, error: bCreateErr } = await supabase
      .from("barangays")
      .insert([{ name: barangayName, barangayCaptainName: "—" }])
      .select()
      .single();

    if (bCreateErr || !createdB) {
      throw new Error(`Failed to create barangay "${barangayName}": ${bCreateErr?.message}`);
    }
    barangayId = createdB.id;
  }

  // Step 3: Parse sheet named "ENTRY"
  const XLSX = await import("xlsx");
  const buffer = await item.file.arrayBuffer();
  const book = XLSX.read(buffer, { type: "array" });

  const entrySheetName = book.SheetNames.find(
    (n) => n.toUpperCase().trim() === "ENTRY",
  );

  if (!entrySheetName) {
    throw new Error("Missing ENTRY sheet");
  }

  const rawJson = XLSX.utils.sheet_to_json<Record<string, unknown>>(
    book.Sheets[entrySheetName]!,
    { defval: "" },
  );

  if (rawJson.length === 0) {
    throw new Error("Empty ENTRY sheet");
  }

  const rows: RawEntryRow[] = rawJson.map((raw) => {
    const norm: Record<string, string> = {};
    for (const [k, v] of Object.entries(raw)) {
      norm[k.toUpperCase().trim()] = str(v);
    }
    return {
      PN: norm["PN"] ?? "",
      SN: norm["SN"] ?? "",
      LAST: norm["LAST"] ?? "",
      FIRST: norm["FIRST"] ?? "",
      MIDDLE: norm["MIDDLE"] ?? "",
      ADDRESS: norm["ADDRESS"] ?? "",
      CODE: norm["CODE"] ?? "",
      PL: norm["PL"] ?? "",
      HL: norm["HL"] ?? "",
      HM: norm["HM"] ?? "",
      REMARKS: norm["REMARKS"] ?? "",
    };
  });

  // Step 4: Relational Mapping
  // Group by CODE to extract Puroks
  const purokInfoMap = new Map<string, { leaderName: string }>();
  for (const row of rows) {
    const normCode = normalizePurokName(row.CODE);
    if (!purokInfoMap.has(normCode)) {
      purokInfoMap.set(normCode, { leaderName: "—" });
    }
    if (hasValue(row.PL)) {
      const parts = [row.LAST, row.FIRST, row.MIDDLE].filter(Boolean);
      const display = parts[0]
        ? `${parts[0]}, ${parts.slice(1).join(" ")}`.trim()
        : "—";
      purokInfoMap.get(normCode)!.leaderName = display;
    }
  }

  if (purokInfoMap.size === 0) {
    purokInfoMap.set("Unassigned Purok", { leaderName: "—" });
  }

  // Fetch existing puroks for this barangay
  const { data: dbPuroks, error: pFindErr } = await supabase
    .from("puroks")
    .select("*")
    .eq("barangayId", barangayId);

  if (pFindErr) {
    throw new Error(`Database error checking puroks: ${pFindErr.message}`);
  }

  const existingPuroks = dbPuroks || [];
  const purokIdMap = new Map<string, number>();

  for (const [pName, info] of purokInfoMap.entries()) {
    const existing = existingPuroks.find(
      (p) => p.name.trim().toLowerCase() === pName.trim().toLowerCase(),
    );
    if (existing) {
      purokIdMap.set(pName, existing.id);
    } else {
      const { data: newP, error: pInsertErr } = await supabase
        .from("puroks")
        .insert([
          {
            barangayId,
            name: pName,
            purokLeaderName: info.leaderName,
          },
        ])
        .select()
        .single();

      if (pInsertErr || !newP) {
        throw new Error(`Failed to insert purok "${pName}": ${pInsertErr?.message}`);
      }
      purokIdMap.set(pName, newP.id);
    }
  }

  // Ensure default/baseline household exists per purok
  const { data: dbHouseholds, error: hFindErr } = await supabase
    .from("households")
    .select("*")
    .eq("barangayId", barangayId);

  if (hFindErr) {
    throw new Error(`Database error checking households: ${hFindErr.message}`);
  }

  const existingHouseholds = dbHouseholds || [];
  const defaultHouseholdPerPurok = new Map<number, number>();

  for (const pId of purokIdMap.values()) {
    const existingH = existingHouseholds.find((h) => h.purokId === pId);
    if (existingH) {
      defaultHouseholdPerPurok.set(pId, existingH.id);
    } else {
      const { data: createdH, error: hCreateErr } = await supabase
        .from("households")
        .insert([
          {
            purokId: pId,
            barangayId,
            householdLeaderName: "General Household",
            address: `${barangayName}`,
          },
        ])
        .select()
        .single();

      if (!hCreateErr && createdH) {
        defaultHouseholdPerPurok.set(pId, createdH.id);
      }
    }
  }

  // Map HL & HM to Households and Members
  let currentActiveHouseholdId: number | null = null;
  const householdInsertBatch: {
    purokId: number;
    barangayId: number;
    householdLeaderName: string;
    address: string;
    rowIndex: number;
  }[] = [];

  // Pass 1: Identify all HL rows to insert
  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    if (!row.LAST && !row.FIRST) continue;

    const normCode = normalizePurokName(row.CODE);
    const pId = purokIdMap.get(normCode) || Array.from(purokIdMap.values())[0];

    if (hasValue(row.HL)) {
      const fullName = [row.LAST, row.FIRST, row.MIDDLE].filter(Boolean);
      const leaderDisplay = fullName[0]
        ? `${fullName[0]}, ${fullName.slice(1).join(" ")}`.trim()
        : "—";
      householdInsertBatch.push({
        purokId: pId,
        barangayId,
        householdLeaderName: leaderDisplay,
        address: row.ADDRESS || `${normCode}, ${barangayName}`,
        rowIndex: i,
      });
    }
  }

  // Insert any specific new households
  const rowIndexToHouseholdId = new Map<number, number>();
  if (householdInsertBatch.length > 0) {
    const { data: insertedHouseholds, error: batchHErr } = await supabase
      .from("households")
      .insert(
        householdInsertBatch.map((h) => ({
          purokId: h.purokId,
          barangayId: h.barangayId,
          householdLeaderName: h.householdLeaderName,
          address: h.address,
        })),
      )
      .select();

    if (batchHErr || !insertedHouseholds) {
      throw new Error(`Failed to insert households: ${batchHErr?.message}`);
    }

    insertedHouseholds.forEach((h, idx) => {
      rowIndexToHouseholdId.set(householdInsertBatch[idx].rowIndex, h.id);
    });
  }

  // Pass 2: Map Members
  const memberList: Omit<Member, "id">[] = [];

  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    if (!row.LAST && !row.FIRST) continue;

    const normCode = normalizePurokName(row.CODE);
    const pId = purokIdMap.get(normCode) || Array.from(purokIdMap.values())[0];

    if (rowIndexToHouseholdId.has(i)) {
      currentActiveHouseholdId = rowIndexToHouseholdId.get(i)!;
    } else if (!currentActiveHouseholdId) {
      currentActiveHouseholdId = defaultHouseholdPerPurok.get(pId) ?? null;
    }

    const hId = currentActiveHouseholdId || defaultHouseholdPerPurok.get(pId) || 1;

    memberList.push({
      householdId: hId,
      barangayId,
      lastName: row.LAST,
      firstName: row.FIRST,
      middleName: row.MIDDLE,
      precinct: row.PN,
      no: row.SN,
      pn: row.PN,
      address: row.ADDRESS || `${normCode}, ${barangayName}`,
      code: row.CODE,
      is_purok_leader_indicator: hasValue(row.PL),
      is_household_leader: hasValue(row.HL),
      is_household_member: hasValue(row.HM),
      age: 0,
      religion: "",
      status: "Single" as CivilStatus,
      sc: false,
      pwd: false,
      ip: false,
      remarks: row.REMARKS,
    });
  }

  // Step 5: Commit Members in Chunks
  const chunkSize = 500;
  for (let i = 0; i < memberList.length; i += chunkSize) {
    const chunk = memberList.slice(i, i + chunkSize);
    const { error: mInsertErr } = await supabase.from("members").insert(chunk);
    if (mInsertErr) {
      throw new Error(
        `Failed to insert members (batch ${Math.floor(i / chunkSize) + 1}): ${mInsertErr.message}`,
      );
    }
  }

  return {
    barangayId,
    barangayName,
    memberCount: memberList.length,
    householdCount: householdInsertBatch.length,
    purokCount: purokIdMap.size,
    duplicateCount: 0,
  };
}

/**
 * Iterates through dropped files asynchronously with real-time progress updates and abort support.
 */
export async function processBatchUpload(
  items: BatchItem[],
  onProgress: (itemId: string, patch: Partial<BatchItem>) => void,
  isCancelled: () => boolean,
): Promise<{ successfulCount: number; failedCount: number; totalMembers: number }> {
  let successfulCount = 0;
  let failedCount = 0;
  let totalMembers = 0;

  for (const item of items) {
    if (isCancelled()) {
      onProgress(item.id, {
        status: "failed",
        errorMessage: "Batch process cancelled by user",
      });
      continue;
    }

    // Skip already processed success
    if (item.status === "success") {
      successfulCount++;
      totalMembers += item.memberCount;
      continue;
    }

    onProgress(item.id, { status: "processing", errorMessage: undefined });

    try {
      const result = await processSingleFile(item);

      if (isCancelled()) {
        onProgress(item.id, {
          status: "failed",
          errorMessage: "Batch process cancelled by user",
        });
        continue;
      }

      successfulCount++;
      totalMembers += result.memberCount;

      onProgress(item.id, {
        status: "success",
        memberCount: result.memberCount,
        householdCount: result.householdCount,
        purokCount: result.purokCount,
        rowCount: result.memberCount,
        errorMessage: undefined,
      });
    } catch (err) {
      failedCount++;
      const msg = err instanceof Error ? err.message : "Failed to process file";
      onProgress(item.id, {
        status: "failed",
        errorMessage: msg,
      });
    }
  }

  return { successfulCount, failedCount, totalMembers };
}
