import type { Member } from "./types";

export type PrecinctMember = Pick<
  Member,
  | "id"
  | "precinct"
  | "pn"
  | "is_purok_leader_indicator"
  | "is_household_leader"
  | "is_household_member"
>;
type Counts = {
  pl: number;
  hl: number;
  hm: number;
  unassigned: number;
  total: number;
};
const emptyCounts = (): Counts => ({
  pl: 0,
  hl: 0,
  hm: 0,
  unassigned: 0,
  total: 0,
});

export function buildPrecinctStats(members: PrecinctMember[]) {
  const groups = new Map<string, Counts>();
  const totals = emptyCounts();
  const seen = new Set<number>();
  for (const member of members) {
    if (seen.has(member.id)) continue;
    seen.add(member.id);
    const precinct =
      (
        String(member.precinct ?? "").trim() || String(member.pn ?? "").trim()
      ).toUpperCase() || "No precinct";
    const counts = groups.get(precinct) ?? emptyCounts();
    const pl = Number(member.is_purok_leader_indicator === true);
    const hl = Number(member.is_household_leader === true);
    const hm = Number(member.is_household_member === true);
    for (const target of [counts, totals]) {
      target.pl += pl;
      target.hl += hl;
      target.hm += hm;
      target.unassigned += Number(pl + hl + hm === 0);
      target.total++;
    }
    groups.set(precinct, counts);
  }
  const rows = [...groups].map(([precinct, counts]) => ({
    precinct,
    ...counts,
  }));
  rows.sort((a, b) => {
    if (a.precinct === "No precinct") return 1;
    if (b.precinct === "No precinct") return -1;
    return a.precinct.localeCompare(b.precinct, undefined, { numeric: true });
  });
  return { rows, totals };
}
