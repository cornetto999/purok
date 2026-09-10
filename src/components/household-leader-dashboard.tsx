import { useMemo, useState } from "react";
import {
  Accessibility,
  CheckCircle2,
  Filter,
  Flag,
  HeartHandshake,
  Home,
  LogOut,
  MapPin,
  Pencil,
  Plus,
  RefreshCw,
  Search,
  Shield,
  User,
  UserCheck,
  Users,
  X,
} from "lucide-react";
import { useStore } from "@/lib/store";
import type { Session } from "@/lib/auth";
import type { Member, Household, Purok, Barangay, CivilStatus, Team } from "@/lib/types";
import { memberFullName } from "@/lib/types";
import { ModalShell, Field, inputCls, FormActions } from "./modal-shell";

// Sector badges helper
function sectorBadges(m: Member) {
  const badges: { label: string; full: string; cls: string }[] = [];
  if (m.sc) {
    badges.push({
      label: "SC",
      full: "Senior Citizen",
      cls: "bg-blue-100 text-blue-800 ring-1 ring-blue-600/20",
    });
  }
  if (m.pwd) {
    badges.push({
      label: "PWD",
      full: "Person with Disability",
      cls: "bg-emerald-100 text-emerald-800 ring-1 ring-emerald-600/20",
    });
  }
  if (m.ip) {
    badges.push({
      label: "IP",
      full: "Indigenous Peoples",
      cls: "bg-amber-100 text-amber-800 ring-1 ring-amber-600/20",
    });
  }
  return badges;
}

// Age Category helper
function getAgeCategory(age: number): { label: string; cls: string } {
  if (age < 18) {
    return { label: "Minor", cls: "bg-purple-50 text-purple-700 ring-purple-600/20" };
  }
  if (age >= 60) {
    return { label: "Senior", cls: "bg-blue-50 text-blue-700 ring-blue-600/20" };
  }
  return { label: "Adult", cls: "bg-slate-100 text-slate-700 ring-slate-500/20" };
}

interface HouseholdLeaderDashboardProps {
  session: Session;
}

