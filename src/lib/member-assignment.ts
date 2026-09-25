import type { Household, Member } from "./types";

/** A direct claim takes precedence over an older household assignment. */
export function memberPurokId(
  member: Pick<Member, "purok_id" | "householdId">,
  households: ReadonlyMap<number, Household>,
): number | null {
  const id = member.purok_id ?? households.get(Number(member.householdId))?.purokId;
  return id == null ? null : Number(id);
}
