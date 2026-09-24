import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo } from "react";
import {
  Bar,
  BarChart,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { useStore } from "@/lib/store";
import { PrecinctTally } from "@/components/precinct-tally";
import { useTargetVotes } from "@/lib/use-target-votes";
import { Target, TrendingUp } from "lucide-react";

export const Route = createFileRoute("/_authenticated/reports")({
  head: () => ({
    meta: [
      { title: "Reports — Barangay RMS" },
      {
        name: "description",
        content: "Barangay member counts and demographic reports.",
      },
    ],
  }),
  component: ReportsPage,
});

const CHART_COLORS = [
  "hsl(220, 70%, 55%)",
  "hsl(160, 60%, 45%)",
  "hsl(30, 80%, 55%)",
];

function ReportsPage() {
  const { state } = useStore();
  const navigate = useNavigate();
  const { barangays, puroks, households, members } = state;
  const { targets, updateOverall, updateBarangay } = useTargetVotes();

  useEffect(() => {
    if (state.session?.role !== "Admin") void navigate({ to: "/my-dashboard" });
  }, [navigate, state.session]);

  const totalMembers = members.length;
  const overallTarget = targets.overall;
  const overallProgress = overallTarget > 0 ? (totalMembers / overallTarget) * 100 : 0;

  const membersPerPurok = useMemo(() => {
    const householdIdsByPurok = new Map<number, Set<number>>();
    for (const household of households) {
      const ids =
        householdIdsByPurok.get(household.purokId) ?? new Set<number>();
      ids.add(household.id);
      householdIdsByPurok.set(household.purokId, ids);
    }
    return puroks.map((purok) => ({
      name: purok.name.split(" - ")[0] ?? purok.name,
      count: members.filter((member) =>
        householdIdsByPurok.get(purok.id)?.has(member.householdId),
      ).length,
    }));
  }, [households, members, puroks]);

  const sectorData = useMemo(
    () =>
      [
        {
          name: "Senior Citizen",
          value: members.filter((member) => member.sc).length,
        },
        { name: "PWD", value: members.filter((member) => member.pwd).length },
        {
          name: "Indigenous",
          value: members.filter((member) => member.ip).length,
        },
      ].filter((item) => item.value > 0),
    [members],
  );

  const ageData = useMemo(() => {
    const buckets = [
      { name: "0–17", min: 0, max: 17, count: 0 },
      { name: "18–30", min: 18, max: 30, count: 0 },
      { name: "31–45", min: 31, max: 45, count: 0 },
      { name: "46–60", min: 46, max: 60, count: 0 },
      { name: "61+", min: 61, max: Infinity, count: 0 },
    ];
    for (const member of members) {
      const bucket = buckets.find(
        (item) => member.age >= item.min && member.age <= item.max,
      );
      if (bucket) bucket.count += 1;
    }
    return buckets;
  }, [members]);

  const barangaySummaries = useMemo(
    () =>
      barangays.map((barangay) => {
        const barangayPuroks = puroks.filter(
          (purok) => purok.barangayId === barangay.id,
        );
        const purokIds = new Set(barangayPuroks.map((purok) => purok.id));
        const barangayHouseholds = households.filter((household) =>
          purokIds.has(household.purokId),
        );
        const householdIds = new Set(
          barangayHouseholds.map((household) => household.id),
        );
        return {
          ...barangay,
          purokCount: barangayPuroks.length,
          householdCount: barangayHouseholds.length,
          memberCount: members.filter((member) =>
            householdIds.has(member.householdId),
          ).length,
        };
      }),
    [barangays, households, members, puroks],
  );

  return (
    <>
      <header className="border-b border-slate-200/80 bg-white/90 px-6 py-5 backdrop-blur-sm">
        <h1 className="text-xl font-bold tracking-tight text-slate-900">Reports</h1>
        <p className="mt-0.5 text-sm text-slate-500">
          Counts, demographic breakdowns, and precinct analytics
        </p>
      </header>
      <div className="space-y-6 p-6">
        
        {/* Overall Target Votes Dashboard */}
        <section className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-4 w-full md:w-auto">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
              <Target className="h-6 w-6" />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wider">Overall Target Votes</h2>
              <div className="flex items-end gap-2 mt-1">
                <input
                  type="number"
                  value={overallTarget || ""}
                  onChange={(e) => updateOverall(Number(e.target.value))}
                  placeholder="Set target..."
                  className="text-3xl font-black tracking-tight text-slate-800 bg-transparent border-none p-0 focus:ring-0 w-32 placeholder:text-slate-300"
                />
              </div>
            </div>
          </div>
          
          <div className="flex-1 w-full max-w-xl flex flex-col justify-center">
            <div className="flex justify-between text-sm font-medium mb-2">
              <span className="text-slate-600">Progress</span>
              <span className={overallProgress >= 100 ? "text-emerald-600 font-bold" : "text-indigo-600 font-bold"}>
                {totalMembers.toLocaleString()} / {overallTarget.toLocaleString()} ({overallProgress.toFixed(1)}%)
              </span>
            </div>
            <div className="h-3 w-full bg-slate-100 rounded-full overflow-hidden">
              <div 
                className={`h-full transition-all duration-500 ${overallProgress >= 100 ? 'bg-emerald-500' : 'bg-indigo-500'}`}
                style={{ width: `${Math.min(overallProgress, 100)}%` }}
              />
            </div>
          </div>
        </section>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <ReportCard title="Members per Purok">
            <BarChart
              data={membersPerPurok}
              margin={{ top: 5, right: 10, left: -10, bottom: 5 }}
            >
              <XAxis dataKey="name" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip
                contentStyle={{ borderRadius: "8px", fontSize: "12px" }}
              />
              <Bar
                dataKey="count"
                fill="hsl(220, 70%, 55%)"
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ReportCard>
          <ReportCard
            title="Sector Distribution"
            empty={sectorData.length === 0}
          >
            {sectorData.length === 0 ? (
              <EmptyChart />
            ) : (
              <PieChart>
                <Pie
                  data={sectorData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={85}
                  paddingAngle={4}
                  dataKey="value"
                  label={({ name, value }) => `${name}: ${value}`}
                >
                  {sectorData.map((item, index) => (
                    <Cell key={item.name} fill={CHART_COLORS[index]} />
                  ))}
                </Pie>
                <Legend iconType="circle" wrapperStyle={{ fontSize: "12px" }} />
                <Tooltip
                  contentStyle={{ borderRadius: "8px", fontSize: "12px" }}
                />
              </PieChart>
            )}
          </ReportCard>
          <ReportCard title="Age Distribution">
            <BarChart
              data={ageData}
              margin={{ top: 5, right: 10, left: -10, bottom: 5 }}
            >
              <XAxis dataKey="name" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip
                contentStyle={{ borderRadius: "8px", fontSize: "12px" }}
              />
              <Bar
                dataKey="count"
                fill="hsl(280, 60%, 55%)"
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ReportCard>
          <section className="space-y-4">
            <h2 className="text-sm font-semibold text-slate-700">
              Barangay Summary
            </h2>
            {barangaySummaries.map((barangay) => {
              const target = targets.barangays[barangay.id] || 0;
              const progress = target > 0 ? (barangay.memberCount / target) * 100 : 0;
              return (
              <div
                key={barangay.id}
                className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm flex flex-col justify-between"
              >
                <div>
                  <div className="flex justify-between items-start mb-1">
                    <p className="font-semibold text-slate-800">{barangay.name}</p>
                    <div className="flex items-center gap-1 bg-slate-100 rounded-md px-2 py-1">
                      <TrendingUp className="h-3 w-3 text-slate-500" />
                      <input 
                        type="number" 
                        value={target || ""}
                        onChange={(e) => updateBarangay(barangay.id, Number(e.target.value))}
                        placeholder="Target..."
                        className="w-16 bg-transparent border-none p-0 text-xs font-bold text-slate-700 focus:ring-0 text-right placeholder:text-slate-400 placeholder:font-normal"
                      />
                    </div>
                  </div>
                  <p className="mb-4 text-xs text-slate-500">
                    Captain: {barangay.barangayCaptainName}
                  </p>
                  
                  {/* Progress Bar */}
                  <div className="mb-4">
                    <div className="flex justify-between text-[10px] font-medium text-slate-500 mb-1.5 uppercase tracking-wide">
                      <span>Progress</span>
                      <span className={progress >= 100 ? "text-emerald-600" : "text-indigo-600"}>
                        {progress.toFixed(1)}%
                      </span>
                    </div>
                    <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                      <div 
                        className={`h-full transition-all duration-500 ${progress >= 100 ? 'bg-emerald-500' : 'bg-indigo-500'}`}
                        style={{ width: `${Math.min(progress, 100)}%` }}
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3 text-center">
                  {(
                    [
                      ["Puroks", barangay.purokCount],
                      ["Households", barangay.householdCount],
                      ["Members", barangay.memberCount],
                    ] as const
                  ).map(([label, count]) => (
                    <div key={label} className="rounded-lg bg-slate-50 py-2.5 border border-slate-100">
                      <p className="text-lg font-bold text-slate-700">{count}</p>
                      <p className="text-[10px] font-medium uppercase tracking-wider text-slate-500">{label}</p>
                    </div>
                  ))}
                </div>
              </div>
            )})}
          </section>
        </div>
        <PrecinctTally />
      </div>
    </>
  );
}

function ReportCard({
  title,
  children,
  empty = false,
}: {
  title: string;
  children: React.ReactNode;
  empty?: boolean;
}) {
  return (
    <section className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm">
      <h2 className="mb-4 text-sm font-semibold text-slate-700">{title}</h2>
      <div className="h-64">
        {empty ? (
          children
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            {children as React.ReactElement}
          </ResponsiveContainer>
        )}
      </div>
    </section>
  );
}

function EmptyChart() {
  return (
    <div className="flex h-full items-center justify-center text-sm text-slate-400">
      No sector data
    </div>
  );
}
