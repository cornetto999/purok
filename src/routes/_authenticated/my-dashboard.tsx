import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useMemo, useState, useEffect } from "react";
import {
  Accessibility,
  CheckCircle2,
  ChevronRight,
  Flag,
  HelpCircle,
  Home,
  Layers,
  LogOut,
  MapPin,
  Pencil,
  Plus,
  Search,
  ShieldCheck,
  Sparkles,
  UserCheck,
  Users,
  X,
} from "lucide-react";
import { useStore } from "@/lib/store";
import { memberFullName, type Member, type Household, type Purok, type Barangay } from "@/lib/types";
import { StatCard } from "@/components/stat-card";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip, Legend } from "recharts";
import { MemberFormModal } from "@/components/member-form-modal";
import { PurokLeaderSearchClaim } from "@/components/purok-leader-search-claim";
import { ClaimEditOrganizeModal } from "@/components/claim-edit-organize-modal";
import { AddMemberGuardModal } from "@/components/add-member-guard-modal";
import { HouseholdLeaderDashboard } from "@/components/household-leader-dashboard";
import { HouseholdGroupingView } from "@/components/household-grouping-view";
import { HouseholdModal } from "@/components/entity-modals";
import { supabase } from "@/lib/supabase";
import type { Session } from "@/lib/auth";
import { toast } from "sonner";

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
  const { state } = store;
  const navigate = useNavigate();
  const session = state.session;

  useEffect(() => {
    if (session?.role === "Admin") {
      void navigate({ to: "/dashboard" });
    }
  }, [session?.role, navigate]);

  if (!session) return null;

  if (session.role === "Household Leader") {
    return <HouseholdLeaderDashboard session={session} />;
  }

  return <PurokLeaderConsole session={session} />;
}