export function HouseholdLeaderDashboard({ session }: HouseholdLeaderDashboardProps) {
  const store = useStore();
  const { state, logout } = store;

  // ── 1. Relational Data Resolution ──────────────────────────────────────────
  const household: Household | undefined = useMemo(() => {
    return state.households.find((h) => h.id === session.linkedEntityId);
  }, [state.households, session.linkedEntityId]);

  const purok: Purok | undefined = useMemo(() => {
    if (!household?.purokId) return undefined;
    return state.puroks.find((p) => p.id === household.purokId);
  }, [state.puroks, household?.purokId]);

  const barangay: Barangay | undefined = useMemo(() => {
    const bId = household?.barangayId || purok?.barangayId;
    if (!bId) return undefined;
    return state.barangays.find((b) => b.id === bId);
  }, [state.barangays, household?.barangayId, purok?.barangayId]);

  // List of all members strictly assigned to this household_id
  const householdMembers: Member[] = useMemo(() => {
    if (!session.linkedEntityId) return [];
    return state.members.filter((m) => m.householdId === session.linkedEntityId);
  }, [state.members, session.linkedEntityId]);

  // Household Leader's own member profile
  const leaderMember: Member | null = useMemo(() => {
    return (
      householdMembers.find((m) => m.is_household_leader) ??
      householdMembers.find(
        (m) =>
          memberFullName(m).toLowerCase() === session.displayName.toLowerCase() ||
          memberFullName(m).toLowerCase() === household?.householdLeaderName.toLowerCase(),
      ) ??
      householdMembers[0] ??
      null
    );
  }, [householdMembers, session.displayName, household?.householdLeaderName]);

  const householdLeaderName: string = useMemo(() => {
    if (leaderMember) return memberFullName(leaderMember);
    return household?.householdLeaderName || session.displayName;
  }, [leaderMember, household?.householdLeaderName, session.displayName]);

  // Assigned Team from Teams table using team_id
  const assignedTeam: Team | null = useMemo(() => {
    const teamId = leaderMember?.teamId ?? householdMembers.find((m) => m.teamId)?.teamId;
    if (!teamId) return null;
    return state.teams.find((t) => t.id === teamId) ?? null;
  }, [leaderMember, householdMembers, state.teams]);

  // Purok Leader Name (Households -> Puroks -> Users/Members)
  const purokLeaderName: string = useMemo(() => {
    if (purok?.purokLeaderName && purok.purokLeaderName.trim() !== "") {
      return purok.purokLeaderName;
    }
    // Check users table for Purok Leader assigned to this purok
    const leaderUser = state.users.find(
      (u) => u.role === "Purok Leader" && u.linked_entity_id === purok?.id,
    );
    if (leaderUser) return leaderUser.displayName;

    // Check members table for leader indicator
    const leaderM = state.members.find(
      (m) =>
        m.is_purok_leader_indicator &&
        (m.code === purok?.name || m.barangayId === purok?.barangayId),
    );
    if (leaderM) return memberFullName(leaderM);

    return "Unassigned";
  }, [purok, state.users, state.members]);

  // ── Filters & Search State ─────────────────────────────────────────────────
  const [searchQuery, setSearchQuery] = useState("");
  const [ageGroupFilter, setAgeGroupFilter] = useState<"all" | "minor" | "adult" | "senior">("all");
  const [sectorFilter, setSectorFilter] = useState<"all" | "SC" | "PWD" | "IP">("all");
  const [statusFilter, setStatusFilter] = useState<"all" | CivilStatus>("all");

  // Modals state
  const [editingMember, setEditingMember] = useState<Member | null>(null);
  const [showAddMemberModal, setShowAddMemberModal] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Filtered members
  const filteredMembers = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return householdMembers.filter((m) => {
      // Name search
      if (q) {
        const full = memberFullName(m).toLowerCase();
        const remarks = (m.remarks || "").toLowerCase();
        const pn = (m.pn || "").toLowerCase();
        if (!full.includes(q) && !remarks.includes(q) && !pn.includes(q)) {
          return false;
        }
      }

      // Age group filter
      if (ageGroupFilter === "minor" && m.age >= 18) return false;
      if (ageGroupFilter === "adult" && (m.age < 18 || m.age >= 60)) return false;
      if (ageGroupFilter === "senior" && m.age < 60) return false;

      // Sector filter
      if (sectorFilter === "SC" && !m.sc) return false;
      if (sectorFilter === "PWD" && !m.pwd) return false;
      if (sectorFilter === "IP" && !m.ip) return false;

      // Civil status filter
      if (statusFilter !== "all" && m.status !== statusFilter) return false;

      return true;
    });
  }, [householdMembers, searchQuery, ageGroupFilter, sectorFilter, statusFilter]);

  const hasActiveFilters =
    searchQuery.trim() !== "" ||
    ageGroupFilter !== "all" ||
    sectorFilter !== "all" ||
    statusFilter !== "all";

  const clearFilters = () => {
    setSearchQuery("");
    setAgeGroupFilter("all");
    setSectorFilter("all");
    setStatusFilter("all");
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await store.refreshData();
    setIsRefreshing(false);
  };

  // Quick stats
  const seniorCount = householdMembers.filter((m) => m.sc || m.age >= 60).length;
  const pwdCount = householdMembers.filter((m) => m.pwd).length;
  const ipCount = householdMembers.filter((m) => m.ip).length;
  const minorCount = householdMembers.filter((m) => m.age < 18).length;

  return (
    <div className="min-h-screen bg-slate-50/70 pb-16">
      {/* ── Top App Header ─────────────────────────────────────────────────── */}
      <header className="sticky top-0 z-20 border-b border-slate-200/80 bg-white/95 backdrop-blur-md px-6 py-3.5">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-600 to-indigo-700 text-white shadow-sm shadow-indigo-200">
              <Home className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-base font-bold text-slate-900 tracking-tight sm:text-lg">
                Household Leader Dashboard
              </h1>
              <p className="text-xs text-slate-500">
                Barangay Resident Management System · Family Portal
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleRefresh}
              disabled={isRefreshing}
              title="Refresh household data"
              className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-600 transition-colors hover:bg-slate-50 active:scale-95 disabled:opacity-50"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${isRefreshing ? "animate-spin text-indigo-600" : ""}`} />
              <span className="hidden sm:inline">Refresh</span>
            </button>
            <button
              onClick={logout}
              className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-600 transition-colors hover:bg-slate-50 hover:text-red-600"
            >
              <LogOut className="h-3.5 w-3.5" /> Sign Out
            </button>
          </div>
        </div>
      </header>

      <main className="space-y-6 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
        {/* ── 2. DASHBOARD UI - HEADER & PROFILE INFO CARD ──────────────────── */}
        <section className="relative overflow-hidden rounded-2xl border border-slate-200/90 bg-white shadow-sm">
          {/* Subtle decorative top bar */}
          <div className="h-2 w-full bg-gradient-to-r from-indigo-500 via-purple-500 to-teal-400" />

          <div className="p-6 sm:p-7">
            {/* Top row: Leader, Purok Leader, Team */}
            <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
              {/* 👤 Household Leader Profile */}
              <div className="flex items-start gap-4 md:border-r md:border-slate-100 md:pr-6">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-700 ring-1 ring-indigo-200/80 shadow-xs">
                  <User className="h-6 w-6" />
                </div>
                <div className="min-w-0 flex-1">
                  <span className="inline-flex items-center gap-1 rounded-full bg-indigo-50 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-indigo-700 ring-1 ring-inset ring-indigo-700/20">
                    👤 Household Leader
                  </span>
                  <h2 className="mt-1 truncate text-lg font-extrabold text-slate-900 sm:text-xl">
                    {householdLeaderName}
                  </h2>
                  <div className="mt-1 flex items-center gap-1.5 text-xs text-slate-500">
                    <MapPin className="h-3.5 w-3.5 shrink-0 text-slate-400" />
                    <span className="truncate">
                      {household?.address || "Address on record"}
                    </span>
                  </div>
                </div>
              </div>

              {/* 📍 Purok Leader Info */}
              <div className="flex items-start gap-4 md:border-r md:border-slate-100 md:pr-6">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200/80 shadow-xs">
                  <UserCheck className="h-6 w-6" />
                </div>
                <div className="min-w-0 flex-1">
                  <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-emerald-700 ring-1 ring-inset ring-emerald-700/20">
                    📍 Purok Leader
                  </span>
                  <h3 className="mt-1 truncate text-base font-bold text-slate-900 sm:text-lg">
                    {purokLeaderName}
                  </h3>
                  <p className="mt-1 text-xs text-slate-500">
                    {purok?.name || "Assigned Purok"}
                    {barangay ? ` · Brgy. ${barangay.name}` : ""}
                  </p>
                </div>
              </div>

              {/* 🚩 Team Assignment */}
              <div className="flex items-start gap-4">
                <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl shadow-xs ${
                  assignedTeam 
                    ? "bg-amber-50 text-amber-600 ring-1 ring-amber-200/80" 
                    : "bg-slate-100 text-slate-500 ring-1 ring-slate-200"
                }`}>
                  <Flag className="h-6 w-6" />
                </div>
                <div className="min-w-0 flex-1">
                  <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-slate-700 ring-1 ring-inset ring-slate-600/20">
                    🚩 Team Assignment
                  </span>
                  <div className="mt-1.5 flex items-center gap-2">
                    {assignedTeam ? (
                      <span className="inline-flex items-center gap-1.5 rounded-lg bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200/80 px-3 py-1 text-sm font-bold text-amber-800 shadow-xs">
                        <span className="h-2 w-2 rounded-full bg-amber-500 animate-pulse" />
                        {assignedTeam.team_name}
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 rounded-lg bg-slate-100 border border-slate-200 px-3 py-1 text-xs font-semibold text-slate-600">
                        Unassigned
                      </span>
                    )}
                  </div>
                  <p className="mt-1 text-xs text-slate-500">
                    {assignedTeam?.description || "Barangay cluster group"}
                  </p>
                </div>
              </div>
            </div>

            {/* Quick Metrics Bar */}
            <div className="mt-6 pt-6 border-t border-slate-100 grid grid-cols-2 gap-3 sm:grid-cols-5">
              <div className="rounded-xl bg-slate-50 p-3 text-center border border-slate-100">
                <span className="text-xs font-medium text-slate-500">Total Members</span>
                <p className="text-xl font-extrabold text-slate-900 mt-0.5">
                  {householdMembers.length}
                </p>
              </div>
              <div className="rounded-xl bg-blue-50/60 p-3 text-center border border-blue-100/60">
                <span className="text-xs font-semibold text-blue-700">Senior Citizens</span>
                <p className="text-xl font-extrabold text-blue-900 mt-0.5">{seniorCount}</p>
              </div>
              <div className="rounded-xl bg-emerald-50/60 p-3 text-center border border-emerald-100/60">
                <span className="text-xs font-semibold text-emerald-700">PWD Members</span>
                <p className="text-xl font-extrabold text-emerald-900 mt-0.5">{pwdCount}</p>
              </div>
              <div className="rounded-xl bg-amber-50/60 p-3 text-center border border-amber-100/60">
                <span className="text-xs font-semibold text-amber-700">Indigenous (IP)</span>
                <p className="text-xl font-extrabold text-amber-900 mt-0.5">{ipCount}</p>
              </div>
              <div className="rounded-xl bg-purple-50/60 p-3 text-center border border-purple-100/60 col-span-2 sm:col-span-1">
                <span className="text-xs font-semibold text-purple-700">Minors (&lt;18)</span>
                <p className="text-xl font-extrabold text-purple-900 mt-0.5">{minorCount}</p>
              </div>
            </div>
          </div>
        </section>

        {/* ── 3. HOUSEHOLD MEMBERS TABLE & SEARCH FILTERS ────────────────────── */}
        <section className="space-y-4">
          {/* Header row with Add Member Action */}
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Users className="h-5 w-5 text-indigo-600" />
                Family Members List
                <span className="rounded-full bg-slate-200 px-2 py-0.5 text-xs font-bold text-slate-700">
                  {filteredMembers.length} of {householdMembers.length}
                </span>
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Registered residents belonging to your household. You can view, search, add, and edit details.
              </p>
            </div>

            {/* 4. Add Family Member Button */}
            <button
              onClick={() => setShowAddMemberModal(true)}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-xs font-semibold text-white shadow-sm shadow-indigo-200 transition hover:bg-indigo-700 active:scale-95"
            >
              <Plus className="h-4 w-4" /> Add Family Member
            </button>
          </div>

          {/* Search & Filter Controls Card */}
          <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-xs space-y-3">
            <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
              {/* Search Bar */}
              <div className="relative flex-1">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search family member by name or remarks..."
                  className="w-full rounded-lg border border-slate-300 bg-white py-2 pl-9 pr-3 text-sm outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery("")}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>

              {/* Filters Group */}
              <div className="flex flex-wrap items-center gap-2">
                {/* Age Group Filter */}
                <select
                  value={ageGroupFilter}
                  onChange={(e) => setAgeGroupFilter(e.target.value as any)}
                  className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-medium text-slate-700 outline-none transition focus:border-indigo-500"
                >
                  <option value="all">All Ages</option>
                  <option value="minor">Minors (&lt;18)</option>
                  <option value="adult">Adults (18-59)</option>
                  <option value="senior">Seniors (60+)</option>
                </select>

                {/* Sector Filter */}
                <select
                  value={sectorFilter}
                  onChange={(e) => setSectorFilter(e.target.value as any)}
                  className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-medium text-slate-700 outline-none transition focus:border-indigo-500"
                >
                  <option value="all">All Sectors</option>
                  <option value="SC">Senior Citizen (SC)</option>
                  <option value="PWD">PWD</option>
                  <option value="IP">Indigenous (IP)</option>
                </select>

                {/* Civil Status Filter */}
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value as any)}
                  className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-medium text-slate-700 outline-none transition focus:border-indigo-500"
                >
                  <option value="all">All Civil Statuses</option>
                  <option value="Single">Single</option>
                  <option value="Married">Married</option>
                  <option value="Widowed">Widowed</option>
                  <option value="Separated">Separated</option>
                </select>

                {/* Clear Filters Button */}
                {hasActiveFilters && (
                  <button
                    onClick={clearFilters}
                    className="flex items-center gap-1 rounded-lg border border-red-200 bg-red-50/50 px-2.5 py-2 text-xs font-medium text-red-600 transition hover:bg-red-100/70"
                  >
                    <X className="h-3 w-3" /> Clear
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Members Data Table */}
          <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50/90 text-xs font-bold uppercase tracking-wider text-slate-600">
                    <th className="px-5 py-3">Member Name</th>
                    <th className="px-4 py-3">Age</th>
                    <th className="px-4 py-3">Civil Status</th>
                    <th className="px-4 py-3">Special Sectors</th>
                    <th className="px-5 py-3">Remarks</th>
                    <th className="px-4 py-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredMembers.map((m) => {
                    const badges = sectorBadges(m);
                    const ageCat = getAgeCategory(m.age);
                    const isLeader = m.is_household_leader;

                    return (
                      <tr
                        key={m.id}
                        className="transition-colors hover:bg-slate-50/80"
                      >
                        {/* Name column */}
                        <td className="whitespace-nowrap px-5 py-3.5">
                          <div className="flex items-center gap-2">
                            <div className="font-semibold text-slate-900">
                              {memberFullName(m)}
                            </div>
                            {isLeader && (
                              <span className="inline-flex items-center gap-0.5 rounded-full bg-indigo-100 px-2 py-0.5 text-[10px] font-bold text-indigo-800 ring-1 ring-inset ring-indigo-700/20">
                                Household Leader
                              </span>
                            )}
                          </div>
                          {m.pn && (
                            <p className="text-[11px] font-mono text-slate-400 mt-0.5">
                              PN: {m.pn}
                            </p>
                          )}
                        </td>

                        {/* Age column */}
                        <td className="whitespace-nowrap px-4 py-3.5">
                          <div className="flex items-center gap-1.5">
                            <span className="font-medium text-slate-800">{m.age}</span>
                            <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ring-1 ring-inset ${ageCat.cls}`}>
                              {ageCat.label}
                            </span>
                          </div>
                        </td>

                        {/* Status column */}
                        <td className="whitespace-nowrap px-4 py-3.5">
                          <span className="inline-flex items-center rounded-md bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-700">
                            {m.status || "—"}
                          </span>
                        </td>

                        {/* Sectors column */}
                        <td className="px-4 py-3.5">
                          <div className="flex flex-wrap gap-1">
                            {badges.length === 0 && (
                              <span className="text-xs text-slate-300">—</span>
                            )}
                            {badges.map((b) => (
                              <span
                                key={b.label}
                                title={b.full}
                                className={`inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-bold ${b.cls}`}
                              >
                                {b.label}
                              </span>
                            ))}
                          </div>
                        </td>

                        {/* Remarks column */}
                        <td className="max-w-[200px] truncate px-5 py-3.5 text-xs text-slate-500">
                          {m.remarks || <span className="text-slate-300">—</span>}
                        </td>

                        {/* Actions column */}
                        <td className="whitespace-nowrap px-4 py-3.5 text-right">
                          <button
                            onClick={() => setEditingMember(m)}
                            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-semibold text-slate-700 shadow-2xs transition hover:border-indigo-300 hover:bg-indigo-50/50 hover:text-indigo-600 active:scale-95"
                          >
                            <Pencil className="h-3.5 w-3.5" /> Edit
                          </button>
                        </td>
                      </tr>
                    );
                  })}

                  {/* Empty search results */}
                  {filteredMembers.length === 0 && householdMembers.length > 0 && (
                    <tr>
                      <td colSpan={6} className="py-12 text-center">
                        <div className="mx-auto max-w-sm space-y-2">
                          <Search className="mx-auto h-8 w-8 text-slate-300" />
                          <p className="text-sm font-semibold text-slate-700">
                            No family members match your search
                          </p>
                          <p className="text-xs text-slate-500">
                            Try adjusting your search terms or filters.
                          </p>
                          <button
                            onClick={clearFilters}
                            className="mt-2 inline-flex items-center gap-1 text-xs font-semibold text-indigo-600 hover:underline"
                          >
                            Clear all filters
                          </button>
                        </div>
                      </td>
                    </tr>
                  )}

                  {/* Empty household members */}
                  {householdMembers.length === 0 && (
                    <tr>
                      <td colSpan={6} className="py-14 text-center">
                        <div className="mx-auto max-w-md space-y-3">
                          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600">
                            <Users className="h-6 w-6" />
                          </div>
                          <h4 className="text-sm font-bold text-slate-800">
                            No family members recorded yet
                          </h4>
                          <p className="text-xs text-slate-500">
                            Begin by adding your household members so your Barangay and Purok leaders have an accurate record.
                          </p>
                          <button
                            onClick={() => setShowAddMemberModal(true)}
                            className="inline-flex items-center gap-1.5 rounded-xl bg-indigo-600 px-4 py-2 text-xs font-semibold text-white shadow-xs hover:bg-indigo-700"
                          >
                            <Plus className="h-4 w-4" /> Add Your First Family Member
                          </button>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Table Footer */}
            <div className="border-t border-slate-100 bg-slate-50/60 px-5 py-3 text-xs text-slate-500 flex items-center justify-between">
              <span>
                Showing {filteredMembers.length} of {householdMembers.length} member{householdMembers.length === 1 ? "" : "s"}
              </span>
              <span className="text-slate-400">
                Household ID #{household?.id ?? session.linkedEntityId}
              </span>
            </div>
          </div>
        </section>
      </main>

      {/* ── 4. HOUSEHOLD LEADER PERMISSIONS (MODALS) ─────────────────────────── */}

      {/* Edit Member Modal */}
      {editingMember && household && (
        <FamilyMemberModal
          title={`Edit ${memberFullName(editingMember)}`}
          initial={editingMember}
          household={household}
          purok={purok}
          barangay={barangay}
          onSave={async (updatedData) => {
            await store.updateMember(editingMember.id, updatedData);
            setEditingMember(null);
          }}
          onClose={() => setEditingMember(null)}
        />
      )}

      {/* Add Family Member Modal */}
      {showAddMemberModal && household && (
        <FamilyMemberModal
          title="Add New Family Member"
          household={household}
          purok={purok}
          barangay={barangay}
          defaultTeamId={assignedTeam?.id ?? null}
          onSave={async (newData) => {
            await store.addMember(newData);
            setShowAddMemberModal(false);
          }}
          onClose={() => setShowAddMemberModal(false)}
        />
      )}
    </div>
  );
}

