import type { Barangay, Household, Member, Purok, CivilStatus } from "./types";
import { memberFullName } from "./types";

export interface DataSet {
  barangays: Barangay[];
  puroks: Purok[];
  households: Household[];
  members: Member[];
}

export const COLUMNS = [
  "Barangay",
  "Barangay Captain",
  "Purok",
  "Purok Leader",
  "Household Leader",
  "Address",
  "Last Name",
  "First Name",
  "Middle Name",
  "Precinct",
  "No",
  "PN",
  "Code",
  "PI",
  "HL",
  "HM",
  "Age",
  "Religion",
  "Status",
  "SC",
  "PWD",
  "IP",
  "Remarks",
] as const;

// Old format columns for backward-compatible import
const OLD_COLUMNS = ["Full Name", "Civil Status"] as const;

type Row = Record<string, string | number>;

export function toRows(data: DataSet): Row[] {
  const hh = new Map(data.households.map((h) => [h.id, h]));
  const pk = new Map(data.puroks.map((p) => [p.id, p]));
  const bg = new Map(data.barangays.map((b) => [b.id, b]));
  return data.members.map((m) => {
    const household = hh.get(m.householdId);
    const purok = household ? pk.get(household.purokId) : undefined;
    const barangay = purok ? bg.get(purok.barangayId) : undefined;
    return {
      Barangay: barangay?.name ?? "",
      "Barangay Captain": barangay?.barangayCaptainName ?? "",
      Purok: purok?.name ?? "",
      "Purok Leader": purok?.purokLeaderName ?? "",
      "Household Leader": household?.householdLeaderName ?? "",
      Address: household?.address ?? "",
      "Last Name": m.lastName,
      "First Name": m.firstName,
      "Middle Name": m.middleName,
      Precinct: m.precinct,
      No: m.no,
      PN: m.pn,
      Code: m.code,
      PI: m.is_purok_leader_indicator ? "Yes" : "No",
      HL: m.is_household_leader ? "Yes" : "No",
      HM: m.is_household_member ? "Yes" : "No",
      Age: m.age,
      Religion: m.religion,
      Status: m.status,
      SC: m.sc ? "Yes" : "No",
      PWD: m.pwd ? "Yes" : "No",
      IP: m.ip ? "Yes" : "No",
      Remarks: m.remarks,
    };
  });
}

export async function exportToExcel(data: DataSet, filename = "residents.xlsx") {
  const XLSX = await import("xlsx");
  const rows = toRows(data);
  const sheet = XLSX.utils.json_to_sheet(rows, { header: [...COLUMNS] });
  sheet["!cols"] = COLUMNS.map((c) => ({
    wch: Math.max(12, Math.min(30, c.length + 6)),
  }));
  const book = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(book, sheet, "Residents");
  XLSX.writeFile(book, filename);
}

export async function downloadTemplate() {
  const XLSX = await import("xlsx");
  const sheet = XLSX.utils.json_to_sheet(
    [
      {
        Barangay: "Barangay San Isidro",
        "Barangay Captain": "Hon. Ricardo Mendoza",
        Purok: "Purok 1 - Malinaw",
        "Purok Leader": "Rodrigo Alvarez",
        "Household Leader": "Reyes, Antonio Cruz",
        Address: "Blk 1 Lot 3, Malinaw St.",
        "Last Name": "Reyes",
        "First Name": "Antonio",
        "Middle Name": "Cruz",
        Precinct: "001A",
        No: "1",
        PN: "0001-A",
        Code: "",
        PI: "No",
        HL: "Yes",
        HM: "Yes",
        Age: 68,
        Religion: "Roman Catholic",
        Status: "Married",
        SC: "Yes",
        PWD: "No",
        IP: "No",
        Remarks: "Household leader",
      },
    ],
    { header: [...COLUMNS] }
  );
  sheet["!cols"] = COLUMNS.map((c) => ({ wch: Math.max(12, c.length + 6) }));
  const book = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(book, sheet, "Residents");
  XLSX.writeFile(book, "residents-template.xlsx");
}

const yes = (v: unknown) =>
  ["yes", "y", "true", "1", "oo"].includes(String(v ?? "").trim().toLowerCase());

const civil = (v: unknown): CivilStatus => {
  const s = String(v ?? "").trim().toLowerCase();
  if (s.startsWith("mar")) return "Married";
  if (s.startsWith("wid")) return "Widowed";
  if (s.startsWith("sep")) return "Separated";
  return "Single";
};

/**
 * Detect whether a row set uses old-format columns (Full Name, Civil Status)
 * or new-format columns (Last Name, First Name, Middle Name, Status).
 */
function detectFormat(headers: string[]): "old" | "new" {
  const headerSet = new Set(headers.map((h) => h.trim()));
  if (headerSet.has("Last Name") || headerSet.has("First Name")) return "new";
  if (headerSet.has("Full Name")) return "old";
  return "new"; // default to new
}

/**
 * Parse a "Last, First Middle" full name string into parts.
 */
function parseFullName(fullName: string): { lastName: string; firstName: string; middleName: string } {
  const commaIdx = fullName.indexOf(",");
  if (commaIdx === -1) {
    const parts = fullName.trim().split(/\s+/);
    return {
      lastName: parts[0] ?? "",
      firstName: parts[1] ?? "",
      middleName: parts.slice(2).join(" "),
    };
  }
  const lastName = fullName.substring(0, commaIdx).trim();
  const rest = fullName.substring(commaIdx + 1).trim().split(/\s+/);
  return {
    lastName,
    firstName: rest[0] ?? "",
    middleName: rest.slice(1).join(" "),
  };
}

