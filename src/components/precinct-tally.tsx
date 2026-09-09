import { useMemo } from "react";
import { useStore } from "@/lib/store";
import { Users, UserRoundCheck, UserRoundX } from "lucide-react";

export function PrecinctTally() {
  const {
    state: { members },
  } = useStore();

  const stats = useMemo(() => {
    const tally: Record<
      string,
      { pl: number; hl: number; hm: number; total: number; rawCount: number }
    > = {};
    let grandPL = 0;
    let grandHL = 0;
    let grandHM = 0;
    let grandTotal = 0;
    let grandRawCount = 0;

    members.forEach((m) => {
      const pn = m.pn?.trim() || "Unassigned";
      if (!tally[pn]) {
        tally[pn] = { pl: 0, hl: 0, hm: 0, total: 0, rawCount: 0 };
      }

      const pl = m.is_purok_leader_indicator ? 1 : 0;
      const hl = m.is_household_leader ? 1 : 0;
      const hm = m.is_household_member ? 1 : 0;

      tally[pn].pl += pl;
      tally[pn].hl += hl;
      tally[pn].hm += hm;
      tally[pn].total += pl + hl + hm;
      tally[pn].rawCount += 1;

      grandPL += pl;
      grandHL += hl;
      grandHM += hm;
      grandTotal += pl + hl + hm;
      grandRawCount += 1;
    });

    const sortedPrecincts = Object.keys(tally).sort((a, b) =>
      a.localeCompare(b, undefined, { numeric: true }),
    );

    return {
      tally,
      sortedPrecincts,
      grandPL,
      grandHL,
      grandHM,
      grandTotal,
      grandRawCount,
    };
  }, [members]);

  const unassignedMemberCount = members.filter(
    (member) =>
      !member.is_purok_leader_indicator &&
      !member.is_household_leader &&
      !member.is_household_member,
  ).length;

  return (
    <div className="mt-8 rounded-xl bg-white p-6 shadow-sm border border-slate-200">
      <div className="mb-6 flex items-center gap-3 border-b border-slate-100 pb-4">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600">
          <Users className="h-5 w-5" />
        </div>
        <div>
          <h2 className="text-lg font-bold text-slate-800">
            Precinct Tally & Analytics Dashboard
          </h2>
          <p className="text-sm text-slate-500">
            Pivot table aggregation by precinct and target tracking.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* Table 1: Role Breakdown */}
        <div className="lg:col-span-6 overflow-x-auto rounded-lg border border-slate-300 shadow-sm">
          <table className="w-full text-left text-sm text-slate-700">
            <thead className="bg-slate-100 text-xs font-semibold uppercase tracking-wider text-slate-600">
              <tr>
                <th className="border-b border-r border-slate-300 px-4 py-3">
                  Row Labels
                </th>
                <th className="border-b border-r border-slate-300 px-4 py-3 text-right">
                  Count of PL
                </th>
                <th className="border-b border-r border-slate-300 px-4 py-3 text-right">
                  Count of HL
                </th>
                <th className="border-b border-r border-slate-300 px-4 py-3 text-right">
                  Count of HM
                </th>
                <th className="border-b border-slate-300 px-4 py-3 text-right text-indigo-700">
                  TOTAL
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 bg-white">
              {stats.sortedPrecincts.map((pn, idx) => (
                <tr
                  key={pn}
                  className={idx % 2 === 0 ? "bg-white" : "bg-slate-50"}
                >
                  <td className="border-r border-slate-300 px-4 py-2 font-medium">
                    {pn}
                  </td>
                  <td className="border-r border-slate-300 px-4 py-2 text-right">
                    {stats.tally[pn]!.pl}
                  </td>
                  <td className="border-r border-slate-300 px-4 py-2 text-right">
                    {stats.tally[pn]!.hl}
                  </td>
                  <td className="border-r border-slate-300 px-4 py-2 text-right">
                    {stats.tally[pn]!.hm}
                  </td>
                  <td className="px-4 py-2 text-right font-semibold text-indigo-700">
                    {stats.tally[pn]!.total}
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot className="bg-blue-100 text-sm font-bold text-slate-800">
              <tr>
                <td className="border-t border-r border-slate-300 px-4 py-3">
                  Grand Total
                </td>
                <td className="border-t border-r border-slate-300 px-4 py-3 text-right">
                  {stats.grandPL}
                </td>
                <td className="border-t border-r border-slate-300 px-4 py-3 text-right">
                  {stats.grandHL}
                </td>
                <td className="border-t border-r border-slate-300 px-4 py-3 text-right">
                  {stats.grandHM}
                </td>
                <td className="border-t border-slate-300 px-4 py-3 text-right text-indigo-800">
                  {stats.grandTotal}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>

        {/* Table 2: Precinct Total */}
        <div className="lg:col-span-3 overflow-x-auto rounded-lg border border-slate-300 shadow-sm">
          <table className="w-full text-left text-sm text-slate-700">
            <thead className="bg-slate-100 text-xs font-semibold uppercase tracking-wider text-slate-600">
              <tr>
                <th className="border-b border-r border-slate-300 px-4 py-3">
                  Row Labels
                </th>
                <th className="border-b border-slate-300 px-4 py-3 text-right">
                  Count of Precinct
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 bg-white">
              {stats.sortedPrecincts.map((pn, idx) => (
                <tr
                  key={pn}
                  className={idx % 2 === 0 ? "bg-white" : "bg-slate-50"}
                >
                  <td className="border-r border-slate-300 px-4 py-2 font-medium">
                    {pn}
                  </td>
                  <td className="px-4 py-2 text-right">
                    {stats.tally[pn]!.rawCount}
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot className="bg-blue-100 text-sm font-bold text-slate-800">
              <tr>
                <td className="border-t border-r border-slate-300 px-4 py-3">
                  Grand Total
                </td>
                <td className="border-t border-slate-300 px-4 py-3 text-right">
                  {stats.grandRawCount}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>

        {/* Registry-derived summary */}
        <div className="flex flex-col gap-4 lg:col-span-3">
          <div className="flex flex-col overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
            <div className="flex items-center gap-2 bg-slate-50 px-4 py-3 border-b border-slate-100">
              <UserRoundCheck className="h-4 w-4 text-slate-500" />
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-600">
                Registered Members
              </h3>
            </div>
            <div className="p-4 text-center">
              <div className="text-4xl font-black tracking-tight text-slate-800">
                {stats.grandRawCount.toLocaleString()}
              </div>
              <p className="mt-2 text-xs font-medium text-slate-500">
                All imported resident records
              </p>
            </div>
          </div>

          <div className="flex flex-col overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
            <div className="flex items-center gap-2 bg-slate-50 px-4 py-3 border-b border-slate-100">
              <UserRoundX className="h-4 w-4 text-slate-500" />
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-600">
                Unassigned Records
              </h3>
            </div>
            <div className="p-4 text-center">
              <div
                className={`text-4xl font-black tracking-tight ${unassignedMemberCount > 0 ? "text-amber-600" : "text-emerald-600"}`}
              >
                {unassignedMemberCount.toLocaleString()}
              </div>
              <p className="mt-2 text-xs font-medium text-slate-500">
                {unassignedMemberCount === 0
                  ? "All records are assigned"
                  : "No PL, HL, or HM indicator"}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
