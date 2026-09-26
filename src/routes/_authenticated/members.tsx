import { createFileRoute, useSearch } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { MapPin, Pencil, Plus, Trash2, UserPlus } from "lucide-react";
import { useStore } from "@/lib/store";
import { memberFullName, type Household, type Member } from "@/lib/types";
import { supabase } from "@/lib/supabase";
import { AdvancedFilter } from "@/components/advanced-filter";
import { MemberFormModal } from "@/components/member-form-modal";
import { MemberDetailPanel } from "@/components/member-detail-panel";
import { FastEditPurokModal } from "@/components/fast-edit-modal";
import { EditAndAssignModal } from "@/components/edit-and-assign-modal";
import { ModalShell } from "@/components/modal-shell";
import { BARANGAYS_SEED_DATA } from "@/lib/barangay-data";
import { toast } from "sonner";
import { memberPurokId } from "@/lib/member-assignment";

export const Route = createFileRoute("/_authenticated/members")({
  validateSearch: (search: Record<string, unknown>): { purok?: string } => {
    const purok = String(search["purok"] ?? "");
    return /^\d+$/.test(purok) ? { purok } : {};
  },
  head: () => ({
    meta: [
      { title: "Members — Barangay RMS" },
      { name: "description", content: "Manage barangay resident records." },
    ],
  }),
  component: MembersPage,
});

type SortKey =
  | "name"
  | "precinct"
  | "no"
  | "pn"
  | "age"
  | "status"
  | "purok"
  | "household"
  | "team";
type SortDir = "asc" | "desc";
type ModalState =
  | { kind: "add-member" }
  | { kind: "edit-member"; data: Member }
  | { kind: "claim-member"; data: Member; purokId?: number }
  | { kind: "fast-edit-purok"; data: Member }
  | null;

function sectorBadges(m: Member) {
  const badges: { label: string; cls: string }[] = [];
  if (m.sc)
    badges.push({
      label: "SC",
      cls: "bg-blue-50 text-blue-700 ring-blue-500/25",
    });
  if (m.pwd)
    badges.push({
      label: "PWD",
      cls: "bg-emerald-50 text-emerald-700 ring-emerald-500/25",
    });
  if (m.ip)
    badges.push({
      label: "IP",
      cls: "bg-amber-50 text-amber-700 ring-amber-500/25",
    });
  return badges;
}

