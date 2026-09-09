import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useMemo, useState, useEffect } from "react";
import {
  Accessibility, Flag, Home, LogOut, MapPin, Plus, Users,
} from "lucide-react";
import { useStore } from "@/lib/store";
import { memberFullName, type Member } from "@/lib/types";
import { StatCard } from "@/components/stat-card";
import { MemberFormModal } from "@/components/member-form-modal";

export const Route = createFileRoute("/_authenticated/my-dashboard")({
  head: () => ({
    meta: [
      { title: "My Dashboard — Barangay RMS" },
      { name: "description", content: "Scoped view for Purok and Household Leaders." },
    ],
  }),
  component: MyDashboardPage,
});

function sectorBadges(m: Member) {
  const badges: { label: string; cls: string }[] = [];
  if (m.sc)  badges.push({ label: "SC",  cls: "bg-blue-100 text-blue-800 ring-blue-600/20" });
  if (m.pwd) badges.push({ label: "PWD", cls: "bg-green-100 text-green-800 ring-green-600/20" });
  if (m.ip)  badges.push({ label: "IP",  cls: "bg-orange-100 text-orange-800 ring-orange-600/20" });
  return badges;
}

function MyDashboardPage() {
  const store = useStore();
  const { state, logout } = store;
  const navigate = useNavigate();
  const session = state.session!;
  const [showAddMember, setShowAddMember] = useState(false);

  useEffect(() => {
    if (session.role === "Admin") {
      void navigate({ to: "/dashboard" });
    }
  }, [session.role, navigate]);

  const isPurokLeader = session.role === "Purok Leader";
  const isHouseholdLeader = session.role === "Household Leader";

  // Scoped data
  const scopedHouseholds = useMemo(() => {
    if (isPurokLeader) return state.households.filter((h) => h.purokId === session.linkedEntityId);
    if (isHouseholdLeader) return state.households.filter((h) => h.id === session.linkedEntityId);
    return [];
  }, [state.households, isPurokLeader, isHouseholdLeader, session.linkedEntityId]);

  const scopedMembers = useMemo(() => {
    const hhIds = new Set(scopedHouseholds.map((h) => h.id));
    return state.members.filter((m) => hhIds.has(m.householdId));
  }, [state.members, scopedHouseholds]);

  const scopeLabel = useMemo(() => {
    if (isPurokLeader) {
      const p = state.puroks.find((pk) => pk.id === session.linkedEntityId);
      return p?.name ?? "Purok";
    }
    const h = state.households.find((hh) => hh.id === session.linkedEntityId);
    return h?.address ?? "Household";
  }, [isPurokLeader, state.puroks, state.households, session.linkedEntityId]);

  const scCount = scopedMembers.filter((m) => m.sc).length;
  const pwdCount = scopedMembers.filter((m) => m.pwd).length;
  const ipCount = scopedMembers.filter((m) => m.ip).length;

  return (
    <>
      <header className="border-b border-slate-200 bg-white px-6 py-4">
        <h1 className="text-lg font-semibold">My Dashboard</h1>
        <p className="text-sm text-slate-500">Signed in as {session.role} · {scopeLabel}</p>
      </header>

      <div className="space-y-6 p-6">
        {/* Header card */}
        <div className="flex items-center justify-between rounded-xl border border-emerald-200 bg-gradient-to-r from-emerald-50 to-teal-50 px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-600 text-white shadow-sm">
              {isPurokLeader ? <MapPin className="h-5 w-5" /> : <Home className="h-5 w-5" />}
            </div>
            <div>
              <p className="font-semibold text-emerald-900">{session.displayName}</p>
              <p className="text-xs text-emerald-700">{session.role} · {scopeLabel}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowAddMember(true)}
              className="flex items-center gap-1.5 rounded-lg bg-emerald-600 px-3 py-2 text-xs font-semibold text-white transition-colors hover:bg-emerald-700"
            >
              <Plus className="h-3.5 w-3.5" /> Add Member
            </button>
            <button
              onClick={logout}
              className="flex items-center gap-1.5 rounded-lg border border-emerald-300 px-3 py-2 text-xs font-medium text-emerald-800 transition-colors hover:bg-emerald-100"
            >
              <LogOut className="h-3.5 w-3.5" /> Sign Out
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          {isPurokLeader && (
            <StatCard icon={<Home className="h-5 w-5 text-indigo-600" />} label="Households" value={scopedHouseholds.length} />
          )}
          <StatCard icon={<Users className="h-5 w-5 text-sky-600" />} label="Total Members" value={scopedMembers.length} />
          <StatCard icon={<Flag className="h-5 w-5 text-blue-600" />} label="Senior Citizens" value={scCount} />
          <StatCard icon={<Accessibility className="h-5 w-5 text-green-600" />} label="PWD" value={pwdCount} />
          {isHouseholdLeader && (
            <StatCard icon={<Users className="h-5 w-5 text-orange-500" />} label="Indigenous (IP)" value={ipCount} />
          )}
        </div>

        {/* Member list */}
        <h2 className="text-sm font-semibold text-slate-700">Members ({scopedMembers.length})</h2>

        {/* Purok leader: grouped by household */}
        {isPurokLeader && (
          <div className="space-y-4">
            {scopedHouseholds.map((h) => {
              const hMembers = state.members.filter((m) => m.householdId === h.id);
              return (
                <div key={h.id} className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
                  <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50 px-4 py-3">
                    <div>
                      <span className="text-sm font-semibold">{h.householdLeaderName}</span>
                      <span className="ml-2 text-xs text-slate-500">{h.address}</span>
                    </div>
                    <span className="rounded-full bg-slate-200 px-2 py-0.5 text-[10px] font-bold text-slate-600">{hMembers.length} members</span>
                  </div>
                  <CompactMemberTable members={hMembers} />
                </div>
              );
            })}
            {scopedHouseholds.length === 0 && (
              <p className="py-8 text-center text-sm text-slate-400">No households found in this purok.</p>
            )}
          </div>
        )}

        {/* Household leader: flat table */}
        {isHouseholdLeader && (
          <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
            <CompactMemberTable members={scopedMembers} />
          </div>
        )}
      </div>

      {/* Add member modal */}
      {showAddMember && (
        <MemberFormModal
          householdsData={scopedHouseholds}
          defaultHouseholdId={isHouseholdLeader ? (session.linkedEntityId ?? undefined) : undefined}
          onSave={(data) => {
            store.addMember(data);
            setShowAddMember(false);
          }}
          onClose={() => setShowAddMember(false)}
        />
      )}
    </>
  );
}

