import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useMemo, useEffect } from "react";
import { Landmark, Pencil, MapPin } from "lucide-react";
import { useStore } from "@/lib/store";

export const Route = createFileRoute("/_authenticated/puroks")({
  head: () => ({
    meta: [
      { title: "Puroks — Barangay RMS" },
      { name: "description", content: "All puroks grouped by barangay." },
    ],
  }),
  component: PuroksPage,
});

function PuroksPage() {
  const store = useStore();
  const { state } = store;
  const navigate = useNavigate();

  useEffect(() => {
    if (state.session?.role !== "Admin") {
      void navigate({ to: "/my-dashboard" });
    }
  }, [state.session, navigate]);

  const { barangays, puroks, households, members } = state;

  return (
    <>
      <header className="border-b border-slate-200 bg-white px-6 py-4">
        <h1 className="text-lg font-semibold">Puroks</h1>
        <p className="text-sm text-slate-500">All puroks grouped by barangay</p>
      </header>

      <div className="space-y-8 p-6">
        {barangays.map((b) => {
          const bPuroks = puroks.filter((p) => p.barangayId === b.id);
          return (
            <div key={b.id}>
              <div className="mb-4 flex items-center gap-2">
                <Landmark className="h-4 w-4 text-amber-600" />
                <h2 className="font-semibold text-slate-700">{b.name}</h2>
                <span className="text-xs text-slate-400">— {b.barangayCaptainName}</span>
              </div>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {bPuroks.map((p) => (
                  <PurokCard
                    key={p.id}
                    purok={p}
                    households={households}
                    members={members}
                    onViewMembers={() => void navigate({ to: "/members", search: { purok: String(p.id) } })}
                  />
                ))}
                {bPuroks.length === 0 && (
                  <p className="col-span-full py-8 text-center text-sm text-slate-400">No puroks in this barangay.</p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
}

import type { Purok, Household, Member } from "@/lib/types";

function PurokCard({ purok, households: allHH, members: allMembers, onViewMembers }: {
  purok: Purok;
  households: Household[];
  members: Member[];
  onViewMembers: () => void;
}) {
  const stats = useMemo(() => {
    const pHH = allHH.filter((h) => h.purokId === purok.id);
    const pMembers = allMembers.filter((m) => pHH.some((h) => h.id === m.householdId));
    return {
      households: pHH.length,
      members: pMembers.length,
      sc: pMembers.filter((m) => m.sc).length,
      pwd: pMembers.filter((m) => m.pwd).length,
      ip: pMembers.filter((m) => m.ip).length,
    };
  }, [purok.id, allHH, allMembers]);

  return (
    <div className="group rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition-all hover:border-slate-300 hover:shadow-md">
      <div className="mb-4 flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2">
            <MapPin className="h-4 w-4 text-indigo-500" />
            <p className="font-semibold">{purok.name}</p>
          </div>
          <p className="mt-0.5 text-xs text-slate-500">Leader: {purok.purokLeaderName}</p>
        </div>
      </div>
      <div className="mb-4 grid grid-cols-2 gap-2 text-center">
        <div className="rounded-lg bg-slate-50 py-2.5">
          <p className="text-lg font-bold">{stats.households}</p>
          <p className="text-[11px] text-slate-500">Households</p>
        </div>
        <div className="rounded-lg bg-slate-50 py-2.5">
          <p className="text-lg font-bold">{stats.members}</p>
          <p className="text-[11px] text-slate-500">Members</p>
        </div>
      </div>
      <div className="mb-4 flex flex-wrap gap-1.5">
        {stats.sc > 0 && <span className="inline-flex items-center rounded-full bg-blue-100 px-2 py-0.5 text-[11px] font-semibold text-blue-800 ring-1 ring-inset ring-blue-600/20">SC: {stats.sc}</span>}
        {stats.pwd > 0 && <span className="inline-flex items-center rounded-full bg-green-100 px-2 py-0.5 text-[11px] font-semibold text-green-800 ring-1 ring-inset ring-green-600/20">PWD: {stats.pwd}</span>}
        {stats.ip > 0 && <span className="inline-flex items-center rounded-full bg-orange-100 px-2 py-0.5 text-[11px] font-semibold text-orange-800 ring-1 ring-inset ring-orange-600/20">IP: {stats.ip}</span>}
        {stats.sc === 0 && stats.pwd === 0 && stats.ip === 0 && <span className="text-xs text-slate-300">No sector tags</span>}
      </div>
      <button onClick={onViewMembers} className="w-full rounded-lg border border-slate-200 py-2 text-xs font-medium text-slate-600 transition-colors hover:bg-slate-50">
        View Members →
      </button>
    </div>
  );
}
