import { supabase } from "./supabase";
import { memberFullName, type Household, type Member, type Team } from "./types";

export interface HouseholdLeaderSummary {
  name: string;
  team: string;
}

export interface HouseholdMemberSummary {
  id?: number;
  name: string;
  age: number;
  role: "HM";
  rawMember?: Member;
}

export interface HouseholdGroupingItem {
  household_id: string;
  address: string;
  household_leader: HouseholdLeaderSummary;
  household_members: HouseholdMemberSummary[];
  total_members: number;
  rawHousehold?: Household;
  leaderMember?: Member | null;
}

export interface CleanHouseholdGrouping {
  household_id: string;
  address: string;
  household_leader: {
    name: string;
    team: string;
  };
  household_members: Array<{
    name: string;
    age: number;
    role: "HM";
  }>;
  total_members: number;
}

/**
 * Strips internal component references to produce the exact JSON output specified:
 * [
 *   {
 *     "household_id": "123",
 *     "address": "Block 1, Lot 2",
 *     "household_leader": { "name": "Juan Dela Cruz", "team": "Team A" },
 *     "household_members": [
 *       { "name": "Maria Dela Cruz", "age": 45, "role": "HM" },
 *       { "name": "Pedro Dela Cruz", "age": 16, "role": "HM" }
 *     ],
 *     "total_members": 3
 *   }
 * ]
 */
export function toCleanJson(items: HouseholdGroupingItem[]): CleanHouseholdGrouping[] {
  return items.map((item) => ({
    household_id: item.household_id,
    address: item.address,
    household_leader: {
      name: item.household_leader.name,
      team: item.household_leader.team,
    },
    household_members: item.household_members.map((m) => ({
      name: m.name,
      age: m.age,
      role: m.role,
    })),
    total_members: item.total_members,
  }));
}

/**
 * Pure transformation logic that groups households and members for a given Purok.
 */
export function buildHouseholdGrouping(
  households: Household[],
  members: Member[],
  teams: Team[],
  purokId: number,
): HouseholdGroupingItem[] {
  // 1. Filter households where purok_id matches the Purok Leader's assigned Purok
  const matchingHouseholds = households.filter((h) => {
    const pId = h.purokId ?? (h as unknown as { purok_id?: number }).purok_id;
    return pId === purokId;
  });

  return matchingHouseholds.map((h) => {
    // 2. Filter members belonging to this household
    const hMembers = members.filter((m) => {
      const hhId = m.householdId ?? (m as unknown as { household_id?: number }).household_id;
      return hhId === h.id;
    });

    // 3. Resolve Household Leader (HL)
    // Priority:
    // a. Member marked is_household_leader === true
    // b. Member whose full name matches household.householdLeaderName
    // c. Member with remarks containing "leader"
    // d. First member in household
    let leaderMember: Member | null =
      hMembers.find((m) => m.is_household_leader) ?? null;

    if (!leaderMember && h.householdLeaderName && h.householdLeaderName.trim()) {
      const normalizedTarget = h.householdLeaderName.trim().toLowerCase();
      leaderMember =
        hMembers.find(
          (m) => memberFullName(m).trim().toLowerCase() === normalizedTarget,
        ) ?? null;
    }

    if (!leaderMember && hMembers.length > 0) {
      leaderMember =
        hMembers.find((m) => m.remarks?.toLowerCase().includes("leader")) ??
        hMembers[0] ??
        null;
    }

    // Resolve Leader Name
    let leaderName = "No Leader Assigned";
    if (leaderMember) {
      leaderName = memberFullName(leaderMember);
    } else if (h.householdLeaderName && h.householdLeaderName.trim()) {
      leaderName = h.householdLeaderName.trim();
    }

    // Resolve Leader Team:
    // Check leader member's teamId or first available teamId in household
    let leaderTeam = "Unassigned";
    const teamId =
      leaderMember?.teamId ??
      hMembers.find((m) => m.teamId != null)?.teamId;

    if (teamId) {
      const team = teams.find((t) => t.id === teamId);
      if (team?.team_name) {
        leaderTeam = team.team_name;
      }
    }

    // 4. Resolve Household Members (HM)
    // All members in this household excluding the leaderMember
    const memberRecords = hMembers.filter(
      (m) => !leaderMember || m.id !== leaderMember.id,
    );

    const householdMembersList: HouseholdMemberSummary[] = memberRecords.map(
      (m) => ({
        id: m.id,
        name: memberFullName(m),
        age: typeof m.age === "number" ? m.age : Number(m.age) || 0,
        role: "HM" as const,
        rawMember: m,
      }),
    );

    // 5. Total Members calculation
    const hasLeader = leaderName !== "No Leader Assigned";
    const totalMembers = householdMembersList.length + (hasLeader ? 1 : 0);

    return {
      household_id: String(h.id),
      address: h.address || "No Address Registered",
      household_leader: {
        name: leaderName,
        team: leaderTeam,
      },
      household_members: householdMembersList,
      total_members: totalMembers,
      rawHousehold: h,
      leaderMember,
    };
  });
}

/**
 * Direct database query function to fetch households and members from Supabase
 * for a specific purokId and return the grouped structure.
 */
export async function fetchHouseholdGroupingFromSupabase(
  purokId: number,
): Promise<HouseholdGroupingItem[]> {
  // 1. Fetch households in this Purok (support both "purokId" and "purok_id")
  let hhData: Household[] = [];
  const hhQuery1 = await supabase
    .from("households")
    .select("*")
    .eq("purokId", purokId);

  if (!hhQuery1.error && hhQuery1.data && hhQuery1.data.length > 0) {
    hhData = hhQuery1.data as unknown as Household[];
  } else {
    // Fallback in case table uses snake_case column
    const hhQuery2 = await supabase
      .from("households")
      .select("*")
      .eq("purok_id", purokId);
    if (!hhQuery2.error && hhQuery2.data) {
      hhData = hhQuery2.data as unknown as Household[];
    }
  }

  if (hhData.length === 0) {
    return [];
  }

  const householdIds = hhData.map((h) => h.id);

  // 2. Fetch all members associated with those households
  let membersData: Member[] = [];
  const mQuery1 = await supabase
    .from("members")
    .select("*")
    .in("householdId", householdIds);

  if (!mQuery1.error && mQuery1.data) {
    membersData = mQuery1.data as unknown as Member[];
  } else {
    const mQuery2 = await supabase
      .from("members")
      .select("*")
      .in("household_id", householdIds);
    if (!mQuery2.error && mQuery2.data) {
      membersData = mQuery2.data as unknown as Member[];
    }
  }

  // 3. Fetch teams to resolve team names
  let teamsData: Team[] = [];
  const tQuery = await supabase.from("teams").select("*");
  if (!tQuery.error && tQuery.data) {
    teamsData = tQuery.data as unknown as Team[];
  }

  // 4. Run grouping logic
  return buildHouseholdGrouping(hhData, membersData, teamsData, purokId);
}
