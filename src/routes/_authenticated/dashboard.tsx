import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
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
      </div>
    </>
  );
}
