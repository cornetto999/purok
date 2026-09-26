import { memberPurokId } from "./member-assignment";
import type { Household, Member, Purok, User } from "./types";

function assignedName(value: string | undefined): string {
  const name = value?.trim() ?? "";
  return /^(?:[-–—]+|unassigned|no leader|n\/?a)$/i.test(name) ? "" : name;
}

export function getPurokLeaderRows(data: {
  puroks: Purok[];
  users: User[];
  households: Household[];
  members: Member[];
}) {
  const households = new Map(data.households.map((h) => [h.id, h]));
  const users = new Map<number, User>();
  for (const user of data.users) {
    if (user.role === "Purok Leader" && user.linked_entity_id != null) {
      users.set(Number(user.linked_entity_id), user);
    }
  }
  const members = new Map<number, Member[]>();
  for (const member of data.members) {
    const purokId = memberPurokId(member, households);
    if (purokId == null) continue;
    const group = members.get(purokId) ?? [];
    group.push(member);
    members.set(purokId, group);
  }
  const householdCounts = new Map<number, number>();
  for (const household of data.households) {
    householdCounts.set(
      household.purokId,
      (householdCounts.get(household.purokId) ?? 0) + 1,
    );
  }

  return data.puroks
    .flatMap((purok) => {
      const leaderUser = users.get(purok.id);
      const leaderName =
        assignedName(purok.purokLeaderName) ||
        assignedName(leaderUser?.displayName) ||
        leaderUser?.username;
      if (!leaderName) return [];
      return [
        {
          purok,
          leaderName,
          leaderUser,
          householdCount: householdCounts.get(purok.id) ?? 0,
          members: members.get(purok.id) ?? [],
        },
      ];
    })
    .sort(
      (a, b) =>
        a.leaderName.localeCompare(b.leaderName) || a.purok.id - b.purok.id,
    );
}
