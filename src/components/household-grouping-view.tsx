import { useState, useMemo } from "react";
import {
  Home,
  Users,
  Search,
  ChevronDown,
  ChevronRight,
  Shield,
  User,
  Copy,
  Check,
  Code2,
  Download,
  Filter,
  ArrowUpDown,
  Plus,
  Pencil,
  MapPin,
  Sparkles,
  Layers,
  X,
} from "lucide-react";
import type { Household, Member, Purok, Team } from "@/lib/types";
import {
  buildHouseholdGrouping,
  toCleanJson,
  type HouseholdGroupingItem,
} from "@/lib/household-grouping";
import { memberFullName } from "@/lib/types";

interface HouseholdGroupingViewProps {
  purok: Purok;
  households: Household[];
  members: Member[];
  teams: Team[];
  onEditMember?: (member: Member) => void;
  onAddResidentToHousehold?: (householdId: number) => void;
  onCreateHousehold?: () => void;
  highlightMemberId?: number | undefined;
}

export function HouseholdGroupingView({
  purok,
  households,
  members,
  teams,
  onEditMember,
  onAddResidentToHousehold,
  onCreateHousehold,
  highlightMemberId,
}: HouseholdGroupingViewProps) {
  // ── State ──────────────────────────────────────────────────────────────────
  const [searchQuery, setSearchQuery] = useState("");
  const [teamFilter, setTeamFilter] = useState<string>("all");
  const [sortBy, setSortBy] = useState<"id" | "leader" | "members">("id");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());
  const [showJsonModal, setShowJsonModal] = useState(false);
  const [copiedJson, setCopiedJson] = useState(false);

  // ── 1. Data Processing & Grouping Logic ────────────────────────────────────
  const groupedData = useMemo(() => {
    return buildHouseholdGrouping(households, members, teams, purok.id);
  }, [households, members, teams, purok.id]);

  // Expand all by default on first load or when households change
  useMemo(() => {
    const allIds = new Set(groupedData.map((g) => g.household_id));
    setExpandedIds(allIds);
  }, [groupedData]);

  // ── 2. Filtering and Sorting ───────────────────────────────────────────────
  const filteredData = useMemo(() => {
    let result = [...groupedData];

    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter((item) => {
        const addressMatch = item.address.toLowerCase().includes(q);
        const leaderMatch = item.household_leader.name.toLowerCase().includes(q);
        const teamMatch = item.household_leader.team.toLowerCase().includes(q);
        const memberMatch = item.household_members.some((m) =>
          m.name.toLowerCase().includes(q),
        );
        const idMatch = item.household_id.includes(q);
        return addressMatch || leaderMatch || teamMatch || memberMatch || idMatch;
      });
    }

    // Team filter
    if (teamFilter !== "all") {
      result = result.filter(
        (item) => item.household_leader.team === teamFilter,
      );
    }

    // Sorting
    result.sort((a, b) => {
      let cmp = 0;
      if (sortBy === "id") {
        cmp = Number(a.household_id) - Number(b.household_id);
      } else if (sortBy === "leader") {
        cmp = a.household_leader.name.localeCompare(b.household_leader.name);
      } else if (sortBy === "members") {
        cmp = a.total_members - b.total_members;
      }
      return sortOrder === "asc" ? cmp : -cmp;
    });

    return result;
  }, [groupedData, searchQuery, teamFilter, sortBy, sortOrder]);

  // ── 3. Metrics ─────────────────────────────────────────────────────────────
  const totalHouseholds = groupedData.length;
  const totalResidents = groupedData.reduce((acc, curr) => acc + curr.total_members, 0);
  const totalLeaders = groupedData.filter(
    (g) => g.household_leader.name !== "No Leader Assigned",
  ).length;
  const totalMembers = groupedData.reduce(
    (acc, curr) => acc + curr.household_members.length,
    0,
  );

  const teamDistribution = useMemo(() => {
    const counts: Record<string, number> = {};
    groupedData.forEach((item) => {
      const t = item.household_leader.team || "Unassigned";
      counts[t] = (counts[t] || 0) + 1;
    });
    return counts;
  }, [groupedData]);

  // Clean JSON output matching exact requested structure
  const cleanJsonString = useMemo(() => {
    const cleanList = toCleanJson(filteredData);
    return JSON.stringify(cleanList, null, 2);
  }, [filteredData]);

  // Toggle single accordion
  const toggleExpand = (id: string) => {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  // Toggle expand all / collapse all
  const toggleExpandAll = () => {
    if (expandedIds.size === filteredData.length) {
      setExpandedIds(new Set());
    } else {
      setExpandedIds(new Set(filteredData.map((d) => d.household_id)));
    }
  };

  // Handle copy JSON
  const handleCopyJson = async () => {
    try {
      await navigator.clipboard.writeText(cleanJsonString);
      setCopiedJson(true);
      setTimeout(() => setCopiedJson(false), 2000);
    } catch {
      // Fallback
    }
  };

  // Handle download JSON
  const handleDownloadJson = () => {
    const blob = new Blob([cleanJsonString], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `purok-${purok.id}-household-grouping.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* ── Top Overview Banner & Action Controls ─────────────────────────── */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="inline-flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600">
                <Layers className="h-4 w-4" />
              </span>
              <h2 className="text-lg font-bold text-slate-900">
                Household Grouping & Hierarchy
              </h2>
              <span className="rounded-full bg-indigo-100 px-2.5 py-0.5 text-xs font-bold text-indigo-800">
                {purok.name}
              </span>
            </div>
            <p className="mt-1 text-xs text-slate-500">
              Structured view of each household, its designated Household Leader (HL), and associated Household Members (HM).
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setShowJsonModal(true)}
              className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2 text-xs font-semibold text-slate-700 transition-colors hover:bg-slate-100 hover:text-slate-900"
              title="Inspect exact JSON schema"
            >
              <Code2 className="h-3.5 w-3.5 text-indigo-600" />
              Inspect JSON
            </button>

            <button
              onClick={handleCopyJson}
              className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 transition-colors hover:bg-slate-50"
            >
              {copiedJson ? (
                <>
                  <Check className="h-3.5 w-3.5 text-emerald-600" />
                  <span className="text-emerald-700">Copied JSON!</span>
                </>
              ) : (
                <>
                  <Copy className="h-3.5 w-3.5 text-slate-400" />
                  Copy JSON
                </>
              )}
            </button>

            {onCreateHousehold && (
              <button
                onClick={onCreateHousehold}
                className="inline-flex items-center gap-1.5 rounded-xl bg-indigo-600 px-3.5 py-2 text-xs font-bold text-white shadow-xs transition-colors hover:bg-indigo-700 active:scale-95"
              >
                <Plus className="h-3.5 w-3.5" />
                New Household
              </button>
            )}
          </div>
        </div>

        {/* Quick Metrics Bar */}
        <div className="mt-5 grid grid-cols-2 gap-3 border-t border-slate-100 pt-4 sm:grid-cols-4">
          <div className="flex items-center gap-3 rounded-xl bg-slate-50/80 p-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-100 text-indigo-700">
              <Home className="h-5 w-5" />
            </div>
            <div>
              <div className="text-lg font-extrabold text-slate-900">{totalHouseholds}</div>
              <div className="text-[11px] font-medium text-slate-500">Total Households</div>
            </div>
          </div>

          <div className="flex items-center gap-3 rounded-xl bg-slate-50/80 p-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-100 text-emerald-700">
              <Shield className="h-5 w-5" />
            </div>
            <div>
              <div className="text-lg font-extrabold text-slate-900">{totalLeaders}</div>
              <div className="text-[11px] font-medium text-slate-500">Household Leaders (HL)</div>
            </div>
          </div>

          <div className="flex items-center gap-3 rounded-xl bg-slate-50/80 p-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100 text-blue-700">
              <User className="h-5 w-5" />
            </div>
            <div>
              <div className="text-lg font-extrabold text-slate-900">{totalMembers}</div>
              <div className="text-[11px] font-medium text-slate-500">Household Members (HM)</div>
            </div>
          </div>

          <div className="flex items-center gap-3 rounded-xl bg-slate-50/80 p-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-100 text-amber-700">
              <Users className="h-5 w-5" />
            </div>
            <div>
              <div className="text-lg font-extrabold text-slate-900">{totalResidents}</div>
              <div className="text-[11px] font-medium text-slate-500">Total Residents</div>
            </div>
          </div>
        </div>

        {/* Team Pills */}
        <div className="mt-3 flex flex-wrap items-center gap-1.5 pt-2">
          <span className="text-[11px] font-semibold text-slate-400">Team Distribution:</span>
          {Object.entries(teamDistribution).map(([teamName, count]) => (
            <button
              key={teamName}
              onClick={() => setTeamFilter(teamFilter === teamName ? "all" : teamName)}
              className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-medium transition-all ${
                teamFilter === teamName
                  ? "bg-indigo-600 text-white shadow-xs"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              <span>{teamName}:</span>
              <span className="font-bold">{count}</span>
            </button>
          ))}
          {teamFilter !== "all" && (
            <button
              onClick={() => setTeamFilter("all")}
              className="text-[11px] font-semibold text-indigo-600 hover:underline"
            >
              Clear filter
            </button>
          )}
        </div>
      </div>

      {/* ── Filter & Search Toolbar ───────────────────────────────────────── */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search address, leader, or member name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-xl border border-slate-200 bg-white py-2 pl-9 pr-8 text-xs placeholder:text-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 shadow-xs"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>

        <div className="flex items-center gap-2">
          {/* Team Filter Dropdown */}
          <div className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-2.5 py-1.5 text-xs text-slate-600 shadow-xs">
            <Filter className="h-3.5 w-3.5 text-slate-400" />
            <select
              value={teamFilter}
              onChange={(e) => setTeamFilter(e.target.value)}
              className="bg-transparent font-medium text-slate-700 focus:outline-none"
            >
              <option value="all">All Teams ({groupedData.length})</option>
              {Object.keys(teamDistribution).map((name) => (
                <option key={name} value={name}>
                  {name} ({teamDistribution[name]})
                </option>
              ))}
            </select>
          </div>

          {/* Sort Dropdown */}
          <div className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-2.5 py-1.5 text-xs text-slate-600 shadow-xs">
            <ArrowUpDown className="h-3.5 w-3.5 text-slate-400" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as "id" | "leader" | "members")}
              className="bg-transparent font-medium text-slate-700 focus:outline-none"
            >
              <option value="id">Sort by Household ID</option>
              <option value="leader">Sort by Leader Name</option>
              <option value="members">Sort by Member Count</option>
            </select>
            <button
              onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}
              className="rounded p-0.5 text-slate-400 hover:text-slate-700"
              title={`Toggle sort order (${sortOrder.toUpperCase()})`}
            >
              {sortOrder === "asc" ? "↑" : "↓"}
            </button>
          </div>

          {/* Expand/Collapse All */}
          <button
            onClick={toggleExpandAll}
            className="rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-50 shadow-xs"
          >
            {expandedIds.size === filteredData.length ? "Collapse All" : "Expand All"}
          </button>
        </div>
      </div>

      {/* ── Household Structured Cards ────────────────────────────────────── */}
      <div className="space-y-4">
        {filteredData.map((item) => {
          const isExpanded = expandedIds.has(item.household_id);
          const hasMembers = item.household_members.length > 0;
          const leader = item.household_leader;

          return (
            <div
              key={item.household_id}
              className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xs transition-shadow hover:shadow-sm"
            >
              {/* Household Accordion Header */}
              <div
                onClick={() => toggleExpand(item.household_id)}
                className="flex cursor-pointer flex-col gap-3 bg-slate-50/70 p-4 transition-colors hover:bg-slate-100/70 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    className="flex h-7 w-7 items-center justify-center rounded-lg bg-white border border-slate-200 text-slate-500 shadow-xs"
                  >
                    {isExpanded ? (
                      <ChevronDown className="h-4 w-4 text-slate-700" />
                    ) : (
                      <ChevronRight className="h-4 w-4 text-slate-700" />
                    )}
                  </button>

                  <div>
                    <div className="flex items-center gap-2">
                      <span className="rounded-md bg-slate-200/80 px-2 py-0.5 font-mono text-[11px] font-bold text-slate-700">
                        HH #{item.household_id}
                      </span>
                      <span className="flex items-center gap-1 text-xs text-slate-600 font-medium">
                        <MapPin className="h-3.5 w-3.5 text-slate-400" />
                        {item.address}
                      </span>
                    </div>

                    <div className="mt-1 flex items-center gap-2 text-xs">
                      <span className="text-slate-400">Leader:</span>
                      <span className="font-bold text-slate-900">
                        {leader.name}
                      </span>
                      <span
                        className={`rounded-full px-2 py-0.2 text-[10px] font-semibold ${
                          leader.team !== "Unassigned"
                            ? "bg-indigo-50 text-indigo-700 ring-1 ring-indigo-600/20"
                            : "bg-slate-100 text-slate-500"
                        }`}
                      >
                        {leader.team}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3 self-end sm:self-center">
                  <div className="flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-800 ring-1 ring-emerald-600/20">
                    <Users className="h-3.5 w-3.5 text-emerald-600" />
                    <span>
                      {item.total_members} member{item.total_members === 1 ? "" : "s"}
                    </span>
                  </div>

                  {onAddResidentToHousehold && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onAddResidentToHousehold(Number(item.household_id));
                      }}
                      className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-xs font-semibold text-slate-700 hover:bg-slate-50 hover:text-indigo-600"
                    >
                      <Plus className="h-3 w-3" />
                      Add Resident
                    </button>
                  )}
                </div>
              </div>

              {/* Collapsible Content */}
              {isExpanded && (
                <div className="p-4 space-y-4">
                  {/* 1. Household Leader (HL) Spotlight Section */}
                  <div
                    className={`rounded-xl border p-3.5 transition-all ${
                      item.leaderMember?.id === highlightMemberId
                        ? "border-emerald-500 bg-gradient-to-r from-emerald-100/90 via-teal-100/70 to-white ring-2 ring-emerald-500 shadow-md animate-pulse"
                        : "border-emerald-200 bg-gradient-to-r from-emerald-50/60 via-teal-50/40 to-white"
                    }`}
                  >
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-600 text-white shadow-xs">
                          <Shield className="h-5 w-5" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="rounded-md bg-emerald-600 px-1.5 py-0.5 text-[10px] font-black uppercase tracking-wider text-white">
                              HL
                            </span>
                            <span className="font-bold text-slate-900 text-sm">
                              {leader.name}
                            </span>
                            <span
                              className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                                leader.team !== "Unassigned"
                                  ? "bg-indigo-100 text-indigo-800"
                                  : "bg-slate-200 text-slate-600"
                              }`}
                            >
                              {leader.team}
                            </span>
                            {item.leaderMember?.id === highlightMemberId && (
                              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-600 px-2.5 py-0.5 text-[10px] font-black text-white shadow-xs">
                                <Sparkles className="h-3 w-3" />
                                Newly Organized Leader
                              </span>
                            )}
                          </div>

                          <div className="mt-0.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-500">
                            {item.leaderMember?.age ? (
                              <span>Age: {item.leaderMember.age}</span>
                            ) : null}
                            {item.leaderMember?.status ? (
                              <span>Status: {item.leaderMember.status}</span>
                            ) : null}
                            {(item.leaderMember?.precinct || item.leaderMember?.pn) ? (
                              <span className="font-mono text-[11px] text-slate-500">
                                Precinct: {item.leaderMember.precinct || item.leaderMember.pn}
                                {item.leaderMember.no ? ` • #${item.leaderMember.no}` : ""}
                              </span>
                            ) : null}
                            {item.leaderMember && (
                              <div className="flex gap-1">
                                {item.leaderMember.sc && (
                                  <span className="rounded bg-blue-100 px-1 py-0.2 text-[9px] font-bold text-blue-800">
                                    SC
                                  </span>
                                )}
                                {item.leaderMember.pwd && (
                                  <span className="rounded bg-emerald-100 px-1 py-0.2 text-[9px] font-bold text-emerald-800">
                                    PWD
                                  </span>
                                )}
                                {item.leaderMember.ip && (
                                  <span className="rounded bg-amber-100 px-1 py-0.2 text-[9px] font-bold text-amber-800">
                                    IP
                                  </span>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>

                      {item.leaderMember && onEditMember && (
                        <button
                          type="button"
                          onClick={() => onEditMember(item.leaderMember!)}
                          className="self-start sm:self-center inline-flex items-center gap-1 rounded-md border border-emerald-300 bg-white px-2.5 py-1 text-xs font-semibold text-emerald-800 hover:bg-emerald-50 shadow-2xs"
                        >
                          <Pencil className="h-3 w-3" />
                          Edit Leader
                        </button>
                      )}
                    </div>
                  </div>

                  {/* 2. Household Members (HM) Tree & Sub-list */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between px-1">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                        Household Members (HM) · {item.household_members.length}
                      </h4>
                    </div>

                    {hasMembers ? (
                      <div className="divide-y divide-slate-100 rounded-xl border border-slate-200 bg-white">
                        {item.household_members.map((hm) => {
                          const raw = hm.rawMember;
                          const isHighlighted = raw?.id === highlightMemberId;
                          return (
                            <div
                              key={hm.id || hm.name}
                              className={`flex items-center justify-between p-3 transition-colors ${
                                isHighlighted
                                  ? "bg-indigo-50/90 ring-2 ring-indigo-500/50 shadow-xs"
                                  : "hover:bg-slate-50/80"
                              }`}
                            >
                              <div className="flex items-center gap-3">
                                <div
                                  className={`flex h-8 w-8 items-center justify-center rounded-lg font-bold text-xs ${
                                    isHighlighted
                                      ? "bg-indigo-600 text-white shadow-xs"
                                      : "bg-blue-50 text-blue-600"
                                  }`}
                                >
                                  HM
                                </div>

                                <div>
                                  <div className="flex items-center gap-2">
                                    <span className="font-semibold text-slate-900 text-xs sm:text-sm">
                                      {hm.name}
                                    </span>
                                    <span className="rounded bg-slate-100 px-1.5 py-0.2 text-[10px] font-medium text-slate-600">
                                      Age: {hm.age}
                                    </span>
                                    <span className="rounded-full bg-blue-100 px-1.5 py-0.2 text-[10px] font-bold text-blue-800">
                                      {hm.role}
                                    </span>
                                    {isHighlighted && (
                                      <span className="inline-flex items-center gap-1 rounded-full bg-indigo-600 px-2 py-0.2 text-[10px] font-black text-white">
                                        <Sparkles className="h-3 w-3" />
                                        Newly Assigned
                                      </span>
                                    )}
                                  </div>

                                  <div className="mt-0.5 flex flex-wrap items-center gap-x-2 text-[11px] text-slate-500">
                                    {raw?.status && <span>{raw.status}</span>}
                                    {(raw?.precinct || raw?.pn) && (
                                      <span className="font-mono text-slate-500">
                                        Precinct: {raw.precinct || raw.pn}
                                        {raw.no ? ` • #${raw.no}` : ""}
                                      </span>
                                    )}
                                    {raw && (
                                      <div className="flex gap-1">
                                        {raw.sc && (
                                          <span className="rounded bg-blue-100 px-1 py-0.2 text-[9px] font-bold text-blue-800">
                                            SC
                                          </span>
                                        )}
                                        {raw.pwd && (
                                          <span className="rounded bg-emerald-100 px-1 py-0.2 text-[9px] font-bold text-emerald-800">
                                            PWD
                                          </span>
                                        )}
                                        {raw.ip && (
                                          <span className="rounded bg-amber-100 px-1 py-0.2 text-[9px] font-bold text-amber-800">
                                            IP
                                          </span>
                                        )}
                                      </div>
                                    )}
                                  </div>
                                </div>
                              </div>

                              {raw && onEditMember && (
                                <button
                                  type="button"
                                  onClick={() => onEditMember(raw)}
                                  className="inline-flex items-center gap-1 rounded-md border border-slate-200 bg-white px-2 py-1 text-xs font-semibold text-slate-600 hover:bg-slate-50 hover:text-indigo-600"
                                >
                                  <Pencil className="h-3 w-3" />
                                  Edit
                                </button>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50/50 p-4 text-center">
                        <p className="text-xs text-slate-500">
                          No other household members registered under this household yet.
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          );
        })}

        {filteredData.length === 0 && (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-12 text-center">
            <Home className="mx-auto h-10 w-10 text-slate-400" />
            <h3 className="mt-3 text-sm font-bold text-slate-900">No households found</h3>
            <p className="mt-1 text-xs text-slate-500 max-w-sm mx-auto">
              {searchQuery || teamFilter !== "all"
                ? "No households matched your search or team filters. Try clearing your filters."
                : "No households are registered in this Purok yet. Add one using the button below."}
            </p>
            {searchQuery || teamFilter !== "all" ? (
              <button
                onClick={() => {
                  setSearchQuery("");
                  setTeamFilter("all");
                }}
                className="mt-4 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-indigo-600 hover:bg-slate-50"
              >
                Reset Filters
              </button>
            ) : onCreateHousehold ? (
              <button
                onClick={onCreateHousehold}
                className="mt-4 inline-flex items-center gap-1.5 rounded-xl bg-indigo-600 px-4 py-2 text-xs font-semibold text-white hover:bg-indigo-700"
              >
                <Plus className="h-3.5 w-3.5" /> Add First Household
              </button>
            ) : null}
          </div>
        )}
      </div>

      {/* ── JSON Structure Inspection Modal ───────────────────────────────── */}
      {showJsonModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs">
          <div className="relative flex max-h-[85vh] w-full max-w-3xl flex-col rounded-2xl bg-white shadow-2xl overflow-hidden">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-200 bg-slate-50/80 px-6 py-4">
              <div>
                <div className="flex items-center gap-2">
                  <Code2 className="h-4 w-4 text-indigo-600" />
                  <h3 className="text-sm font-bold text-slate-900">
                    Household Grouping JSON Output
                  </h3>
                </div>
                <p className="text-xs text-slate-500 mt-0.5">
                  Exact nested structure processed from Purok #{purok.id} ({filteredData.length} households)
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleCopyJson}
                  className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                >
                  {copiedJson ? (
                    <>
                      <Check className="h-3.5 w-3.5 text-emerald-600" />
                      Copied!
                    </>
                  ) : (
                    <>
                      <Copy className="h-3.5 w-3.5 text-slate-400" />
                      Copy JSON
                    </>
                  )}
                </button>

                <button
                  onClick={handleDownloadJson}
                  className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                >
                  <Download className="h-3.5 w-3.5 text-slate-400" />
                  Download
                </button>

                <button
                  onClick={() => setShowJsonModal(false)}
                  className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Modal Body / JSON Code View */}
            <div className="flex-1 overflow-auto bg-slate-950 p-4 text-xs font-mono text-emerald-400">
              <pre className="whitespace-pre">{cleanJsonString}</pre>
            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-between border-t border-slate-200 bg-slate-50 px-6 py-3 text-xs text-slate-500">
              <span>{filteredData.length} Households · {cleanJsonString.length} bytes</span>
              <button
                onClick={() => setShowJsonModal(false)}
                className="rounded-lg bg-slate-800 px-3 py-1 text-xs font-semibold text-white hover:bg-slate-700"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