export function MembersPage({
  memberListOnly = false,
}: {
  memberListOnly?: boolean;
}) {
  const store = useStore();
  const { state } = store;
  const session = state.session!;
  const isAdmin = session.role === "Admin";
  const isPurokLeader = session.role === "Purok Leader";
  const isMyMemberList = memberListOnly && isPurokLeader;
  const routeSearch = useSearch({ strict: false });

  // Filters
  const [query, setQuery] = useState("");
  const [selectedLastNames, setSelectedLastNames] = useState<string[]>([]);
  const [barangayFilter, setBarangayFilter] = useState("all");
  const [purokFilter, setPurokFilter] = useState(routeSearch.purok ?? "all");
  const [sectorFilter, setSectorFilter] = useState("all");
  const [teamFilter, setTeamFilter] = useState("all");

  // Sort
  const [sortKey, setSortKey] = useState<SortKey>("name");
  const [sortDir, setSortDir] = useState<SortDir>("asc");

  // Pagination
  const [page, setPage] = useState(0);
  const [perPage, setPerPage] = useState(25);

  // Detail + modals
  const [selected, setSelected] = useState<Member | null>(null);
  const [modal, setModal] = useState<ModalState>(null);

  // Lookups
  const householdById = useMemo(
    () => new Map(state.households.map((h) => [h.id, h])),
    [state.households],
  );
  const purokById = useMemo(
    () => new Map(state.puroks.map((p) => [p.id, p])),
    [state.puroks],
  );
  const barangayById = useMemo(
    () => new Map(state.barangays.map((b) => [b.id, b])),
    [state.barangays],
  );
  const leaderPurokId = useMemo(() => {
    if (!isPurokLeader) return null;

    // Primary: use the explicitly linked purok from the user account.
    // This is set when the Purok Leader account is created/edited and is
    // the most reliable source of truth.
    const linkedPurok = state.puroks.find(
      (purok) => session.linkedEntityId != null && Number(purok.id) === Number(session.linkedEntityId),
    );
    if (linkedPurok) return linkedPurok.id;

    // Fallback: if linkedEntityId is null or doesn't match any purok,
    // try to find the purok by the leader's display name.
    const leaderNameTokens = session.displayName
      .trim()
      .toLowerCase()
      .split(/\s+/)
      .filter(Boolean);
    const nameMatchedPurok = state.puroks.find((purok) => {
      const purokLeaderName = purok.purokLeaderName.toLowerCase();
      return leaderNameTokens.length > 0 && leaderNameTokens.every((token) => purokLeaderName.includes(token));
    });

    return nameMatchedPurok?.id ?? null;
  }, [
    isPurokLeader,
    session.displayName,
    session.linkedEntityId,
    state.puroks,
  ]);
  const leaderPurok = useMemo(
    () => state.puroks.find((purok) => purok.id === leaderPurokId),
    [leaderPurokId, state.puroks],
  );
  const leaderBarangay = useMemo(
    () =>
      state.barangays.find(
        (barangay) => barangay.id === leaderPurok?.barangayId,
      ),
    [leaderPurok, state.barangays],
  );

  // All unique last names
  const allLastNames = useMemo(() => {
    const names = new Set(state.members.map((m) => m.lastName).filter(Boolean));
    return [...names].sort();
  }, [state.members]);

  // Visible puroks (filtered by barangay)
  const visiblePuroks = useMemo(
    () =>
      barangayFilter === "all"
        ? state.puroks
        : state.puroks.filter((p) => p.barangayId === Number(barangayFilter)),
    [barangayFilter, state.puroks],
  );

  // Scope members by role
  const scopedMembers = useMemo(() => {
    if (isAdmin) return state.members;
    if (isMyMemberList) {
      if (leaderPurokId == null) return [];
      return state.members.filter(
        (member) => memberPurokId(member, householdById) === Number(leaderPurokId),
      );
    }
    if (isPurokLeader) {
      // Purok Leaders use this roster to locate and claim residents, including
      // those who have not yet been assigned to a purok or barangay household.
      return state.members;
    }
    // Household Leader
    return state.members.filter(
      (m) => m.householdId === session.linkedEntityId,
    );
  }, [
    state.members,
    isAdmin,
    isMyMemberList,
    isPurokLeader,
    leaderPurokId,
    householdById,
    session.linkedEntityId,
  ]);

  // Filter
  const filtered = useMemo(() => {
    const keywords = query.trim().toLowerCase().split(/\s+/).filter(Boolean);
    return scopedMembers.filter((m) => {
      const resolvedPurok = purokById.get(memberPurokId(m, householdById) ?? 0);

      if (
        barangayFilter !== "all" &&
        (resolvedPurok?.barangayId ?? m.barangayId) !== Number(barangayFilter)
      )
        return false;
      if (purokFilter !== "all" && resolvedPurok?.id !== Number(purokFilter))
        return false;
      if (sectorFilter === "SC" && !m.sc) return false;
      if (sectorFilter === "PWD" && !m.pwd) return false;
      if (sectorFilter === "IP" && !m.ip) return false;

      if (teamFilter !== "all") {
        const tid = m.team_id || m.teamId;
        if (teamFilter === "unassigned" && tid) return false;
        if (teamFilter !== "unassigned" && tid !== Number(teamFilter))
          return false;
      }

      if (
        selectedLastNames.length > 0 &&
        !selectedLastNames.includes(m.lastName)
      )
        return false;

      if (keywords.length > 0) {
        const text =
          `${memberFullName(m)} ${m.no} ${m.pn} ${m.precinct} ${m.address}`.toLowerCase();
        if (!keywords.every((kw) => text.includes(kw))) return false;
      }

      return true;
    });
  }, [
    scopedMembers,
    query,
    barangayFilter,
    purokFilter,
    sectorFilter,
    teamFilter,
    selectedLastNames,
    householdById,
    purokById,
  ]);

  // Sort
  const sorted = useMemo(() => {
    const arr = [...filtered];
    const dir = sortDir === "asc" ? 1 : -1;
    arr.sort((a, b) => {
      let cmp = 0;
      switch (sortKey) {
        case "name":
          cmp = memberFullName(a).localeCompare(memberFullName(b));
          break;
        case "precinct":
        case "pn":
          cmp = (a.precinct || a.pn || "").localeCompare(b.precinct || b.pn || "");
          break;
        case "no": {
          const numA = parseInt(a.no, 10);
          const numB = parseInt(b.no, 10);
          if (!isNaN(numA) && !isNaN(numB)) {
            cmp = numA - numB;
          } else {
            cmp = (a.no || "").localeCompare(b.no || "");
          }
          break;
        }
        case "age":
          cmp = a.age - b.age;
          break;
        case "status":
          cmp = a.status.localeCompare(b.status);
          break;
        case "purok": {
          const pa =
            purokById.get(memberPurokId(a, householdById) ?? 0)
              ?.name ?? "";
          const pb =
            purokById.get(memberPurokId(b, householdById) ?? 0)
              ?.name ?? "";
          cmp = pa.localeCompare(pb);
          break;
        }
        case "household": {
          const ha =
            householdById.get(a.householdId)?.householdLeaderName ?? "";
          const hb =
            householdById.get(b.householdId)?.householdLeaderName ?? "";
          cmp = ha.localeCompare(hb);
          break;
        }
        case "team": {
          const tidA = a.team_id || a.teamId;
          const tidB = b.team_id || b.teamId;
          const ta = tidA
            ? state.teams.find((t) => t.id === tidA)?.team_name || ""
            : "";
          const tb = tidB
            ? state.teams.find((t) => t.id === tidB)?.team_name || ""
            : "";
          cmp = ta.localeCompare(tb);
          break;
        }
      }
      return cmp * dir;
    });
    return arr;
  }, [filtered, sortKey, sortDir, householdById, purokById, state.teams]);

  // Paginate
  const totalPages = Math.max(1, Math.ceil(sorted.length / perPage));
  const paginated = sorted.slice(page * perPage, (page + 1) * perPage);

  const toggleSort = (key: SortKey) => {
    if (sortKey === key) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else {
      setSortKey(key);
      setSortDir("asc");
    }
    setPage(0);
  };

  const sortIcon = (key: SortKey) =>
    sortKey === key ? (sortDir === "asc" ? " ↑" : " ↓") : " ↕";

  // CRUD
  const saveMember = async (data: Omit<Member, "id">, id?: number) => {
    if (id !== undefined) {
      await store.updateMember(id, data);
      setSelected((current) =>
        current?.id === id ? { ...current, ...data } : current,
      );
    } else {
      await store.addMember(data);
    }
    toast.success(id !== undefined ? "Member changes saved." : "Member added.");
    setModal(null);
  };

  const deleteMember = (id: number) => {
    store.deleteMember(id);
    if (selected?.id === id) setSelected(null);
  };

  const createHouseholdForLeader = async (
    data: Omit<Household, "id">,
  ): Promise<Household | void> => {
    const { data: created, error } = await supabase
      .from("households")
      .insert([data])
      .select()
      .single();
    if (error) throw new Error(`Failed to create household: ${error.message}`);
    await store.refreshData();
    return created;
  };

  // Households scoped to current user
  const scopedHouseholds = useMemo(() => {
    if (isAdmin) return state.households;
    if (isPurokLeader)
      return state.households.filter((h) => h.purokId === leaderPurokId);
    return state.households.filter((h) => h.id === session.linkedEntityId);
  }, [
    state.households,
    isAdmin,
    isPurokLeader,
    leaderPurokId,
    session.linkedEntityId,
  ]);

  // Sector color for row border
  const rowBorderColor = (m: Member) => {
    if (m.sc) return "border-l-blue-400";
    if (m.pwd) return "border-l-green-400";
    if (m.ip) return "border-l-orange-400";
    return "border-l-transparent";
  };

  return (
    <>
      <header className="border-b border-slate-200/80 bg-white/90 px-6 py-5 backdrop-blur-sm">
        <div className="flex items-center gap-3">
          <h1 className="text-xl font-bold tracking-tight text-slate-900">
            {isMyMemberList
              ? "My Member List"
              : isPurokLeader
                ? "Find Members"
                : "Members"}
          </h1>
          <span className="rounded-full bg-indigo-50 px-2.5 py-0.5 text-xs font-semibold text-indigo-600 ring-1 ring-inset ring-indigo-200/60">
            {sorted.length.toLocaleString()}
          </span>
        </div>
        <p className="mt-0.5 text-sm text-slate-500">
          {isAdmin
            ? "Manage resident records"
            : isMyMemberList
              ? "Residents assigned to your purok"
              : isPurokLeader
                ? "Search and claim resident records"
                : "Members in your household"}
        </p>
      </header>

      <div className="space-y-4 p-6">
        {/* Action buttons */}
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setModal({ kind: "add-member" })}
            className="flex items-center gap-1.5 rounded-lg bg-gradient-to-r from-indigo-600 to-violet-600 px-3.5 py-2 text-xs font-semibold text-white shadow-sm shadow-indigo-200 transition-all hover:from-indigo-700 hover:to-violet-700 hover:shadow-md hover:shadow-indigo-200 active:scale-95"
          >
            <Plus className="h-3.5 w-3.5" /> Add Member
          </button>
        </div>

        {/* Advanced filters */}
        <AdvancedFilter
          query={query}
          onQueryChange={(v) => {
            setQuery(v);
            setPage(0);
          }}
          allLastNames={allLastNames}
          selectedLastNames={selectedLastNames}
          onSelectedLastNamesChange={(v) => {
            setSelectedLastNames(v);
            setPage(0);
          }}
          sectorFilter={sectorFilter}
          onSectorFilterChange={(v) => {
            setSectorFilter(v);
            setPage(0);
          }}
          purokOptions={visiblePuroks.map((p) => ({ id: p.id, label: p.name }))}
          purokFilter={purokFilter}
          onPurokFilterChange={(v) => {
            setPurokFilter(v);
            setPage(0);
          }}
          barangayOptions={state.barangays.map((b) => ({
            id: b.id,
            label: b.name,
          }))}
          barangayFilter={barangayFilter}
          onBarangayFilterChange={(v) => {
            setBarangayFilter(v);
            setPurokFilter("all");
            setPage(0);
          }}
          teamOptions={state.teams.map((t) => ({
            id: t.id,
            label: t.team_name,
          }))}
          teamFilter={teamFilter}
          onTeamFilterChange={(v) => {
            setTeamFilter(v);
            setPage(0);
          }}
        />

        {/* Data table */}
        <div className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-slate-100 bg-gradient-to-r from-slate-50 to-slate-50/50 text-xs uppercase tracking-wider text-slate-400">
                  <th
                    className="px-4 py-3 font-semibold cursor-pointer select-none transition-colors hover:text-indigo-600"
                    onClick={() => toggleSort("name")}
                  >
                    Name{sortIcon("name")}
                  </th>
                  <th
                    className="px-4 py-3 font-semibold cursor-pointer select-none transition-colors hover:text-indigo-600"
                    onClick={() => toggleSort("precinct")}
                  >
                    Precinct{sortIcon("precinct")}
                  </th>
                  <th
                    className="px-4 py-3 font-semibold cursor-pointer select-none transition-colors hover:text-indigo-600"
                    onClick={() => toggleSort("no")}
                  >
                    No.{sortIcon("no")}
                  </th>
                  <th
                    className="px-4 py-3 font-semibold cursor-pointer select-none transition-colors hover:text-indigo-600"
                    onClick={() => toggleSort("purok")}
                  >
                    Purok{sortIcon("purok")}
                  </th>
                  <th
                    className="px-4 py-3 font-semibold cursor-pointer select-none transition-colors hover:text-indigo-600"
                    onClick={() => toggleSort("team")}
                  >
                    Team{sortIcon("team")}
                  </th>
                  <th
                    className="px-4 py-3 font-semibold cursor-pointer select-none transition-colors hover:text-indigo-600"
                    onClick={() => toggleSort("household")}
                  >
                    Household{sortIcon("household")}
                  </th>
                  <th
                    className="px-4 py-3 font-semibold cursor-pointer select-none transition-colors hover:text-indigo-600"
                    onClick={() => toggleSort("age")}
                  >
                    Age{sortIcon("age")}
                  </th>
                  <th
                    className="px-4 py-3 font-semibold cursor-pointer select-none transition-colors hover:text-indigo-600"
                    onClick={() => toggleSort("status")}
                  >
                    Status{sortIcon("status")}
                  </th>
                  <th className="px-4 py-3 font-semibold">Sectors</th>
                  <th className="px-4 py-3 font-semibold">Remarks</th>
                  {(isAdmin || isPurokLeader) && (
                    <th className="px-4 py-3 font-semibold" />
                  )}
                </tr>
              </thead>
              <tbody>
                {paginated.map((m) => {
                  const household = householdById.get(m.householdId);
                  const purok = purokById.get(memberPurokId(m, householdById) ?? 0);
                  const badges = sectorBadges(m);
                  return (
                    <tr
                      key={m.id}
                      onClick={() => setSelected(m)}
                      className={`group cursor-pointer border-b border-slate-100/80 border-l-3 last:border-b-0 transition-all hover:bg-indigo-50/30 hover:shadow-[inset_0_0_0_1px_rgba(99,102,241,0.08)] ${rowBorderColor(m)}`}
                    >
                      <td className="whitespace-nowrap px-4 py-2.5 font-semibold text-slate-800 group-hover:text-indigo-700 transition-colors">
                        {memberFullName(m)}
                      </td>
                      <td className="whitespace-nowrap px-4 py-2.5 text-slate-600 font-mono text-xs">
                        {m.precinct || m.pn || "—"}
                      </td>
                      <td className="whitespace-nowrap px-4 py-2.5 text-slate-600 font-mono text-xs">
                        {m.no || "—"}
                      </td>
                      <td className="whitespace-nowrap px-4 py-2.5 text-slate-600">
                        {purok?.name.split(" - ")[0] ?? "—"}
                      </td>
                      <td className="whitespace-nowrap px-4 py-2.5 text-slate-600">
                        {(m.team_id || m.teamId)
                          ? state.teams.find((t) => t.id === (m.team_id || m.teamId))
                              ?.team_name
                          : "—"}
                      </td>
                      <td className="whitespace-nowrap px-4 py-2.5 text-slate-600">
                        {household?.householdLeaderName ?? "—"}
                      </td>
                      <td className="px-4 py-2.5 text-slate-600">{m.age}</td>
                      <td className="px-4 py-2.5 text-slate-600">{m.status}</td>
                      <td className="px-4 py-2.5">
                        <div className="flex gap-1">
                          {badges.length === 0 && (
                            <span className="text-xs text-slate-300">—</span>
                          )}
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
                      {(isAdmin || isPurokLeader) && (
                        <td className="px-4 py-2.5">
                          <div className="flex items-center gap-1">
                            {isAdmin && (
                              <button
                                onClick={(event) => {
                                  event.stopPropagation();
                                  setModal({
                                    kind: "fast-edit-purok",
                                    data: m,
                                  });
                                }}
                                className="rounded-md p-1 text-slate-400 hover:bg-indigo-50 hover:text-indigo-600"
                                title="Fast Edit — Move Purok & Barangay"
                              >
                                <MapPin className="h-3.5 w-3.5" />
                              </button>
                            )}
                            <button
                              onClick={(event) => {
                                event.stopPropagation();
                                setModal({
                                  kind: isPurokLeader
                                    ? "claim-member"
                                    : "edit-member",
                                  data: m,
                                });
                              }}
                              className="rounded-md p-1 text-slate-400 hover:bg-emerald-50 hover:text-emerald-700"
                              title={
                                isPurokLeader
                                  ? "Claim and assign to household or team"
                                  : "Full Edit"
                              }
                            >
                              {isPurokLeader ? (
                                <UserPlus className="h-3.5 w-3.5" />
                              ) : (
                                <Pencil className="h-3.5 w-3.5" />
                              )}
                            </button>
                            {isAdmin && (
                              <button
                                onClick={(event) => {
                                  event.stopPropagation();
                                  if (confirm(`Delete ${memberFullName(m)}?`))
                                    deleteMember(m.id);
                                }}
                                className="rounded-md p-1 text-slate-400 hover:bg-red-50 hover:text-red-600"
                                title="Delete"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </button>
                            )}
                          </div>
                        </td>
                      )}
                    </tr>
                  );
                })}
                {paginated.length === 0 && (
                  <tr>
                    <td
                      colSpan={11}
                      className="px-4 py-16 text-center"
                    >
                      <div className="flex flex-col items-center gap-2">
                        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-100">
                          <svg className="h-6 w-6 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                        </div>
                        <p className="text-sm font-medium text-slate-500">
                          {isMyMemberList && scopedMembers.length === 0
                            ? "No claimed members yet"
                            : "No members match the current filters"}
                        </p>
                        <p className="text-xs text-slate-400">
                          {isMyMemberList && scopedMembers.length === 0
                            ? "Claim a resident in Find Members to add them to this list."
                            : "Try adjusting your search or filter criteria"}
                        </p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Footer / pagination */}
          <div className="flex items-center justify-between border-t border-slate-100 bg-slate-50/80 px-4 py-2.5">
            <p className="text-xs text-slate-400">
              Showing{" "}
              <span className="font-semibold text-slate-600">{paginated.length}</span>{" "}
              of{" "}
              <span className="font-semibold text-slate-600">{sorted.length.toLocaleString()}</span>{" "}
              members
              <span className="ml-1 text-slate-300">· page {page + 1} / {totalPages}</span>
            </p>
            <div className="flex items-center gap-2">
              <select
                value={perPage}
                onChange={(e) => {
                  setPerPage(Number(e.target.value));
                  setPage(0);
                }}
                className="rounded-lg border border-slate-200 bg-white px-2 py-1 text-xs text-slate-600 outline-none focus:border-indigo-400 focus:ring-1 focus:ring-indigo-100"
              >
                {[25, 50, 100].map((n) => (
                  <option key={n} value={n}>
                    {n} / page
                  </option>
                ))}
              </select>
              <button
                disabled={page === 0}
                onClick={() => setPage((p) => p - 1)}
                className="rounded-lg border border-slate-200 bg-white px-3 py-1 text-xs font-medium text-slate-600 transition-colors disabled:opacity-35 hover:border-indigo-300 hover:bg-indigo-50 hover:text-indigo-600"
              >
                ← Prev
              </button>
              <button
                disabled={page >= totalPages - 1}
                onClick={() => setPage((p) => p + 1)}
                className="rounded-lg border border-slate-200 bg-white px-3 py-1 text-xs font-medium text-slate-600 transition-colors disabled:opacity-35 hover:border-indigo-300 hover:bg-indigo-50 hover:text-indigo-600"
              >
                Next →
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Detail panel */}
      {selected && (
        <MemberDetailPanel
          member={selected}
          householdById={householdById}
          purokById={purokById}
          barangayById={barangayById}
          canManage={isAdmin || isPurokLeader}
          canDelete={isAdmin}
          editLabel={isPurokLeader ? "Claim & Assign" : undefined}
          onClose={() => setSelected(null)}
          onEdit={() => {
            setSelected(null);
            setModal({
              kind: isPurokLeader ? "claim-member" : "edit-member",
              data: selected,
            });
          }}
          onFastEdit={
            isAdmin
              ? () => setModal({ kind: "fast-edit-purok", data: selected })
              : undefined
          }
          onDelete={() => {
            if (confirm(`Delete ${memberFullName(selected)}?`)) {
              deleteMember(selected.id);
              setSelected(null);
            }
          }}
        />
      )}

      {/* Modals */}
      {modal?.kind === "add-member" && (
        <MemberFormModal
          householdsData={scopedHouseholds}
          barangaysData={state.barangays}
          puroksData={state.puroks}
          onSave={(d) => saveMember(d)}
          onClose={() => setModal(null)}
        />
      )}
      {modal?.kind === "edit-member" && (
        <MemberFormModal
          initial={modal.data}
          householdsData={state.households}
          barangaysData={state.barangays}
          puroksData={state.puroks}
          onSave={(d) => saveMember(d, modal.data.id)}
          onClose={() => setModal(null)}
        />
      )}
      {modal?.kind === "claim-member" &&
        (() => {
          // For Purok Leaders: default claim destination is always their own purok.
          // Use modal.purokId if explicitly set (rare override), otherwise fall back
          // to leaderPurokId so the picker is skipped automatically.
          const resolvedPurokId = modal.purokId ?? leaderPurokId ?? undefined;
          const claimPurok = state.puroks.find(
            (purok) => purok.id === resolvedPurokId,
          );
          const claimBarangay = state.barangays.find(
            (barangay) => barangay.id === claimPurok?.barangayId,
          );

          if (!claimPurok) {
            return (
              <ClaimPurokPicker
                puroks={state.puroks}
                barangays={state.barangays}
                onSelect={async (purokId) => {
                  await store.refreshData();
                  setModal({ ...modal, purokId });
                }}
                onClose={() => setModal(null)}
              />
            );
          }

          return (
            <EditAndAssignModal
              member={modal.data}
              leaderPurok={claimPurok}
              leaderBarangay={claimBarangay}
              purokHouseholds={state.households.filter(
                (household) => household.purokId === claimPurok.id,
              )}
              onSave={async (updatedData) => {
                if (session.linkedEntityId !== claimPurok.id) {
                  await store.assignLeaderPurok(claimPurok.id);
                }
                await store.updateMember(modal.data.id, updatedData);
                if (selected?.id === modal.data.id) {
                  setSelected({ ...selected, ...updatedData });
                }
                toast.success(`${memberFullName(modal.data)} successfully claimed and assigned to household!`);
              }}
              onCreateHousehold={createHouseholdForLeader}
              onClose={() => setModal(null)}
            />
          );
        })()}
      {modal?.kind === "fast-edit-purok" && (
        <FastEditPurokModal
          member={modal.data}
          barangaysData={state.barangays}
          puroksData={state.puroks}
          householdsData={state.households}
          onSave={async (memberId, newHouseholdId, newAddress) => {
            const updatePayload: Partial<Member> = {
              householdId: newHouseholdId,
            };
            if (newAddress) updatePayload.address = newAddress;
            await store.updateMember(memberId, updatePayload);
            if (selected?.id === memberId) {
              setSelected({ ...selected, ...updatePayload });
            }
            setModal(null);
          }}
          onClose={() => setModal(null)}
        />
      )}
    </>
  );
}

