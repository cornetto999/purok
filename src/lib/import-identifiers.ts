import type { Member } from "./types";

type Identifiers = Pick<Member, "precinct" | "pn" | "no">;
const clean = (value: unknown) => String(value ?? "").trim();

export function importNameKey(
  member: Pick<Member, "lastName" | "firstName" | "middleName">,
): string {
  return [member.lastName, member.firstName, member.middleName]
    .map((part) => clean(part).toLocaleLowerCase().replace(/\s+/g, " "))
    .join("|");
}

/** Re-importing fills missing identifiers without replacing saved values. */
export function missingVoterIdentifiers(
  existing: Identifiers,
  incoming: Identifiers,
): Partial<Identifiers> {
  const patch: Partial<Identifiers> = {};
  const precinct =
    clean(existing.precinct) ||
    clean(existing.pn) ||
    clean(incoming.precinct) ||
    clean(incoming.pn);
  if (!clean(existing.precinct) && precinct) patch.precinct = precinct;
  if (!clean(existing.pn) && precinct) patch.pn = precinct;
  if (!clean(existing.no) && clean(incoming.no)) patch.no = clean(incoming.no);
  return patch;
}
