import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo } from "react";
import {
  Accessibility,
  Flag,
  Home,
  Landmark,
  MapPin,
  Users,
} from "lucide-react";
import { useStore } from "@/lib/store";
import { StatCard } from "@/components/stat-card";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip, Legend, BarChart, Bar, XAxis, YAxis, CartesianGrid } from "recharts";

export const Route = createFileRoute("/_authenticated/dashboard")({
  head: () => ({
    meta: [
      { title: "Dashboard — Barangay RMS" },
      {
        name: "description",
        content: "Overview of barangay resident statistics.",
      },
    ],
  }),
  component: DashboardPage,
});

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

  const teamDistributionData = useMemo(() => {
    const teamCounts: Record<string, number> = { Unassigned: 0 };
    members.forEach(m => {
      if (m.teamId) {
        const team = state.teams.find(t => t.id === m.teamId);
        const name = team?.team_name || "Unknown Team";
        teamCounts[name] = (teamCounts[name] || 0) + 1;
      } else {
        teamCounts["Unassigned"] = (teamCounts["Unassigned"] || 0) + 1;
      }
    });

    return Object.entries(teamCounts)
      .filter(([_, count]) => count > 0)
      .map(([name, count]) => ({ name, value: count }));
  }, [members, state.teams]);

  const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#64748b'];

  return (
    <>
      <header className="border-b border-slate-200 bg-white px-6 py-4">
        <h1 className="text-lg font-semibold">Overview</h1>
        <p className="text-sm text-slate-500">
          Resident and household records across all puroks
        </p>
      </header>

      <div className="space-y-6 p-6">
        {/* Stat cards */}
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4 xl:grid-cols-7">
          <StatCard
            icon={<Landmark className="h-5 w-5 text-amber-600" />}
            label="Barangays"
            value={barangays.length}
            accent="hsl(40, 80%, 50%)"
          />
          <StatCard
            icon={<MapPin className="h-5 w-5 text-indigo-600" />}
            label="Puroks"
            value={puroks.length}
            accent="hsl(240, 60%, 55%)"
            onClick={() => void navigate({ to: "/puroks" })}
          />
          <StatCard
            icon={<Home className="h-5 w-5 text-emerald-600" />}
            label="Households"
            value={households.length}
            accent="hsl(160, 60%, 45%)"
          />
          <StatCard
            icon={<Users className="h-5 w-5 text-sky-600" />}
            label="Members"
            value={members.length}
            accent="hsl(200, 70%, 50%)"
            onClick={() => void navigate({ to: "/members" })}
          />
          <StatCard
            icon={<Flag className="h-5 w-5 text-blue-600" />}
            label="Senior Citizens"
            value={scCount}
            accent="hsl(220, 70%, 55%)"
          />
          <StatCard
            icon={<Accessibility className="h-5 w-5 text-green-600" />}
            label="PWD"
            value={pwdCount}
            accent="hsl(160, 60%, 45%)"
          />
          <StatCard
            icon={<Users className="h-5 w-5 text-orange-600" />}
            label="Indigenous"
            value={ipCount}
            accent="hsl(30, 80%, 55%)"
          />
        </div>

        {teamDistributionData.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
            <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
              <h2 className="mb-6 text-sm font-semibold text-slate-800">Total Members by Team</h2>
              <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={teamDistributionData}
                      cx="50%"
                      cy="50%"
                      innerRadius={80}
                      outerRadius={110}
                      paddingAngle={2}
                      dataKey="value"
                      stroke="none"
                    >
                      {teamDistributionData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <RechartsTooltip 
                      formatter={(value: number) => [value, "Members"]}
                      contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                    />
                    <Legend verticalAlign="bottom" height={36} iconType="circle" />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
            <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
              <h2 className="mb-6 text-sm font-semibold text-slate-800">Team Distribution Breakdown</h2>
              <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={teamDistributionData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} />
                    <RechartsTooltip 
                      cursor={{ fill: '#f1f5f9' }}
                      formatter={(value: number) => [value, "Members"]}
                      contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                    />
                    <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                      {teamDistributionData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
