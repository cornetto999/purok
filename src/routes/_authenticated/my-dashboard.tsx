import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useMemo, useState, useEffect } from "react";
import {
  Accessibility,
  CheckCircle2,
  ChevronRight,
  Flag,
  HelpCircle,
  Home,
  LogOut,
  MapPin,
  Pencil,
  Plus,
  Search,
  ShieldCheck,
  UserCheck,
  Users,
} from "lucide-react";
import { useStore } from "@/lib/store";
import { memberFullName, type Member, type Household, type Purok, type Barangay } from "@/lib/types";
import { StatCard } from "@/components/stat-card";
import { MemberFormModal } from "@/components/member-form-modal";
import { PurokLeaderSearchClaim } from "@/components/purok-leader-search-claim";
import { EditAndAssignModal } from "@/components/edit-and-assign-modal";
import { AddMemberGuardModal } from "@/components/add-member-guard-modal";
import { supabase } from "@/lib/supabase";

export const Route = createFileRoute("/_authenticated/my-dashboard")({
  head: () => ({
    meta: [
      { title: "My Dashboard — Barangay RMS" },
      { name: "description", content: "Dedicated console for Purok and Household Leaders." },
    ],
  }),
  component: MyDashboardPage,
});

function sectorBadges(m: Member) {
  const badges: { label: string; cls: string }[] = [];
  if (m.sc) badges.push({ label: "SC", cls: "bg-blue-100 text-blue-800 ring-blue-600/20" });
  if (m.pwd) badges.push({ label: "PWD", cls: "bg-green-100 text-green-800 ring-green-600/20" });
  if (m.ip) badges.push({ label: "IP", cls: "bg-orange-100 text-orange-800 ring-orange-600/20" });
  return badges;
}

