/**
 * Excel "ENTRY" Sheet Importer
 *
 * Parses files like RV_BURNAY.xlsx that have a sheet named "ENTRY"
 * with columns: PN, SN, LAST, FIRST, MIDDLE, ADDRESS, CODE, PL, HL, HM, REMARKS
 *
 * Converts the flat rows into a relational hierarchy:
 *   Barangay → Purok (by CODE) → Household (by HL rows) → Members (HM rows)
 */

import type { Barangay, Purok, Household, Member, CivilStatus } from "./types";
import type { DataSet } from "./excel";
import { extractBarangayFromFileName } from "./barangay-data";

// ── Raw row shape from the ENTRY sheet ────────────────────────────────────────

interface EntryRow {
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

// ── Summary returned before committing ────────────────────────────────────────

export interface ImportSummary {
  memberCount: number;
  householdCount: number;
  purokCount: number;
  barangayCount: number;
  detectedBarangayName: string;
  data: DataSet;
}

// ── Helpers ───────────────────────────────────────────────────────────────────

const str = (v: unknown): string => String(v ?? "").trim();
const hasValue = (v: unknown): boolean => str(v) !== "";
const normalizedHeader = (header: string): string =>
  header.toUpperCase().replace(/[^A-Z0-9]/g, "");

function readColumn(
  row: Record<string, string>,
  ...headers: string[]
): string {
  return headers
    .map((header) => row[normalizedHeader(header)] ?? "")
    .find((value) => value !== "") ?? "";
}

function findPrecinct(norm: Record<string, string>, raw: Record<string, unknown>): string {
  const directMatches = [
    "PRECINCTNO",
    "PRECINCT",
    "PRECINCTNUMBER",
    "PRECINCTID",
    "PN",
    "PRECNO",
    "PCTNO",
    "PRCNTNO",
    "VOTERSPRECINCT",
    "VOTERPRECINCT",
    "CLUSTEREDPRECINCT",
    "ESTABLISHEDPRECINCT",
  ];
  for (const k of directMatches) {
    if (norm[k]) return norm[k];
  }
  for (const [k, v] of Object.entries(norm)) {
    if (!v) continue;
    if (k.includes("PRECINCT") || k.includes("PRCNT") || k === "PN" || k.startsWith("PCT") || k.startsWith("PREC")) {
      return v;
    }
  }
  for (const [rawKey, rawVal] of Object.entries(raw)) {
    const v = str(rawVal);
    if (!v) continue;
    const clean = rawKey.trim().toLowerCase();
    if (clean.includes("precinct") || clean.includes("prcnt") || clean.startsWith("pct") || clean === "pn" || clean.startsWith("prec")) {
      return v;
    }
  }
  return "";
}

function findSerialNo(norm: Record<string, string>, raw: Record<string, unknown>): string {
  const directMatches = [
    "NO",
    "SN",
    "SERIALNO",
    "SERIALNUMBER",
    "VOTERNO",
    "VOTERNUMBER",
    "SEQNO",
    "SEQUENCENO",
  ];
  for (const k of directMatches) {
    if (norm[k]) return norm[k];
  }
  for (const [rawKey, rawVal] of Object.entries(raw)) {
    const v = str(rawVal);
    if (!v) continue;
    const clean = rawKey.trim().toLowerCase();
    if (clean === "no" || clean === "no." || clean === "#" || clean === "sn" || clean === "s.n." || clean.includes("serial") || clean.includes("voter no")) {
      return v;
    }
  }
  return "";
}

// ── Normalize Purok Code to Standard Purok Name ──────────────────────────────
export function normalizePurokName(code: string): string {
  const c = code.trim();
  if (!c) return "Unassigned Purok";
  if (/^\d+$/.test(c)) return `Purok ${c}`;
  if (/^p\s*(\d+[a-z]?)$/i.test(c)) {
    const match = c.match(/^p\s*(\d+[a-z]?)$/i);
    return match && match[1] ? `Purok ${match[1].toUpperCase()}` : c;
  }
  return c;
}

// ── Parse the ENTRY sheet from an uploaded File ──────────────────────────────

export async function parseEntrySheet(
  file: File,
  targetBarangayName?: string,
): Promise<ImportSummary> {
  const XLSX = await import("xlsx");
  const buffer = await file.arrayBuffer();
  const book = XLSX.read(buffer, { type: "array" });

  const entrySheetName = book.SheetNames.find(
    (n) => n.toUpperCase() === "ENTRY",
  );
  if (!entrySheetName) {
    throw new Error(
      `Sheet "ENTRY" not found. Available sheets: ${book.SheetNames.join(", ")}`,
    );
  }

  const sheet = book.Sheets[entrySheetName]!;
  const aoa = XLSX.utils.sheet_to_json<unknown[]>(sheet, { header: 1, defval: "" });

  let headerRowIndex = 0;
  for (let r = 0; r < Math.min(10, aoa.length); r++) {
    const rowCells = (aoa[r] || []).map((c) => String(c ?? "").trim().toUpperCase());
    const hasVoterHeader = rowCells.some((c) =>
      c.includes("PRECINCT") ||
      c.includes("LAST") ||
      c.includes("FIRST") ||
      c === "PN" ||
      c === "SN" ||
      c === "NO" ||
      c === "NO." ||
      c.includes("VOTER") ||
      c.includes("NAME")
    );
    if (hasVoterHeader) {
      headerRowIndex = r;
      break;
    }
  }

  const rawRows = XLSX.utils.sheet_to_json<Record<string, unknown>>(
    sheet,
    { range: headerRowIndex, defval: "" },
  );

  if (rawRows.length === 0) {
    throw new Error('The "ENTRY" sheet has no data rows.');
  }

  // Normalize column names to uppercase and map to EntryRow
  const rows: EntryRow[] = rawRows.map((raw) => {
    const norm: Record<string, string> = {};
    for (const [key, val] of Object.entries(raw)) {
      norm[normalizedHeader(key)] = str(val);
    }
    return {
      PN: findPrecinct(norm, raw),
      SN: findSerialNo(norm, raw),
      LAST: readColumn(norm, "LAST", "Last Name", "Surname", "Family Name", "Apelyido"),
      FIRST: readColumn(norm, "FIRST", "First Name", "Given Name"),
      MIDDLE: readColumn(norm, "MIDDLE", "Middle Name", "MI", "Middle Initial"),
      ADDRESS: readColumn(norm, "ADDRESS", "Voter Address", "Residence"),
      CODE: readColumn(norm, "CODE", "Purok", "Zone", "Sitio"),
      PL: readColumn(norm, "PL"),
      HL: readColumn(norm, "HL"),
      HM: readColumn(norm, "HM"),
      REMARKS: readColumn(norm, "REMARKS", "Remarks / Notes", "Remarks", "Notes"),
    };
  });

  const detectedBarangay = targetBarangayName?.trim() || extractBarangayFromFileName(file.name);
  const data = processImportedData(rows, detectedBarangay);

  return {
    memberCount: data.members.length,
    householdCount: data.households.length,
    purokCount: data.puroks.length,
    barangayCount: data.barangays.length,
    detectedBarangayName: detectedBarangay,
    data,
  };
}

// ── Core hierarchy builder ───────────────────────────────────────────────────

function processImportedData(rows: EntryRow[], barangayName: string = "Imported Barangay"): DataSet {
  const defaultBarangay: Barangay = {
    id: 1,
    name: barangayName,
    barangayCaptainName: "—",
  };

  // ── Step A: Extract unique Puroks from CODE ──────────────────────────────

  const purokMap = new Map<string, { id: number; leaderName: string; displayName: string }>();
  let purokIdCounter = 0;

  for (const row of rows) {
    const rawCode = str(row.CODE);
    const normalizedName = normalizePurokName(rawCode);

    if (!purokMap.has(normalizedName)) {
      purokIdCounter++;
      purokMap.set(normalizedName, {
        id: purokIdCounter,
        leaderName: "—",
        displayName: normalizedName,
      });
    }

    // If PL is flagged, this person is the purok leader
    if (hasValue(row.PL)) {
      const fullName = [row.LAST, row.FIRST, row.MIDDLE]
        .map(str)
        .filter(Boolean);
      const display = fullName[0]
        ? `${fullName[0]}, ${fullName.slice(1).join(" ")}`.trim()
        : "—";
      purokMap.get(normalizedName)!.leaderName = display;
    }
  }

  // Some ENTRY sheets do not include CODE values. Keep those residents in a
  // predictable catch-all purok instead of dropping them during import.
  if (purokMap.size === 0) {
    purokMap.set("Unassigned Purok", { id: 1, leaderName: "—", displayName: "Unassigned Purok" });
  }

  const puroks: Purok[] = Array.from(purokMap.values()).map((info) => ({
    id: info.id,
    barangayId: defaultBarangay.id,
    name: info.displayName,
    purokLeaderName: info.leaderName,
  }));

  // ── Step B & C: Build Households and assign Members ─────────────────────

  const households: Household[] = [];
  const members: Member[] = [];
  let householdIdCounter = 0;
  let memberIdCounter = 0;
  let currentHouseholdId: number | null = null;

  for (const row of rows) {
    const lastName = str(row.LAST);
    const firstName = str(row.FIRST);
    const middleName = str(row.MIDDLE);

    // Skip completely empty rows
    if (!lastName && !firstName) continue;

    const code = str(row.CODE);
    const normCode = normalizePurokName(code);
    const purokInfo = purokMap.get(normCode);
    const purokId = purokInfo?.id ?? 1; // fallback to first purok

    const isPL = hasValue(row.PL);
    const isHL = hasValue(row.HL);
    const isHM = hasValue(row.HM);

    // Step B: When we encounter an HL row, create a new Household
    if (isHL) {
      householdIdCounter++;
      const fullName = [lastName, firstName, middleName].filter(Boolean);
      const leaderDisplay = fullName[0]
        ? `${fullName[0]}, ${fullName.slice(1).join(" ")}`.trim()
        : "—";

      households.push({
        id: householdIdCounter,
        purokId,
        householdLeaderName: leaderDisplay,
        address: str(row.ADDRESS),
      });
      currentHouseholdId = householdIdCounter;
    }

    // If we haven't encountered an HL yet, create a catch-all household
    if (currentHouseholdId === null) {
      householdIdCounter++;
      households.push({
        id: householdIdCounter,
        purokId,
        householdLeaderName: "Unassigned",
        address: str(row.ADDRESS) || "—",
      });
      currentHouseholdId = householdIdCounter;
    }

    // Step C: Create a member for every valid row
    memberIdCounter++;
    members.push({
      id: memberIdCounter,
      householdId: currentHouseholdId,
      lastName,
      firstName,
      middleName,
      precinct: str(row.PN), // PN is precinct number
      no: str(row.SN),
      pn: str(row.PN),
      address: str(row.ADDRESS),
      code,
      is_purok_leader_indicator: isPL,
      is_household_leader: isHL,
      is_household_member: isHM,
      // Fields not in Excel → defaults
      age: 0,
      religion: "",
      status: "Single" as CivilStatus,
      sc: false,
      pwd: false,
      ip: false,
      remarks: str(row.REMARKS),
    });
  }

  return {
    barangays: [defaultBarangay],
    puroks,
    households,
    members,
  };
}