// ── Compact member table ───────────────────────────────────────────────────────

function CompactMemberTable({ members }: { members: Member[] }) {
  if (members.length === 0) {
    return <p className="px-4 py-6 text-center text-sm text-slate-400">No members yet.</p>;
  }
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left text-sm">
        <thead>
          <tr className="border-b border-slate-100 text-xs uppercase tracking-wide text-slate-500">
            {["Name", "PN", "Age", "Status", "Sectors", "Remarks"].map((h, i) => (
              <th key={i} className="px-4 py-2.5 font-semibold">{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {members.map((m) => {
            const badges = sectorBadges(m);
            return (
              <tr key={m.id} className="border-b border-slate-100 last:border-0 hover:bg-slate-50 transition-colors">
                <td className="whitespace-nowrap px-4 py-2.5 font-medium">{memberFullName(m)}</td>
                <td className="whitespace-nowrap px-4 py-2.5 text-slate-600">{m.pn || "—"}</td>
                <td className="px-4 py-2.5 text-slate-600">{m.age}</td>
                <td className="px-4 py-2.5 text-slate-600">{m.status}</td>
                <td className="px-4 py-2.5">
                  <div className="flex gap-1">
                    {badges.length === 0 && <span className="text-xs text-slate-300">—</span>}
                    {badges.map((b) => (
                      <span key={b.label} className={`inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-semibold ring-1 ring-inset ${b.cls}`}>{b.label}</span>
                    ))}
                  </div>
                </td>
                <td className="max-w-[160px] truncate px-4 py-2.5 text-slate-500">{m.remarks || <span className="text-slate-300">—</span>}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
