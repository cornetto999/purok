import type { Household, Member } from "./types";

export function isClaimedHouseholdLeader(
  member: Member,
  household: Household,
): boolean {
  return (
    member.is_household_leader === true &&
    member.purok_id != null &&
    Number(member.householdId) === Number(household.id) &&
    Number(member.purok_id) === Number(household.purokId)
  );
}