export async function importFromExcel(file: File): Promise<DataSet> {
  const XLSX = await import("xlsx");
  const book = XLSX.read(await file.arrayBuffer(), { type: "array" });
  const first = book.SheetNames[0];
  if (!first) throw new Error("The file has no sheets.");
  const rows = XLSX.utils.sheet_to_json<Row>(book.Sheets[first]!, { defval: "" });
  if (rows.length === 0) throw new Error("No rows found in the first sheet.");

  // Detect format from headers
  const sampleRow = rows[0]!;
  const headers = Object.keys(sampleRow);
  const format = detectFormat(headers);

  const barangays: Barangay[] = [];
  const puroks: Purok[] = [];
  const households: Household[] = [];
  const members: Member[] = [];
  const bgIdx = new Map<string, number>();
  const pkIdx = new Map<string, number>();
  const hhIdx = new Map<string, number>();

  const get = (r: Row, key: string) => String(r[key] ?? "").trim();
  const getCol = (r: Row, ...candidates: string[]) => {
    for (const c of candidates) {
      if (r[c] !== undefined && String(r[c]).trim() !== "") {
        return String(r[c]).trim();
      }
    }
    const normCandidates = candidates.map((c) => c.toUpperCase().replace(/[^A-Z0-9]/g, ""));
    for (const [k, v] of Object.entries(r)) {
      if (v === undefined || v === null || String(v).trim() === "") continue;
      const normK = k.toUpperCase().replace(/[^A-Z0-9]/g, "");
      if (normCandidates.includes(normK)) {
        return String(v).trim();
      }
    }
    return "";
  };

  rows.forEach((r, i) => {
    let lastName: string, firstName: string, middleName: string;

    if (format === "old") {
      const fullName = get(r, "Full Name");
      if (!fullName) return;
      const parsed = parseFullName(fullName);
      lastName = parsed.lastName;
      firstName = parsed.firstName;
      middleName = parsed.middleName;
    } else {
      lastName = getCol(r, "Last Name", "Last", "Surname", "Family Name");
      firstName = getCol(r, "First Name", "First", "Given Name");
      middleName = getCol(r, "Middle Name", "Middle", "MI");
      if (!lastName && !firstName) return;
    }

    const bName = get(r, "Barangay") || "Unassigned Barangay";
    let bId = bgIdx.get(bName.toLowerCase());
    if (!bId) {
      bId = barangays.length + 1;
      bgIdx.set(bName.toLowerCase(), bId);
      barangays.push({
        id: bId,
        name: bName,
        barangayCaptainName: get(r, "Barangay Captain") || "—",
      });
    }

    const pName = get(r, "Purok") || "Unassigned Purok";
    const pKey = `${bId}|${pName.toLowerCase()}`;
    let pId = pkIdx.get(pKey);
    if (!pId) {
      pId = puroks.length + 1;
      pkIdx.set(pKey, pId);
      puroks.push({
        id: pId,
        barangayId: bId,
        name: pName,
        purokLeaderName: get(r, "Purok Leader") || "—",
      });
    }

    const hLeader = get(r, "Household Leader") || memberFullNameFromParts(lastName, firstName, middleName);
    const hKey = `${pId}|${hLeader.toLowerCase()}|${get(r, "Address").toLowerCase()}`;
    let hId = hhIdx.get(hKey);
    if (!hId) {
      hId = households.length + 1;
      hhIdx.set(hKey, hId);
      households.push({
        id: hId,
        purokId: pId,
        householdLeaderName: hLeader,
        address: get(r, "Address"),
      });
    }

    const statusField = format === "old" ? "Civil Status" : "Status";
    const precinctVal = getCol(r, "Precinct", "Precinct No.", "Precinct  No.", "Precinct No", "Precinct Number", "PN", "P.N.");
    const noVal = getCol(r, "No", "No.", "SN", "S.N.", "#", "Serial No", "Serial Number") || String(i + 1);

    members.push({
      id: i + 1,
      householdId: hId,
      lastName,
      firstName,
      middleName,
      precinct: precinctVal,
      no: noVal,
      pn: precinctVal,
      address: get(r, "Address"),
      code: get(r, "Code"),
      is_purok_leader_indicator: yes(r["PI"]),
      is_household_leader: yes(r["HL"]),
      is_household_member: r["HM"] !== undefined ? yes(r["HM"]) : true,
      age: Number(r["Age"]) || 0,
      religion: get(r, "Religion"),
      status: civil(r[statusField]),
      sc: yes(r["SC"]),
      pwd: yes(r["PWD"]),
      ip: yes(r["IP"]),
      remarks: get(r, "Remarks"),
    });
  });

  if (members.length === 0)
    throw new Error("No resident names found. Check the 'Last Name'/'Full Name' column.");

  return { barangays, puroks, households, members };
}

function memberFullNameFromParts(last: string, first: string, middle: string): string {
  if (last && (first || middle)) {
    return `${last}, ${[first, middle].filter(Boolean).join(" ")}`;
  }
  return [last, first, middle].filter(Boolean).join(" ") || "—";
}