function ClaimPurokPicker({
  puroks,
  barangays,
  onSelect,
  onClose,
}: {
  puroks: { id: number; barangayId: number; name: string }[];
  barangays: { id: number; name: string; barangayCaptainName: string }[];
  onSelect: (purokId: number) => Promise<void>;
  onClose: () => void;
}) {
  const [selectedBarangayName, setSelectedBarangayName] = useState(
    () => barangays[0]?.name ?? BARANGAYS_SEED_DATA[0]?.name ?? "",
  );
  const [selectedPurokName, setSelectedPurokName] = useState("");
  const [saving, setSaving] = useState(false);

  const selectedBarangay = BARANGAYS_SEED_DATA.find(
    (barangay) => barangay.name === selectedBarangayName,
  );
  const availablePurokNames =
    selectedBarangay?.puroks ??
    puroks
      .filter(
        (purok) =>
          barangays.find((barangay) => barangay.id === purok.barangayId)
            ?.name === selectedBarangayName,
      )
      .map((purok) => purok.name);

  const handleBarangayChange = (barangayName: string) => {
    setSelectedBarangayName(barangayName);
    setSelectedPurokName("");
  };

  const handleContinue = async () => {
    if (!selectedBarangayName || !selectedPurokName || saving) return;
    setSaving(true);
    try {
      let barangay = barangays.find(
        (item) =>
          item.name.toLowerCase() === selectedBarangayName.toLowerCase(),
      );
      if (!barangay) {
        const { data, error } = await supabase
          .from("barangays")
          .insert([{ name: selectedBarangayName, barangayCaptainName: "—" }])
          .select()
          .single();
        if (error || !data) {
          throw new Error(error?.message || "Could not create barangay.");
        }
        barangay = data;
      }

      let purok = puroks.find(
        (item) =>
          item.barangayId === barangay!.id &&
          item.name.toLowerCase() === selectedPurokName.toLowerCase(),
      );
      if (!purok) {
        const { data, error } = await supabase
          .from("puroks")
          .insert([
            {
              barangayId: barangay!.id,
              name: selectedPurokName,
              purokLeaderName: "—",
            },
          ])
          .select()
          .single();
        if (error || !data) {
          throw new Error(error?.message || "Could not create purok.");
        }
        purok = data;
      }

      if (purok) {
        await onSelect(purok!.id);
      }
    } finally {
      setSaving(false);
    }
  };

  return (
    <ModalShell title="Claim Destination" onClose={onClose}>
      <p className="mb-4 text-sm text-slate-600">
        Select the barangay and purok where this resident will be assigned.
      </p>
      <div className="space-y-4">
        <label className="block text-xs font-semibold uppercase tracking-wide text-slate-600">
          Barangay
          <select
            className="mt-1.5 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-normal normal-case outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100"
            value={selectedBarangayName}
            onChange={(event) => handleBarangayChange(event.target.value)}
          >
            {BARANGAYS_SEED_DATA.map((barangay) => (
              <option key={barangay.name} value={barangay.name}>
                {barangay.name}
              </option>
            ))}
          </select>
        </label>
        <label className="block text-xs font-semibold uppercase tracking-wide text-slate-600">
          Purok / Zone / Sitio
          <select
            className="mt-1.5 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-normal normal-case outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100"
            value={selectedPurokName}
            onChange={(event) => setSelectedPurokName(event.target.value)}
          >
            <option value="">Select a purok</option>
            {availablePurokNames.map((name) => (
              <option key={name} value={name}>
                {name}
              </option>
            ))}
          </select>
        </label>
        <button
          type="button"
          onClick={() => void handleContinue()}
          disabled={!selectedPurokName || saving}
          className="w-full rounded-lg bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {saving ? "Preparing assignment…" : "Continue to Household & Team"}
        </button>
      </div>
    </ModalShell>
  );
}
