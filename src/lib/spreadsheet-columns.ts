import type { WorkSheet } from "xlsx";

export const normalizedHeader = (header: string): string =>
  header.trim() === "#"
    ? "NUMBER"
    : header.toUpperCase().replace(/[^A-Z0-9]/g, "");

export function readVoterIdentifiers(row: Record<string, unknown>): {
  precinct: string;
  no: string;
} {
  const columns = new Map(
    Object.entries(row).map(([key, value]) => [
      normalizedHeader(key),
      String(value ?? "").trim(),
    ]),
  );
  const read = (headers: string[]) =>
    headers.map((header) => columns.get(header)).find((value) => value) ?? "";
  const readMatching = (matches: (header: string) => boolean) =>
    [...columns].find(([header, value]) => value && matches(header))?.[1] ?? "";
  return {
    precinct:
      read([
        "PRECINCT",
        "PRECINCTNO",
        "PRECINCTNUMBER",
        "PRECINCTID",
        "PRECNO",
        "PCTNO",
        "PRCNTNO",
        "VOTERSPRECINCT",
        "VOTERPRECINCT",
        "CLUSTEREDPRECINCT",
        "ESTABLISHEDPRECINCT",
        "PN",
      ]) ||
      readMatching(
        (header) =>
          header.includes("PRECINCT") ||
          header.includes("PRCNT") ||
          header.startsWith("PCT") ||
          header.startsWith("PREC"),
      ),
    no:
      read([
        "NO",
        "NUMBER",
        "SN",
        "SNO",
        "SERIALNO",
        "SERIALNUMBER",
        "SERIAL",
        "VOTERNO",
        "VOTERNUMBER",
        "VOTERSNO",
        "VOTERSNUMBER",
        "SEQNO",
        "SEQUENCENO",
        "SEQUENCENUMBER",
      ]) ||
      readMatching(
        (header) => header.includes("SERIAL") || header.startsWith("VOTERNO"),
      ),
  };
}

/** Find actual name columns, not a report title containing "voters" or "precinct". */
export function readImportRows(
  xlsx: typeof import("xlsx"),
  sheet: WorkSheet,
): Record<string, string>[] {
  const grid = xlsx.utils.sheet_to_json<string[]>(sheet, {
    header: 1,
    defval: "",
    raw: false,
  });
  const lastNames = new Set([
    "LAST",
    "LASTNAME",
    "SURNAME",
    "FAMILYNAME",
    "APELYIDO",
  ]);
  const firstNames = new Set(["FIRST", "FIRSTNAME", "GIVENNAME"]);
  const headerRow = grid.findIndex((row) => {
    const headers = row.map((cell) => normalizedHeader(String(cell)));
    return (
      headers.includes("FULLNAME") ||
      (headers.some((header) => lastNames.has(header)) &&
        headers.some((header) => firstNames.has(header)))
    );
  });
  if (headerRow === -1) {
    throw new Error(
      "Could not find the name columns. Include Last Name and First Name (or Full Name) in the header row.",
    );
  }
  // raw:false retains displayed identifiers, including Excel formats such as 0000.
  return xlsx.utils.sheet_to_json<Record<string, string>>(sheet, {
    range: xlsx.utils.decode_range(sheet["!ref"] ?? "A1").s.r + headerRow,
    defval: "",
    raw: false,
  });
}
