import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { RefreshCw, Users } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { fetchAllRows } from "@/lib/fetch-all-rows";
import { buildPrecinctStats, type PrecinctMember } from "@/lib/precinct-stats";
import { Button } from "@/components/ui/button";

export function PrecinctTally() {
  const query = useQuery({
    queryKey: ["precinct-tally"],
    queryFn: ({ signal }) =>
      fetchAllRows<PrecinctMember>((from, to) =>
        supabase
          .from("members")
          .select(
            "id,precinct,pn,is_purok_leader_indicator,is_household_leader,is_household_member",
            from === 0 ? { count: "exact" } : {},
          )
          .order("id")
          .range(from, to)
          .abortSignal(signal),
      ),
    staleTime: 0,
    refetchOnMount: "always",
    refetchOnWindowFocus: true,
    retry: 1,
  });
  const stats = useMemo(
    () => buildPrecinctStats(query.data ?? []),
    [query.data],
  );

  return (
    <section
      aria-labelledby="precinct-tally-title"
      className="mt-8 rounded-xl border border-slate-200 bg-white p-6 shadow-sm"
    >
      <div className="mb-5 flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 pb-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600">
            <Users className="h-5 w-5" />
          </div>
          <div>
            <h2
              id="precinct-tally-title"
              className="text-lg font-bold text-slate-800"
            >
              Precinct Tally &amp; Analytics Dashboard
            </h2>
            <p className="text-sm text-slate-500">
              Counts from saved member records in the database.
            </p>
          </div>
        </div>
        <Button
          variant="outline"
          size="sm"
          disabled={query.isFetching}
          onClick={() => void query.refetch()}
        >
          <RefreshCw
            className={`h-4 w-4 ${query.isFetching ? "animate-spin" : ""}`}
          />
          {query.isFetching ? "Refreshing…" : "Refresh database"}
        </Button>
      </div>
      {query.isError && (
        <p
          role="alert"
          className="mb-4 rounded-lg bg-rose-50 p-3 text-sm text-rose-700"
        >
          Could not refresh the tally.{" "}
          {query.data
            ? "Showing the last successful result."
            : "Use Refresh database to try again."}
        </p>
      )}
      {query.isPending ? (
        <p role="status" className="py-8 text-center text-sm text-slate-500">
          Reading precinct records from the database…
        </p>
      ) : query.data ? (
        <>
          <div className="mb-5 grid gap-3 sm:grid-cols-3">
            {(
              [
                ["Registered members", stats.totals.total],
                ["With a role", stats.totals.total - stats.totals.unassigned],
                ["No role assigned", stats.totals.unassigned],
              ] as const
            ).map(([label, count]) => (
              <div
                key={label}
                className="rounded-lg border border-slate-200 bg-slate-50 p-4"
              >
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  {label}
                </p>
                <p className="mt-2 text-2xl font-bold text-slate-900">
                  {count.toLocaleString()}
                </p>
              </div>
            ))}
          </div>
          <div className="overflow-x-auto rounded-lg border border-slate-200">
            <table className="w-full text-left text-sm text-slate-700">
              <caption className="sr-only">
                Database member counts by precinct and saved role flags
              </caption>
              <thead className="bg-slate-100 text-xs uppercase tracking-wide text-slate-600">
                <tr>
                  {[
                    "Precinct",
                    "PL",
                    "HL",
                    "HM",
                    "No role",
                    "Total records",
                  ].map((heading, index) => (
                    <th
                      scope="col"
                      key={heading}
                      className={`whitespace-nowrap px-4 py-3 ${index ? "text-right" : ""}`}
                    >
                      {heading}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {stats.rows.map((row) => (
                  <tr key={row.precinct} className="even:bg-slate-50">
                    <th scope="row" className="px-4 py-2.5 font-medium">
                      {row.precinct}
                    </th>
                    {[row.pl, row.hl, row.hm, row.unassigned, row.total].map(
                      (count, index) => (
                        <td
                          key={index}
                          className={`px-4 py-2.5 text-right tabular-nums ${index === 4 ? "font-semibold text-indigo-700" : ""}`}
                        >
                          {count.toLocaleString()}
                        </td>
                      ),
                    )}
                  </tr>
                ))}
                {stats.rows.length === 0 && (
                  <tr>
                    <td
                      colSpan={6}
                      className="px-4 py-8 text-center text-slate-500"
                    >
                      No member records in the database.
                    </td>
                  </tr>
                )}
              </tbody>
              <tfoot className="border-t border-slate-200 bg-indigo-50 font-semibold">
                <tr>
                  <th scope="row" className="px-4 py-3">
                    Grand total
                  </th>
                  {[
                    stats.totals.pl,
                    stats.totals.hl,
                    stats.totals.hm,
                    stats.totals.unassigned,
                    stats.totals.total,
                  ].map((count, index) => (
                    <td
                      key={index}
                      className="px-4 py-3 text-right tabular-nums"
                    >
                      {count.toLocaleString()}
                    </td>
                  ))}
                </tr>
              </tfoot>
            </table>
          </div>
          <p className="mt-3 text-xs text-slate-500">
            PL = Purok Leader · HL = Household Leader · HM = Household Member.
            Role columns count each saved flag; one resident may have more than
            one role. Total records counts each resident once.
          </p>
          <p className="mt-2 text-xs text-slate-400">
            Last read: {new Date(query.dataUpdatedAt).toLocaleString()}
          </p>
        </>
      ) : null}
    </section>
  );
}