// ── Family Member Add/Edit Modal (Strictly Scoped) ─────────────────────────────

interface FamilyMemberModalProps {
  title: string;
  initial?: Member | undefined;
  household: Household;
  purok?: Purok | undefined;
  barangay?: Barangay | undefined;
  defaultTeamId?: number | null | undefined;
  onSave: (data: Omit<Member, "id">) => Promise<void> | void;
  onClose: () => void;
}

function FamilyMemberModal({
  title,
  initial,
  household,
  purok,
  barangay,
  defaultTeamId = null,
  onSave,
  onClose,
}: FamilyMemberModalProps) {
  const [firstName, setFirstName] = useState(initial?.firstName ?? "");
  const [middleName, setMiddleName] = useState(initial?.middleName ?? "");
  const [lastName, setLastName] = useState(initial?.lastName ?? (household.householdLeaderName.split(" ").slice(-1)[0] || ""));
  const [age, setAge] = useState<number>(initial?.age ?? 25);
  const [status, setStatus] = useState<CivilStatus>(initial?.status ?? "Single");
  const [religion, setReligion] = useState(initial?.religion ?? "Roman Catholic");
  const [remarks, setRemarks] = useState(initial?.remarks ?? "");

  // Sectors
  const [sc, setSc] = useState<boolean>(initial?.sc ?? (initial?.age ? initial.age >= 60 : false));
  const [pwd, setPwd] = useState<boolean>(initial?.pwd ?? false);
  const [ip, setIp] = useState<boolean>(initial?.ip ?? false);

  const [saving, setSaving] = useState(false);

  // Auto-suggest SC when age reaches 60
  const handleAgeChange = (val: number) => {
    setAge(val);
    if (val >= 60 && !sc) {
      setSc(true);
    } else if (val < 60 && sc && !initial?.sc) {
      setSc(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!firstName.trim() || !lastName.trim()) return;

    setSaving(true);
    try {
      const payload: Omit<Member, "id"> = {
        // Strict relational binding:
        householdId: household.id,
        barangayId: household.barangayId || purok?.barangayId || 0,
        teamId: initial?.teamId !== undefined ? initial.teamId : defaultTeamId,
        code: purok?.name || initial?.code || "",
        address: household.address,

        // Names
        firstName: firstName.trim(),
        middleName: middleName.trim(),
        lastName: lastName.trim(),

        // Demographics
        age: Number(age) || 0,
        status,
        religion: religion.trim(),
        remarks: remarks.trim(),

        // Sectors
        sc,
        pwd,
        ip,

        // Role preservation
        is_household_leader: initial?.is_household_leader ?? false,
        is_household_member: initial?.is_household_member ?? true,
        is_purok_leader_indicator: initial?.is_purok_leader_indicator ?? false,

        // Other attributes
        precinct: initial?.precinct ?? "",
        no: initial?.no ?? "",
        pn: initial?.pn ?? "",
      };

      await onSave(payload);
    } finally {
      setSaving(false);
    }
  };

  return (
    <ModalShell title={title} onClose={onClose} width="max-w-xl">
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Scope Confirmation Badge */}
        <div className="rounded-xl border border-indigo-100 bg-indigo-50/50 p-3 flex items-center justify-between text-xs text-indigo-900">
          <div>
            <span className="font-bold">Target Household:</span> {household.householdLeaderName}
          </div>
          <div className="font-medium text-indigo-700">
            {purok?.name || "Purok"} {barangay ? `· ${barangay.name}` : ""}
          </div>
        </div>

        {/* Names Row */}
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <Field label="First Name *">
            <input
              type="text"
              required
              className={inputCls}
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              placeholder="e.g. Maria"
            />
          </Field>
          <Field label="Middle Name">
            <input
              type="text"
              className={inputCls}
              value={middleName}
              onChange={(e) => setMiddleName(e.target.value)}
              placeholder="e.g. Santos"
            />
          </Field>
          <Field label="Last Name *">
            <input
              type="text"
              required
              className={inputCls}
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              placeholder="e.g. Cruz"
            />
          </Field>
        </div>

        {/* Demographics Row */}
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <Field label="Age *">
            <input
              type="number"
              min={0}
              max={130}
              required
              className={inputCls}
              value={age}
              onChange={(e) => handleAgeChange(Number(e.target.value))}
            />
          </Field>

          <Field label="Civil Status *">
            <select
              className={inputCls}
              value={status}
              onChange={(e) => setStatus(e.target.value as CivilStatus)}
            >
              <option value="Single">Single</option>
              <option value="Married">Married</option>
              <option value="Widowed">Widowed</option>
              <option value="Separated">Separated</option>
            </select>
          </Field>

          <Field label="Religion">
            <input
              type="text"
              className={inputCls}
              value={religion}
              onChange={(e) => setReligion(e.target.value)}
              placeholder="e.g. Roman Catholic"
            />
          </Field>
        </div>

        {/* Special Sectors */}
        <div>
          <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-slate-500">
            Special Sectors
          </label>
          <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-3">
            <label className="flex items-center gap-2.5 rounded-xl border border-slate-200 p-3 text-xs font-semibold text-slate-700 cursor-pointer hover:bg-slate-50 transition">
              <input
                type="checkbox"
                checked={sc}
                onChange={(e) => setSc(e.target.checked)}
                className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
              />
              <span>Senior Citizen (SC)</span>
            </label>

            <label className="flex items-center gap-2.5 rounded-xl border border-slate-200 p-3 text-xs font-semibold text-slate-700 cursor-pointer hover:bg-slate-50 transition">
              <input
                type="checkbox"
                checked={pwd}
                onChange={(e) => setPwd(e.target.checked)}
                className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
              />
              <span>PWD</span>
            </label>

            <label className="flex items-center gap-2.5 rounded-xl border border-slate-200 p-3 text-xs font-semibold text-slate-700 cursor-pointer hover:bg-slate-50 transition">
              <input
                type="checkbox"
                checked={ip}
                onChange={(e) => setIp(e.target.checked)}
                className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
              />
              <span>Indigenous (IP)</span>
            </label>
          </div>
        </div>

        {/* Remarks */}
        <Field label="Remarks (Optional)">
          <textarea
            rows={2}
            className={inputCls}
            value={remarks}
            onChange={(e) => setRemarks(e.target.value)}
            placeholder="e.g. Student, OFW, Head of family, etc."
          />
        </Field>

        <FormActions
          onClose={onClose}
          submitLabel={saving ? "Saving..." : initial ? "Update Member" : "Save Member"}
          submitColor="bg-indigo-600 hover:bg-indigo-700"
        />
      </form>
    </ModalShell>
  );
}