function PurokLeaderConsole({ session }: { session: Session }) {
  const store = useStore();
  const { state, logout } = store;

  // Active navigation tab for Purok Leader (Tab 1: My Purok Members vs Tab 2: Search & Claim Database)
  const [activeTab, setActiveTab] = useState<"my-purok" | "search-claim" | "roster">("my-purok");

  // Track claimed member IDs for optimistic removal from search results
  const [claimedMemberIds, setClaimedMemberIds] = useState<Set<number>>(new Set());

  // Top Global Search state
  const [globalSearchQuery, setGlobalSearchQuery] = useState("");

  // Highlight newly claimed/assigned member in Household Grouping View
  const [newlyClaimedMemberId, setNewlyClaimedMemberId] = useState<number | null>(null);

  // Success alert after claiming & organizing a resident
  const [claimSuccessAlert, setClaimSuccessAlert] = useState<{
    name: string;
    role: string;
    purok: string;
  } | null>(null);

  // Modals state
  const [editingMember, setEditingMember] = useState<Member | null>(null);
  const [showAddGuard, setShowAddGuard] = useState(false);
  const [guardInitialQuery, setGuardInitialQuery] = useState("");
  const [showRegisterNewModal, setShowRegisterNewModal] = useState(false);
  const [showHouseholdModal, setShowHouseholdModal] = useState(false);
  const [targetHouseholdIdForNewResident, setTargetHouseholdIdForNewResident] = useState<number | undefined>(undefined);
  const [newMemberDefaults, setNewMemberDefaults] = useState<{
    firstName: string;
    lastName: string;
    middleName: string;
  } | null>(null);

  const isPurokLeader = true;

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
    if (leaderPurok) {
      return state.households.filter((h) => h.purokId === leaderPurok.id);
    }
    return [];
  }, [state.households, leaderPurok]);

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

  const teamDistributionData = useMemo(() => {
    if (!isPurokLeader) return [];
    
    const teamCounts: Record<string, number> = { Unassigned: 0 };
    scopedMembers.forEach(m => {
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
  }, [scopedMembers, state.teams, isPurokLeader]);

  const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#64748b'];

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
    return undefined;
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
            <button
              onClick={() => {
                setTargetHouseholdIdForNewResident(undefined);
                setGuardInitialQuery("");
                setShowAddGuard(true);
              }}
              className="flex items-center gap-1.5 rounded-xl bg-emerald-600 px-4 py-2 text-xs font-bold text-white shadow-sm transition-all hover:bg-emerald-700 hover:shadow active:scale-95"
            >
              <Plus className="h-4 w-4" /> Add Resident
            </button>
            <button
              onClick={() => setShowHouseholdModal(true)}
              className="flex items-center gap-1.5 rounded-xl border border-emerald-300 bg-white px-4 py-2 text-xs font-bold text-emerald-900 shadow-sm transition-all hover:bg-emerald-50 active:scale-95"
            >
              <Home className="h-4 w-4 text-emerald-700" /> Add Household
            </button>
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

        {/* Members by Team Chart */}
        {isPurokLeader && leaderPurok && teamDistributionData.length > 0 && (
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <h3 className="mb-4 text-sm font-semibold text-slate-800">Members by Team</h3>
            <div className="h-[250px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={teamDistributionData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={90}
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
        )}

        {/* Purok Leader Interface: Global Search + Two Primary Sections */}
        {isPurokLeader && leaderPurok && (
          <div className="space-y-6">
            {/* ── 1. GLOBAL SEARCH BAR (Prominently featured at the top) ── */}
            <div className="overflow-hidden rounded-2xl border border-indigo-200/80 bg-gradient-to-r from-indigo-50/80 via-white to-slate-50 p-4 shadow-sm transition-all">
              <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                <div className="flex-1">
                  <div className="mb-1.5 flex items-center justify-between">
                    <label
                      htmlFor="purok-global-search-input"
                      className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-indigo-900"
                    >
                      <Search className="h-3.5 w-3.5 text-indigo-600" />
                      Global Search Bar (All Imported Residents & Voters)
                    </label>
                    <span className="text-[11px] text-slate-500">
                      Querying entire database for{" "}
                      <span className="font-semibold text-slate-700">
                        {leaderBarangay?.name || "Barangay"}
                      </span>
                    </span>
                  </div>

                  <div className="relative">
                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400">
                      <Search className="h-4 w-4 text-indigo-500" />
                    </div>
                    <input
                      id="purok-global-search-input"
                      type="text"
                      value={globalSearchQuery}
                      onChange={(e) => {
                        const val = e.target.value;
                        setGlobalSearchQuery(val);
                        if (activeTab !== "search-claim") {
                          setActiveTab("search-claim");
                        }
                      }}
                      placeholder="Search database by First Name, Last Name, or Precinct No. (PN)..."
                      className="w-full rounded-xl border border-slate-200 bg-white pl-10 pr-10 py-2.5 text-sm text-slate-900 placeholder-slate-400 shadow-2xs outline-none transition-all focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
                    />
                    {globalSearchQuery && (
                      <button
                        type="button"
                        onClick={() => setGlobalSearchQuery("")}
                        className="absolute inset-y-0 right-0 flex items-center pr-3 text-slate-400 hover:text-slate-700"
                        title="Clear search"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2 lg:flex-col lg:items-end">
                  <div className="flex items-center gap-2">
                    <span className="inline-flex items-center rounded-lg bg-indigo-100/90 px-3 py-1.5 text-xs font-bold text-indigo-800 border border-indigo-200/60">
                      {barangayMembers.length} Voters in Database
                    </span>
                    <span className="inline-flex items-center rounded-lg bg-amber-100/90 px-3 py-1.5 text-xs font-bold text-amber-800 border border-amber-200/60">
                      {unassignedBarangayCount} Unassigned / Moveable
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* ── 2. TWO MAIN TABS (Tab 1: My Purok Members vs Tab 2: Search & Claim Database) ── */}
            <div className="space-y-4">
              <div className="flex border-b border-slate-200">
                {/* Tab 1: My Purok Members (Primary Grouped Household Accordion View) */}
                <button
                  type="button"
                  onClick={() => setActiveTab("my-purok")}
                  className={`flex items-center gap-2 border-b-2 px-5 py-3 text-sm font-bold transition-all ${
                    activeTab === "my-purok"
                      ? "border-indigo-600 text-indigo-600"
                      : "border-transparent text-slate-500 hover:text-slate-800"
                  }`}
                >
                  <Layers className="h-4 w-4" />
                  <span>Tab 1: My Purok Members</span>
                  <span
                    className={`ml-1 rounded-full px-2 py-0.2 text-[11px] font-semibold ${
                      activeTab === "my-purok"
                        ? "bg-indigo-100 text-indigo-700"
                        : "bg-slate-100 text-slate-600"
                    }`}
                  >
                    {scopedHouseholds.length} Households · {scopedMembers.length} Members
                  </span>
                </button>

                {/* Tab 2: Search & Claim Database */}
                <button
                  type="button"
                  onClick={() => setActiveTab("search-claim")}
                  className={`flex items-center gap-2 border-b-2 px-5 py-3 text-sm font-bold transition-all ${
                    activeTab === "search-claim"
                      ? "border-indigo-600 text-indigo-600"
                      : "border-transparent text-slate-500 hover:text-slate-800"
                  }`}
                >
                  <Search className="h-4 w-4" />
                  <span>Tab 2: Search & Claim Database</span>
                  <span
                    className={`ml-1 rounded-full px-2 py-0.2 text-[11px] font-semibold ${
                      activeTab === "search-claim"
                        ? "bg-amber-100 text-amber-800"
                        : "bg-slate-100 text-slate-600"
                    }`}
                  >
                    {globalSearchQuery.trim()
                      ? "Active Search"
                      : `${unassignedBarangayCount} Unassigned`}
                  </span>
                </button>

                {/* Optional Flat Roster view */}
                <button
                  type="button"
                  onClick={() => setActiveTab("roster")}
                  className={`flex items-center gap-2 border-b-2 px-5 py-3 text-sm font-bold transition-all ${
                    activeTab === "roster"
                      ? "border-emerald-600 text-emerald-600"
                      : "border-transparent text-slate-500 hover:text-slate-800"
                  }`}
                >
                  <CheckCircle2 className="h-4 w-4" />
                  <span>Purok Roster (Flat)</span>
                  <span className="ml-1 rounded-full bg-emerald-100 px-2 py-0.2 text-[11px] font-semibold text-emerald-800">
                    {scopedMembers.length}
                  </span>
                </button>
              </div>

              {/* ── TAB 1: My Purok Members (Expandable Household Grouping View) ── */}
              {activeTab === "my-purok" && (
                <div className="space-y-4">
                  {/* Success Banner when resident was just claimed & organized */}
                  {claimSuccessAlert && (
                    <div className="flex items-center justify-between rounded-xl border border-emerald-200 bg-emerald-50/90 p-4 text-emerald-950 shadow-xs animate-in fade-in slide-in-from-top-2">
                      <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-600 text-white shadow-2xs shrink-0">
                          <Sparkles className="h-5 w-5" />
                        </div>
                        <div>
                          <p className="text-xs font-bold text-emerald-900">
                            Member Successfully Claimed & Updated!
                          </p>
                          <p className="text-xs text-emerald-800">
                            <span className="font-extrabold">{claimSuccessAlert.name}</span> has been assigned as{" "}
                            <span className="font-bold underline">{claimSuccessAlert.role}</span> under{" "}
                            <span className="font-bold">{claimSuccessAlert.purok}</span>.
                          </p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => setClaimSuccessAlert(null)}
                        className="rounded-lg p-1.5 text-emerald-700 hover:bg-emerald-100 transition-colors"
                        title="Dismiss notification"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  )}

                  <HouseholdGroupingView
                    purok={leaderPurok}
                    households={scopedHouseholds}
                    members={state.members}
                    teams={state.teams}
                    highlightMemberId={newlyClaimedMemberId ?? undefined}
                    onEditMember={(member) => setEditingMember(member)}
                    onAddResidentToHousehold={(householdId) => {
                      setTargetHouseholdIdForNewResident(householdId);
                      setGuardInitialQuery("");
                      setShowAddGuard(true);
                    }}
                    onCreateHousehold={() => setShowHouseholdModal(true)}
                  />
                </div>
              )}

              {/* ── TAB 2: Search & Claim Database ── */}
              {activeTab === "search-claim" && (
                <PurokLeaderSearchClaim
                  barangayMembers={barangayMembers}
                  puroks={state.puroks}
                  households={state.households}
                  leaderPurok={leaderPurok}
                  leaderBarangay={leaderBarangay}
                  query={globalSearchQuery}
                  onQueryChange={(val) => setGlobalSearchQuery(val)}
                  hideHeroSearch={true}
                  claimedMemberIds={claimedMemberIds}
                  onClaimMember={(member) => setEditingMember(member)}
                  onAddNewMember={(query) => {
                    setGuardInitialQuery(query || "");
                    setShowAddGuard(true);
                  }}
                />
              )}

              {/* ── OPTIONAL: Purok Flat Roster ── */}
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
                                setTargetHouseholdIdForNewResident(h.id);
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
                          Use the "Tab 2: Search & Claim Database" tab to locate residents and assign them to your Purok.
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

      </div>

      {/* ── MODALS ── */}

      {/* 1. Claim, Edit & Organize Modal (Core Purok Leader Workflow) */}
      {editingMember && leaderPurok && (
        <ClaimEditOrganizeModal
          member={editingMember}
          leaderPurok={leaderPurok}
          leaderBarangay={leaderBarangay}
          purokHouseholds={scopedHouseholds}
          teams={state.teams}
          onSaveSuccess={(updatedMember, newHousehold) => {
            setClaimedMemberIds((prev) => new Set(prev).add(updatedMember.id));
            setNewlyClaimedMemberId(updatedMember.id);
            setActiveTab("my-purok"); // Auto-switch to Tab 1: My Purok Members
            toast.success("Member successfully claimed and updated");
            setClaimSuccessAlert({
              name: memberFullName(updatedMember),
              role: updatedMember.is_household_leader
                ? "Household Leader (HL)"
                : "Household Member (HM)",
              purok: leaderPurok.name,
            });
            setEditingMember(null);
          }}
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
          defaultHouseholdId={targetHouseholdIdForNewResident || scopedHouseholds[0]?.id}
          initial={
            newMemberDefaults
              ? ({
                  id: 0,
                  firstName: newMemberDefaults.firstName,
                  lastName: newMemberDefaults.lastName,
                  middleName: newMemberDefaults.middleName,
                  householdId: targetHouseholdIdForNewResident || scopedHouseholds[0]?.id || 0,
                  precinct: "",
                  no: "",
                  pn: "",
                  address: "",
                  code: leaderPurok.name,
                  is_purok_leader_indicator: false,
                  is_household_leader: false,
                  is_household_member: true,
                  age: 30,
                  religion: "",
                  status: "Single",
                  sc: false,
                  pwd: false,
                  ip: false,
                  remarks: "",
                } as Member)
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
            setTargetHouseholdIdForNewResident(undefined);
          }}
          onClose={() => {
            setShowRegisterNewModal(false);
            setNewMemberDefaults(null);
            setTargetHouseholdIdForNewResident(undefined);
          }}
        />
      )}

      {/* 4. Add Household Modal for Purok */}
      {showHouseholdModal && leaderPurok && (
        <HouseholdModal
          puroksData={[leaderPurok]}
          onSave={async (data) => {
            await store.addHousehold({
              ...data,
              purokId: leaderPurok.id,
              barangayId: leaderPurok.barangayId,
            });
            setShowHouseholdModal(false);
          }}
          onClose={() => setShowHouseholdModal(false)}
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
            <th className="px-4 py-2.5">Precinct</th>
            <th className="px-4 py-2.5">No.</th>
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
                  {m.precinct || m.pn || "—"}
                </td>
                <td className="whitespace-nowrap px-4 py-2.5 text-slate-600 font-mono text-xs">
                  {m.no || "—"}
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
