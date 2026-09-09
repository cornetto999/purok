import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useMemo, useEffect } from "react";
import {
  Accessibility, Flag, Home, Landmark, MapPin, Users,
} from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend,
} from "recharts";
import { useStore } from "@/lib/store";
import { StatCard } from "@/components/stat-card";

export const Route = createFileRoute("/_authenticated/dashboard")({
  head: () => ({
    meta: [
      { title: "Dashboard — Barangay RMS" },
      { name: "description", content: "Overview of barangay resident statistics." },
    ],
  }),
  component: DashboardPage,
});

const CHART_COLORS = [
  "hsl(220, 70%, 55%)", "hsl(160, 60%, 45%)", "hsl(30, 80%, 55%)",
  "hsl(280, 60%, 55%)", "hsl(350, 70%, 55%)", "hsl(190, 60%, 50%)",
];

function DashboardPage() {
  const store = useStore();
  const { state } = store;
  const navigate = useNavigate();

  useEffect(() => {
    if (state.session?.role !== "Admin") {
      void navigate({ to: "/my-dashboard" });
    }
  }, [state.session, navigate]);

  const { barangays, puroks, households, members } = state;

  const scCount = members.filter((m) => m.sc).length;
  const pwdCount = members.filter((m) => m.pwd).length;
  const ipCount = members.filter((m) => m.ip).length;

  // Members per purok (bar chart)
  const membersPerPurok = useMemo(() => {
    const hhByPurok = new Map<number, Set<number>>();
    for (const h of households) {
      if (!hhByPurok.has(h.purokId)) hhByPurok.set(h.purokId, new Set());
      hhByPurok.get(h.purokId)!.add(h.id);
    }
    return puroks.map((p) => {
      const hhIds = hhByPurok.get(p.id) ?? new Set();
      const count = members.filter((m) => hhIds.has(m.householdId)).length;
      return { name: p.name.split(" - ")[0]!, count };
    });
  }, [puroks, households, members]);

  // Sector distribution (pie chart)
  const sectorData = useMemo(() => [
    { name: "Senior Citizen", value: scCount, color: "hsl(220, 70%, 55%)" },
    { name: "PWD", value: pwdCount, color: "hsl(160, 60%, 45%)" },
    { name: "Indigenous", value: ipCount, color: "hsl(30, 80%, 55%)" },
  ].filter((d) => d.value > 0), [scCount, pwdCount, ipCount]);

  // Age distribution (bar chart)
  const ageData = useMemo(() => {
    const buckets = [
      { range: "0–17", min: 0, max: 17, count: 0 },
      { range: "18–30", min: 18, max: 30, count: 0 },
      { range: "31–45", min: 31, max: 45, count: 0 },
      { range: "46–60", min: 46, max: 60, count: 0 },
      { range: "61+", min: 61, max: 999, count: 0 },
    ];
    for (const m of members) {
      const bucket = buckets.find((b) => m.age >= b.min && m.age <= b.max);
      if (bucket) bucket.count++;
    }
    return buckets.map((b) => ({ name: b.range, count: b.count }));
  }, [members]);

  // Barangay summary cards
  const barangaySummaries = useMemo(() =>
    barangays.map((b) => {
      const bPuroks = puroks.filter((p) => p.barangayId === b.id);
      const bHouseholds = households.filter((h) => bPuroks.some((p) => p.id === h.purokId));
      const bMembers = members.filter((m) => bHouseholds.some((h) => h.id === m.householdId));
      return { ...b, purokCount: bPuroks.length, householdCount: bHouseholds.length, memberCount: bMembers.length };
    }), [barangays, puroks, households, members]);

  return (
    <>
      <header className="border-b border-slate-200 bg-white px-6 py-4">
        <h1 className="text-lg font-semibold">Overview</h1>
        <p className="text-sm text-slate-500">Resident and household records across all puroks</p>
      </header>

      <div className="space-y-6 p-6">
        {/* Stat cards */}
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4 xl:grid-cols-7">
          <StatCard icon={<Landmark className="h-5 w-5 text-amber-600" />} label="Barangays" value={barangays.length} accent="hsl(40, 80%, 50%)" />
          <StatCard icon={<MapPin className="h-5 w-5 text-indigo-600" />} label="Puroks" value={puroks.length} accent="hsl(240, 60%, 55%)" onClick={() => void navigate({ to: "/puroks" })} />
          <StatCard icon={<Home className="h-5 w-5 text-emerald-600" />} label="Households" value={households.length} accent="hsl(160, 60%, 45%)" />
          <StatCard icon={<Users className="h-5 w-5 text-sky-600" />} label="Members" value={members.length} accent="hsl(200, 70%, 50%)" onClick={() => void navigate({ to: "/members" })} />
          <StatCard icon={<Flag className="h-5 w-5 text-blue-600" />} label="Senior Citizens" value={scCount} accent="hsl(220, 70%, 55%)" />
          <StatCard icon={<Accessibility className="h-5 w-5 text-green-600" />} label="PWD" value={pwdCount} accent="hsl(160, 60%, 45%)" />
          <StatCard icon={<Users className="h-5 w-5 text-orange-600" />} label="Indigenous" value={ipCount} accent="hsl(30, 80%, 55%)" />
        </div>

        {/* Charts row */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {/* Members per Purok */}
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="mb-4 text-sm font-semibold text-slate-700">Members per Purok</h2>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={membersPerPurok} margin={{ top: 5, right: 10, left: -10, bottom: 5 }}>
                  <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip contentStyle={{ borderRadius: "8px", fontSize: "12px" }} />
                  <Bar dataKey="count" fill="hsl(220, 70%, 55%)" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Sector distribution */}
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="mb-4 text-sm font-semibold text-slate-700">Sector Distribution</h2>
            <div className="h-64">
              {sectorData.length === 0 ? (
                <div className="flex h-full items-center justify-center text-sm text-slate-400">No sector data</div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={sectorData} cx="50%" cy="50%" innerRadius={50} outerRadius={85} paddingAngle={4} dataKey="value" label={({ name, value }) => `${name}: ${value}`}>
                      {sectorData.map((entry, i) => (
                        <Cell key={entry.name} fill={entry.color || CHART_COLORS[i % CHART_COLORS.length]} />
                      ))}
                    </Pie>
                    <Legend iconType="circle" wrapperStyle={{ fontSize: "12px" }} />
                    <Tooltip contentStyle={{ borderRadius: "8px", fontSize: "12px" }} />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>

          {/* Age distribution */}
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="mb-4 text-sm font-semibold text-slate-700">Age Distribution</h2>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={ageData} margin={{ top: 5, right: 10, left: -10, bottom: 5 }}>
                  <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip contentStyle={{ borderRadius: "8px", fontSize: "12px" }} />
                  <Bar dataKey="count" fill="hsl(280, 60%, 55%)" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Barangay summary cards */}
          <div className="space-y-4">
            <h2 className="text-sm font-semibold text-slate-700">Barangay Summary</h2>
            {barangaySummaries.map((b) => (
              <div key={b.id} className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                <div className="mb-3">
                  <p className="font-semibold">{b.name}</p>
                  <p className="text-xs text-slate-500">Captain: {b.barangayCaptainName}</p>
                </div>
                <div className="grid grid-cols-3 gap-3 text-center">
                  {([["Puroks", b.purokCount], ["Households", b.householdCount], ["Members", b.memberCount]] as const).map(([label, val]) => (
                    <div key={label} className="rounded-lg bg-slate-50 py-2.5">
                      <p className="text-xl font-bold">{val}</p>
                      <p className="text-[11px] text-slate-500">{label}</p>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
