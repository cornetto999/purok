import { createFileRoute } from "@tanstack/react-router";
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

export const Route = createFileRoute("/_authenticated/members")({
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
      cls: "bg-blue-100 text-blue-800 ring-blue-600/20",
    });
  if (m.pwd)
    badges.push({
      label: "PWD",
      cls: "bg-green-100 text-green-800 ring-green-600/20",
    });
  if (m.ip)
    badges.push({
      label: "IP",
      cls: "bg-orange-100 text-orange-800 ring-orange-600/20",
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

  // Filters
  const [query, setQuery] = useState("");
  const [selectedLastNames, setSelectedLastNames] = useState<string[]>([]);
  const [barangayFilter, setBarangayFilter] = useState("all");
  const [purokFilter, setPurokFilter] = useState("all");
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

    const linkedPurok = state.puroks.find(
      (purok) => purok.id === session.linkedEntityId,
    );
    const leaderNameTokens = session.displayName
      .trim()
      .toLowerCase()
      .split(/\s+/)
      .filter(Boolean);
    const nameMatchedPurok = state.puroks.find((purok) => {
      const purokLeaderName = purok.purokLeaderName.toLowerCase();
      return leaderNameTokens.every((token) => purokLeaderName.includes(token));
    });

    if (!linkedPurok || !nameMatchedPurok) {
      return linkedPurok?.id ?? nameMatchedPurok?.id ?? null;
    }

    if (linkedPurok.id === nameMatchedPurok.id) return linkedPurok.id;

    // Some older Purok Leader accounts point to a Purok that has households
    // but no residents assigned to it. Prefer the Purok that actually contains
    // the leader's assigned residents when the profile name gives us a match.
    const assignedMemberCount = (purok: Purok) =>
      state.members.filter((member) => {
        const household = state.households.find(
          (item) => item.id === member.householdId,
        );
        return (
          household?.purokId === purok.id ||
          (member.barangayId === purok.barangayId &&
            member.code.trim().toLowerCase() === purok.name.trim().toLowerCase())
        );
      }).length;

    return assignedMemberCount(nameMatchedPurok) > assignedMemberCount(linkedPurok)
      ? nameMatchedPurok.id
      : linkedPurok.id;
  }, [
    isPurokLeader,
    session.displayName,
    session.linkedEntityId,
    state.households,
    state.members,
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
      const myHouseholdIds = new Set(
        state.households
          .filter((household) => household.purokId === leaderPurokId)
          .map((household) => household.id),
      );
      return state.members.filter((member) => {
        const assignedByHousehold = myHouseholdIds.has(member.householdId);
        const assignedDirectly = member.purok_id === leaderPurokId;
        return assignedByHousehold || assignedDirectly;
      });
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
    state.households,
    isAdmin,
    isMyMemberList,
    isPurokLeader,
    leaderPurokId,
    leaderPurok,
    session.linkedEntityId,
  ]);

  // Filter
  const filtered = useMemo(() => {
    const keywords = query.trim().toLowerCase().split(/\s+/).filter(Boolean);
    return scopedMembers.filter((m) => {
      const household = householdById.get(m.householdId);
      // A claimed resident can be linked directly to a Purok while their
      // household record is still being synchronized. Keep that resident in
      // the leader's roster rather than dropping them from the table.
      const purok = household
        ? purokById.get(household.purokId)
        : isMyMemberList
          ? leaderPurok
          : undefined;
      if (!purok) return false;

      if (
        barangayFilter !== "all" &&
        purok.barangayId !== Number(barangayFilter)
      )
        return false;
      if (purokFilter !== "all" && household?.purokId !== Number(purokFilter))
        return false;
      if (sectorFilter === "SC" && !m.sc) return false;
      if (sectorFilter === "PWD" && !m.pwd) return false;
      if (sectorFilter === "IP" && !m.ip) return false;

      if (teamFilter !== "all") {
        if (teamFilter === "unassigned" && m.teamId) return false;
        if (teamFilter !== "unassigned" && m.teamId !== Number(teamFilter))
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
    isMyMemberList,
    leaderPurok,
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
            purokById.get(householdById.get(a.householdId)?.purokId ?? 0)
              ?.name ?? "";
          const pb =
            purokById.get(householdById.get(b.householdId)?.purokId ?? 0)
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
          const ta = a.teamId
            ? state.teams.find((t) => t.id === a.teamId)?.team_name || ""
            : "";
          const tb = b.teamId
            ? state.teams.find((t) => t.id === b.teamId)?.team_name || ""
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
    sortKey === key ? (sortDir === "asc" ? " ↑" : " ↓") : "";

  // CRUD
  const saveMember = (data: Omit<Member, "id">, id?: number) => {
    if (id !== undefined) {
      store.updateMember(id, data);
      if (selected?.id === id) setSelected({ ...data, id });
    } else {
      store.addMember(data);
    }
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
      <header className="border-b border-slate-200 bg-white px-6 py-4">
        <h1 className="text-lg font-semibold">
          {isMyMemberList
            ? "My Member List"
            : isPurokLeader
              ? "Find Members"
              : "Members"}
        </h1>
        <p className="text-sm text-slate-500">
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
            className="flex items-center gap-1.5 rounded-lg bg-slate-900 px-3 py-2 text-xs font-semibold text-white transition-colors hover:bg-slate-700"
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
        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                  <th
                    className="px-4 py-2.5 font-semibold cursor-pointer select-none hover:text-slate-700"
                    onClick={() => toggleSort("name")}
                  >
                    Name{sortIcon("name")}
                  </th>
                  <th
                    className="px-4 py-2.5 font-semibold cursor-pointer select-none hover:text-slate-700"
                    onClick={() => toggleSort("precinct")}
                  >
                    Precinct{sortIcon("precinct")}
                  </th>
                  <th
                    className="px-4 py-2.5 font-semibold cursor-pointer select-none hover:text-slate-700"
                    onClick={() => toggleSort("no")}
                  >
                    No.{sortIcon("no")}
                  </th>
                  <th
                    className="px-4 py-2.5 font-semibold cursor-pointer select-none hover:text-slate-700"
                    onClick={() => toggleSort("purok")}
                  >
                    Purok{sortIcon("purok")}
                  </th>
                  <th
                    className="px-4 py-2.5 font-semibold cursor-pointer select-none hover:text-slate-700"
                    onClick={() => toggleSort("team")}
                  >
                    Team{sortIcon("team")}
                  </th>
                  <th
                    className="px-4 py-2.5 font-semibold cursor-pointer select-none hover:text-slate-700"
                    onClick={() => toggleSort("household")}
                  >
                    Household{sortIcon("household")}
                  </th>
                  <th
                    className="px-4 py-2.5 font-semibold cursor-pointer select-none hover:text-slate-700"
                    onClick={() => toggleSort("age")}
                  >
                    Age{sortIcon("age")}
                  </th>
                  <th
                    className="px-4 py-2.5 font-semibold cursor-pointer select-none hover:text-slate-700"
                    onClick={() => toggleSort("status")}
                  >
                    Status{sortIcon("status")}
                  </th>
                  <th className="px-4 py-2.5 font-semibold">Sectors</th>
                  <th className="px-4 py-2.5 font-semibold">Remarks</th>
                  {(isAdmin || isPurokLeader) && (
                    <th className="px-4 py-2.5 font-semibold" />
                  )}
                </tr>
              </thead>
              <tbody>
                {paginated.map((m) => {
                  const household = householdById.get(m.householdId);
                  const purok = household
                    ? purokById.get(household.purokId)
                    : isMyMemberList
                      ? leaderPurok
                      : undefined;
                  const badges = sectorBadges(m);
                  return (
                    <tr
                      key={m.id}
                      onClick={() => setSelected(m)}
                      className={`cursor-pointer border-b border-slate-100 border-l-3 last:border-b-0 transition-colors hover:bg-slate-50 ${rowBorderColor(m)}`}
                    >
                      <td className="whitespace-nowrap px-4 py-2.5 font-medium">
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
                        {m.teamId
                          ? state.teams.find((t) => t.id === m.teamId)
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
                      colSpan={9}
                      className="px-4 py-12 text-center text-sm text-slate-400"
                    >
                      No members match the current filters.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Footer / pagination */}
          <div className="flex items-center justify-between border-t border-slate-200 bg-slate-50 px-4 py-2.5">
            <p className="text-xs text-slate-500">
              Showing {paginated.length} of {sorted.length} members (page{" "}
              {page + 1}/{totalPages})
            </p>
            <div className="flex items-center gap-2">
              <select
                value={perPage}
                onChange={(e) => {
                  setPerPage(Number(e.target.value));
                  setPage(0);
                }}
                className="rounded-md border border-slate-300 px-2 py-1 text-xs"
              >
                {[25, 50, 100].map((n) => (
                  <option key={n} value={n}>
                    {n}/page
                  </option>
                ))}
              </select>
              <button
                disabled={page === 0}
                onClick={() => setPage((p) => p - 1)}
                className="rounded-md border border-slate-300 px-2.5 py-1 text-xs font-medium disabled:opacity-40 hover:bg-white"
              >
                Prev
              </button>
              <button
                disabled={page >= totalPages - 1}
                onClick={() => setPage((p) => p + 1)}
                className="rounded-md border border-slate-300 px-2.5 py-1 text-xs font-medium disabled:opacity-40 hover:bg-white"
              >
                Next
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
          const claimPurok = state.puroks.find(
            (purok) => purok.id === modal.purokId,
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
          item.barangayId === barangay.id &&
          item.name.toLowerCase() === selectedPurokName.toLowerCase(),
      );
      if (!purok) {
        const { data, error } = await supabase
          .from("puroks")
          .insert([
            {
              barangayId: barangay.id,
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

      await onSelect(purok.id);
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
