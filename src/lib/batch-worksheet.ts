import type { WorkBook, WorkSheet } from "xlsx";
import { normalizedHeader, readVoterIdentifiers } from "./spreadsheet-columns";

const lastHeaders = new Set([
  "LAST",
  "LASTNAME",
  "SURNAME",
  "FAMILYNAME",
  "APELYIDO",
]);
const firstHeaders = new Set(["FIRST", "FIRSTNAME", "GIVENNAME"]);
const fullHeaders = new Set(["NAME", "FULLNAME"]);

function isNameHeader(headers: string[]) {
  return (
    headers.some((header) => fullHeaders.has(header)) ||
    (headers.some((header) => lastHeaders.has(header)) &&
      headers.some((header) => firstHeaders.has(header)))
  );
}

function readSheet(xlsx: typeof import("xlsx"), sheet: WorkSheet) {
  const grid = xlsx.utils.sheet_to_json<string[]>(sheet, {
    header: 1,
    defval: "",
    raw: false,
  });
  let headers: string[] | undefined;
  const rows: Record<string, string>[] = [];
  for (const cells of grid) {
    const normalized = cells.map((cell) => normalizedHeader(String(cell)));
    if (isNameHeader(normalized)) {
      headers = normalized;
      continue;
    }
    if (!headers) continue;
    const row: Record<string, string> = {};
    headers.forEach((header, index) => {
      if (header) row[header] = String(cells[index] ?? "").trim();
    });
    const fullName = row["NAME"] || row["FULLNAME"];
    const hasSeparateNames =
      headers.some((header) => lastHeaders.has(header)) &&
      headers.some((header) => firstHeaders.has(header));
    if (hasSeparateNames) {
      if ([...lastHeaders, ...firstHeaders].some((header) => row[header]))
        rows.push(row);
    } else if (fullName) {
      // Printed voter lists contain page headings and footers between numbered records.
      const numberHeader = readVoterIdentifiers(
        Object.fromEntries(headers.map((header) => [header, "marker"])),
      ).no;
      if (numberHeader && !/^\d+$/.test(readVoterIdentifiers(row).no)) continue;
      const comma = fullName.indexOf(",");
      if (comma < 1) {
        throw new Error(
          'Use "Last, First Middle" in the Name column, or separate Last Name and First Name columns.',
        );
      }
      const names = fullName
        .slice(comma + 1)
        .trim()
        .split(/\s+/)
        .filter(Boolean);
      const suffix =
        names.length > 1 &&
        /^(?:JR\.?|SR\.?|II|III|IV|V)$/i.test(names.at(-1) ?? "")
          ? names.pop()
          : undefined;
      const middle = names.length > 1 ? names.pop() : "";
      row["LAST"] = fullName.slice(0, comma).trim();
      row["FIRST"] = names.join(" ");
      row["MIDDLE"] = [middle === "_" ? "" : middle, suffix]
        .filter(Boolean)
        .join(" ");
      if (!row["FIRST"])
        throw new Error(
          "A Name value is missing its first name. Check the spreadsheet before importing.",
        );
      rows.push(row);
    }
  }
  return headers ? rows : null;
}

/** Prefer ENTRY; otherwise accept a single recognizable resident worksheet. */
export function readBatchWorksheet(
  xlsx: typeof import("xlsx"),
  book: WorkBook,
) {
  const entry = book.SheetNames.find(
    (name) => name.trim().toUpperCase() === "ENTRY",
  );
  const candidates = entry ? [entry] : book.SheetNames;
  const matches = candidates.flatMap((name) => {
    const sheet = book.Sheets[name];
    if (!sheet) return [];
    const rows = readSheet(xlsx, sheet);
    return rows ? [{ sheetName: name, rows }] : [];
  });
  if (matches.length === 0) {
    throw new Error(
      "No resident worksheet found. Include Name (Last, First Middle), or Last Name and First Name columns.",
    );
  }
  if (matches.length > 1) {
    throw new Error(
      `Multiple resident worksheets found (${matches.map((match) => match.sheetName).join(", ")}). Rename the sheet to import to ENTRY.`,
    );
  }
  const match = matches[0]!;
  if (match.rows.length === 0)
    throw new Error(
      `No resident records found in worksheet "${match.sheetName}".`,
    );
  return match;
}