function MyDashboardPage() {
  const store = useStore();
  const { state, logout } = store;
  const navigate = useNavigate();
  const session = state.session!;

  // Active navigation tab for Purok Leader
  const [activeTab, setActiveTab] = useState<"claim" | "roster">("claim");

  // Modals state
  const [editingMember, setEditingMember] = useState<Member | null>(null);
  const [showAddGuard, setShowAddGuard] = useState(false);
  const [guardInitialQuery, setGuardInitialQuery] = useState("");
  const [showRegisterNewModal, setShowRegisterNewModal] = useState(false);
  const [newMemberDefaults, setNewMemberDefaults] = useState<{
    firstName: string;
    lastName: string;
    middleName: string;
  } | null>(null);

  // Household Leader state
  const [showHhAddMember, setShowHhAddMember] = useState(false);

  useEffect(() => {
    if (session.role === "Admin") {
      void navigate({ to: "/dashboard" });
    }
  }, [session.role, navigate]);

  const isPurokLeader = session.role === "Purok Leader";
  const isHouseholdLeader = session.role === "Household Leader";

  // Identify Purok Leader's specific Purok and Barangay
  const leaderPurok: Purok | undefined = useMemo(() => {
    if (!isPurokLeader) return undefined;
    return state.puroks.find((p) => p.id === session.linkedEntityId);
  }, [isPurokLeader, state.puroks, session.linkedEntityId]);

  const leaderBarangay: Barangay | undefined = useMemo(() => {
    if (!leaderPurok) return undefined;
    return state.barangays.find((b) => b.id === leaderPurok.barangayId);
  }, [leaderPurok, state.barangays]);

  // Households strictly in this Purok
  const scopedHouseholds = useMemo(() => {
    if (isPurokLeader && leaderPurok) {
      return state.households.filter((h) => h.purokId === leaderPurok.id);
    }
    if (isHouseholdLeader) {
      return state.households.filter((h) => h.id === session.linkedEntityId);
    }
    return [];
  }, [state.households, isPurokLeader, isHouseholdLeader, leaderPurok, session.linkedEntityId]);

  // Members currently assigned to this Purok's households
  const scopedMembers = useMemo(() => {
    const hhIds = new Set(scopedHouseholds.map((h) => h.id));
    return state.members.filter((m) => hhIds.has(m.householdId));
  }, [state.members, scopedHouseholds]);

  // All members belonging to the ENTIRE Barangay database (for Purok Leader Search & Claim)
  const barangayMembers = useMemo(() => {
    if (!leaderBarangay) return [];

    const puroksInBarangay = new Set(
      state.puroks
        .filter((p) => p.barangayId === leaderBarangay.id)
        .map((p) => p.id),
    );

    const householdsInBarangay = new Set(
      state.households
        .filter(
          (h) =>
            h.barangayId === leaderBarangay.id ||
            (h.purokId && puroksInBarangay.has(h.purokId)),
        )
        .map((h) => h.id),
    );

    return state.members.filter((m) => {
      // If member has explicit barangayId
      if (m.barangayId && m.barangayId === leaderBarangay.id) return true;
      // Or member is in a household belonging to this barangay
      if (m.householdId && householdsInBarangay.has(m.householdId)) return true;
      return false;
    });
  }, [state.members, state.puroks, state.households, leaderBarangay]);

  // Unassigned count in Barangay
  const unassignedBarangayCount = useMemo(() => {
    return barangayMembers.filter((m) => {
      const hh = state.households.find((h) => h.id === m.householdId);
      const pk = hh ? state.puroks.find((p) => p.id === hh.purokId) : undefined;
      return (
        !pk ||
        pk.name.toLowerCase().includes("unassigned") ||
        !m.code ||
        m.code.toLowerCase() === "null" ||
        m.code.toLowerCase().includes("unassigned") ||
        (hh?.householdLeaderName === "General Household" && (!m.code || m.code.toLowerCase().includes("unassigned")))
      );
    }).length;
  }, [barangayMembers, state.households, state.puroks]);

  const scopeLabel = useMemo(() => {
    if (isPurokLeader) {
      const p = leaderPurok?.name ?? "Purok";
      const b = leaderBarangay?.name ?? "";
      return b ? `${p} · Barangay ${b}` : p;
    }
    const h = state.households.find((hh) => hh.id === session.linkedEntityId);
    return h ? `${h.householdLeaderName} — ${h.address}` : "Household";
  }, [isPurokLeader, leaderPurok, leaderBarangay, state.households, session.linkedEntityId]);

  const scCount = scopedMembers.filter((m) => m.sc).length;
  const pwdCount = scopedMembers.filter((m) => m.pwd).length;
  const ipCount = scopedMembers.filter((m) => m.ip).length;

  // Inline household creation helper for EditAndAssignModal
  const handleCreateHouseholdInline = async (data: Omit<Household, "id">) => {
    const { data: inserted, error } = await supabase
      .from("households")
      .insert([data])
      .select()
      .single();

    if (!error && inserted) {
      await store.refreshData();
      return inserted as Household;
    }
  };

  return (
    <>
      <header className="border-b border-slate-200 bg-white px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-lg font-semibold text-slate-900">
              {isPurokLeader ? "Purok Leader Data Console" : "Household Dashboard"}
            </h1>
            <p className="text-sm text-slate-500">
              Signed in as <span className="font-medium text-slate-700">{session.displayName}</span> ({session.role}) · {scopeLabel}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={logout}
              className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-600 transition-colors hover:bg-slate-50"
            >
              <LogOut className="h-3.5 w-3.5" /> Sign Out
            </button>
          </div>
        </div>
      </header>

      <div className="space-y-6 p-6">
        {/* Role & Scope Banner */}
        <div className="flex flex-col gap-4 rounded-2xl border border-emerald-200 bg-gradient-to-r from-emerald-50 via-teal-50 to-emerald-100/60 p-5 sm:flex-row sm:items-center sm:justify-between shadow-xs">
          <div className="flex items-center gap-3.5">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-600 text-white shadow-sm shrink-0">
              {isPurokLeader ? <MapPin className="h-6 w-6" /> : <Home className="h-6 w-6" />}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-emerald-950">{session.displayName}</h2>
                <span className="rounded-full bg-emerald-200/80 px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-wide text-emerald-800">
                  {session.role}
                </span>
              </div>
              <p className="text-xs font-medium text-emerald-800 mt-0.5">
                {scopeLabel}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {isPurokLeader && (
              <button
                onClick={() => {
                  setGuardInitialQuery("");
                  setShowAddGuard(true);
                }}
                className="flex items-center gap-1.5 rounded-xl bg-emerald-600 px-4 py-2 text-xs font-bold text-white shadow-sm transition-all hover:bg-emerald-700 hover:shadow active:scale-95"
              >
                <Plus className="h-4 w-4" /> Add New Member
              </button>
            )}

            {isHouseholdLeader && (
              <button
                onClick={() => setShowHhAddMember(true)}
                className="flex items-center gap-1.5 rounded-xl bg-emerald-600 px-4 py-2 text-xs font-semibold text-white transition-colors hover:bg-emerald-700"
              >
                <Plus className="h-4 w-4" /> Add Household Member
              </button>
            )}
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          {isPurokLeader && (
            <StatCard
              icon={<Home className="h-5 w-5 text-indigo-600" />}
              label="Households in Purok"
              value={scopedHouseholds.length}
            />
          )}
          <StatCard
            icon={<Users className="h-5 w-5 text-emerald-600" />}
            label={isPurokLeader ? "Claimed Purok Members" : "Total Members"}
            value={scopedMembers.length}
          />
          {isPurokLeader && (
            <StatCard
              icon={<HelpCircle className="h-5 w-5 text-amber-600" />}
              label="Unassigned in Barangay"
              value={unassignedBarangayCount}
            />
          )}
          <StatCard
            icon={<Flag className="h-5 w-5 text-blue-600" />}
            label="Senior Citizens (SC)"
            value={scCount}
          />
          <StatCard
            icon={<Accessibility className="h-5 w-5 text-teal-600" />}
            label="PWD"
            value={pwdCount}
          />
        </div>

        {/* Purok Leader Interface: Tab Switching */}
        {isPurokLeader && leaderPurok && (
          <div className="space-y-4">
            {/* Tab bar */}
            <div className="flex border-b border-slate-200">
              <button
                onClick={() => setActiveTab("claim")}
                className={`flex items-center gap-2 border-b-2 px-5 py-3 text-sm font-bold transition-all ${
                  activeTab === "claim"
                    ? "border-indigo-600 text-indigo-600"
                    : "border-transparent text-slate-500 hover:text-slate-800"
                }`}
              >
                <Search className="h-4 w-4" />
                Member Search & Claim
                <span className="ml-1 rounded-full bg-indigo-100 px-2 py-0.2 text-[11px] font-semibold text-indigo-700">
                  {barangayMembers.length}
                </span>
              </button>

              <button
                onClick={() => setActiveTab("roster")}
                className={`flex items-center gap-2 border-b-2 px-5 py-3 text-sm font-bold transition-all ${
                  activeTab === "roster"
                    ? "border-emerald-600 text-emerald-600"
                    : "border-transparent text-slate-500 hover:text-slate-800"
                }`}
              >
                <CheckCircle2 className="h-4 w-4" />
                Your Purok Roster
                <span className="ml-1 rounded-full bg-emerald-100 px-2 py-0.2 text-[11px] font-semibold text-emerald-800">
                  {scopedMembers.length}
                </span>
              </button>
            </div>

            {/* Tab 1: Member Search & Claim UI */}
            {activeTab === "claim" && (
              <PurokLeaderSearchClaim
                barangayMembers={barangayMembers}
                puroks={state.puroks}
                households={state.households}
                leaderPurok={leaderPurok}
                leaderBarangay={leaderBarangay}
                onEditAndAssign={(member) => setEditingMember(member)}
                onAddNewMember={(query) => {
                  setGuardInitialQuery(query || "");
                  setShowAddGuard(true);
                }}
              />
            )}

            {/* Tab 2: Your Purok Claimed Roster (grouped by household) */}
            {activeTab === "roster" && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-base font-bold text-slate-900">
                      Claimed Households in {leaderPurok.name}
                    </h3>
                    <p className="text-xs text-slate-500">
                      Residents currently registered and living in households within your Purok.
                    </p>
                  </div>
                </div>

                <div className="space-y-4">
                  {scopedHouseholds.map((h) => {
                    const hMembers = state.members.filter((m) => m.householdId === h.id);
                    return (
                      <div
                        key={h.id}
                        className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm"
                      >
                        <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50/80 px-4 py-3">
                          <div className="space-y-0.5">
                            <div className="flex items-center gap-2">
                              <span className="font-semibold text-slate-900">
                                {h.householdLeaderName}
                              </span>
                              <span className="rounded-full bg-slate-200 px-2 py-0.2 text-[10px] font-bold text-slate-700">
                                {hMembers.length} member{hMembers.length === 1 ? "" : "s"}
                              </span>
                            </div>
                            <p className="text-xs text-slate-500">{h.address}</p>
                          </div>

                          <button
                            onClick={() => {
                              // Pre-check before adding resident
                              setGuardInitialQuery("");
                              setShowAddGuard(true);
                            }}
                            className="flex items-center gap-1 rounded-md border border-slate-200 bg-white px-2.5 py-1 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                          >
                            <Plus className="h-3.5 w-3.5 text-slate-500" />
                            Add Resident
                          </button>
                        </div>

                        <CompactMemberTable
                          members={hMembers}
                          onEditMember={(m) => setEditingMember(m)}
                        />
                      </div>
                    );
                  })}

                  {scopedHouseholds.length === 0 && (
                    <div className="rounded-xl border border-dashed border-slate-300 p-8 text-center">
                      <Home className="mx-auto h-8 w-8 text-slate-400" />
                      <h4 className="mt-2 text-sm font-semibold text-slate-700">
                        No households registered yet in {leaderPurok.name}
                      </h4>
                      <p className="mt-1 text-xs text-slate-500">
                        Use the "Member Search & Claim" tab to find residents and assign them to your Purok.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Household Leader Flat Table */}
        {isHouseholdLeader && (
          <div className="space-y-4">
            <h2 className="text-sm font-semibold text-slate-700">
              Household Members ({scopedMembers.length})
            </h2>
            <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
              <CompactMemberTable members={scopedMembers} />
            </div>
          </div>
        )}
      </div>

      {/* ── MODALS ── */}

      {/* 1. Edit & Assign Modal (Core Purok Leader Workflow) */}
      {editingMember && leaderPurok && (
        <EditAndAssignModal
          member={editingMember}
          leaderPurok={leaderPurok}
          leaderBarangay={leaderBarangay}
          purokHouseholds={scopedHouseholds}
          onSave={async (updatedData) => {
            await store.updateMember(editingMember.id, updatedData);
            setEditingMember(null);
          }}
          onCreateHousehold={handleCreateHouseholdInline}
          onClose={() => setEditingMember(null)}
        />
      )}

      {/* 2. Anti-Duplicate Pre-Check Guard Modal */}
      {showAddGuard && leaderPurok && (
        <AddMemberGuardModal
          allMembers={barangayMembers}
          puroks={state.puroks}
          households={state.households}
          leaderPurok={leaderPurok}
          initialQuery={guardInitialQuery}
          onSelectExisting={(existingMember) => {
            setShowAddGuard(false);
            setEditingMember(existingMember);
          }}
          onProceedNew={(initialData) => {
            setShowAddGuard(false);
            setNewMemberDefaults(initialData);
            setShowRegisterNewModal(true);
          }}
          onClose={() => setShowAddGuard(false)}
        />
      )}

      {/* 3. Register New Member (Scoped to Leader's Purok) */}
      {showRegisterNewModal && leaderPurok && (
        <MemberFormModal
          householdsData={scopedHouseholds}
          barangaysData={leaderBarangay ? [leaderBarangay] : state.barangays}
          puroksData={[leaderPurok]}
          defaultHouseholdId={scopedHouseholds[0]?.id}
          initialData={
            newMemberDefaults
              ? ({
                  firstName: newMemberDefaults.firstName,
                  lastName: newMemberDefaults.lastName,
                  middleName: newMemberDefaults.middleName,
                  householdId: scopedHouseholds[0]?.id || 0,
                  barangayId: leaderPurok.barangayId,
                  code: leaderPurok.name,
                } as Partial<Member>)
              : undefined
          }
          onSave={async (data) => {
            await store.addMember({
              ...data,
              barangayId: leaderPurok.barangayId,
              code: leaderPurok.name,
            });
            setShowRegisterNewModal(false);
            setNewMemberDefaults(null);
          }}
          onClose={() => {
            setShowRegisterNewModal(false);
            setNewMemberDefaults(null);
          }}
        />
      )}

      {/* 4. Household Leader Add Member Modal */}
      {showHhAddMember && (
        <MemberFormModal
          householdsData={scopedHouseholds}
          barangaysData={state.barangays}
          puroksData={state.puroks}
          defaultHouseholdId={session.linkedEntityId ?? undefined}
          onSave={(data) => {
            void store.addMember(data);
            setShowHhAddMember(false);
          }}
          onClose={() => setShowHhAddMember(false)}
        />
      )}
    </>
  );
}

// ── Compact member table for roster ──────────────────────────────────────────

function CompactMemberTable({
  members,
  onEditMember,
}: {
  members: Member[];
  onEditMember?: (m: Member) => void;
}) {
  if (members.length === 0) {
    return <p className="px-4 py-6 text-center text-sm text-slate-400">No members registered yet.</p>;
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left text-sm">
        <thead>
          <tr className="border-b border-slate-100 bg-slate-50/50 text-xs font-semibold uppercase tracking-wide text-slate-500">
            <th className="px-4 py-2.5">Name</th>
            <th className="px-4 py-2.5">PN</th>
            <th className="px-4 py-2.5">Age</th>
            <th className="px-4 py-2.5">Status</th>
            <th className="px-4 py-2.5">Sectors</th>
            <th className="px-4 py-2.5">Remarks</th>
            {onEditMember && <th className="px-4 py-2.5 text-right">Action</th>}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {members.map((m) => {
            const badges = sectorBadges(m);
            return (
              <tr
                key={m.id}
                className="hover:bg-slate-50/80 transition-colors"
              >
                <td className="whitespace-nowrap px-4 py-2.5 font-medium text-slate-900">
                  {memberFullName(m)}
                  {m.is_household_leader && (
                    <span className="ml-2 rounded-full bg-emerald-100 px-1.5 py-0.2 text-[10px] font-bold text-emerald-800">
                      HL
                    </span>
                  )}
                </td>
                <td className="whitespace-nowrap px-4 py-2.5 text-slate-600 font-mono text-xs">
                  {m.pn || "—"}
                </td>
                <td className="px-4 py-2.5 text-slate-600">{m.age || "—"}</td>
                <td className="px-4 py-2.5 text-slate-600">{m.status || "—"}</td>
                <td className="px-4 py-2.5">
                  <div className="flex gap-1">
                    {badges.length === 0 && <span className="text-xs text-slate-300">—</span>}
                    {badges.map((b) => (
                      <span
                        key={b.label}
                        className={`inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-semibold ring-1 ring-inset ${b.cls}`}
                      >
                        {b.label}
                      </span>
                    ))}
                  </div>
                </td>
                <td className="max-w-[160px] truncate px-4 py-2.5 text-slate-500">
                  {m.remarks || <span className="text-slate-300">—</span>}
                </td>
                {onEditMember && (
                  <td className="px-4 py-2.5 text-right">
                    <button
                      onClick={() => onEditMember(m)}
                      className="inline-flex items-center gap-1 rounded-md border border-slate-200 bg-white px-2.5 py-1 text-xs font-semibold text-slate-700 hover:bg-slate-50 hover:text-indigo-600"
                    >
                      <Pencil className="h-3 w-3" /> Edit
                    </button>
                  </td>
                )}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
