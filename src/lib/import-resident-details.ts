import { normalizedHeader } from "./spreadsheet-columns";
import type { CivilStatus, Member } from "./types";

export type ImportedDetails = Pick<Member,
  "age" | "religion" | "status" | "sc" | "pwd" | "ip" |
  "is_purok_leader_indicator" | "is_household_leader" | "is_household_member"
>;

/** ENTRY sheets use marks or household numbers as well as Yes/No values. */
export function importFlag(value: unknown): boolean {
  const text = String(value ?? "").trim();
  return text !== "" && !/^(?:no|n|false|0|hindi|[-–—]+|n\/?a)$/i.test(text);
}

/** Only return fields supplied by the workbook, so absent columns cannot erase data. */
export function readResidentDetails(row: Record<string, unknown>): Partial<ImportedDetails> {
  const columns = new Map(Object.entries(row).map(([key, value]) => [
    normalizedHeader(key), String(value ?? "").trim(),
  ]));
  const read = (...names: string[]) => names.map(name => columns.get(normalizedHeader(name)))
    .find(value => value !== undefined && value !== "");
  const details: Partial<ImportedDetails> = {};
  const age = read("Age", "Age in Years");
  if (age !== undefined && Number.isInteger(Number(age)) && Number(age) >= 0 && Number(age) <= 150) {
    details.age = Number(age);
  }
  const religion = read("Religion", "Religious Affiliation");
  if (religion !== undefined) details.religion = religion;
  const status = read("Status", "Civil Status", "Marital Status")?.toLowerCase();
  const statuses: Record<string, CivilStatus> = {
    single: "Single", s: "Single", married: "Married", m: "Married",
    widowed: "Widowed", widow: "Widowed", widower: "Widowed", w: "Widowed",
    separated: "Separated", sep: "Separated",
  };
  if (status && statuses[status]) details.status = statuses[status];
  const flags = [
    ["is_purok_leader_indicator", ["PL", "PI", "Purok Leader Indicator", "Is Purok Leader"]],
    ["is_household_leader", ["HL", "Household Leader Indicator", "Is Household Leader"]],
    ["is_household_member", ["HM", "Household Member", "Is Household Member"]],
    ["sc", ["SC", "Senior Citizen"]],
    ["pwd", ["PWD", "Person with Disability", "Persons with Disabilities"]],
    ["ip", ["IP", "Indigenous Person", "Indigenous People"]],
  ] as const;
  for (const [key, aliases] of flags) {
    const value = read(...aliases);
    if (value !== undefined) details[key] = importFlag(value);
  }
  return details;
}

export const defaultResidentDetails: ImportedDetails = {
  age: 0, religion: "", status: "Single", sc: false, pwd: false, ip: false,
  is_purok_leader_indicator: false, is_household_leader: false, is_household_member: false,
};
