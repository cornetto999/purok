import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { useStore } from "@/lib/store";
import { memberFullName, type Member, type Household, type Purok } from "@/lib/types";
import { AdvancedFilter } from "@/components/advanced-filter";
import { MemberFormModal } from "@/components/member-form-modal";
import { MemberDetailPanel } from "@/components/member-detail-panel";
import { HouseholdModal, PurokModal } from "@/components/entity-modals";

export const Route = createFileRoute("/_authenticated/members")({
  head: () => ({
    meta: [
      { title: "Members — Barangay RMS" },
      { name: "description", content: "Manage barangay residents, households and purok leaders." },
    ],
  }),
  component: MembersPage,
});

type SortKey = "name" | "pn" | "age" | "status" | "purok" | "household";
type SortDir = "asc" | "desc";
type ModalState =
  | { kind: "add-member" }
  | { kind: "edit-member"; data: Member }
  | { kind: "add-household" }
  | { kind: "edit-household"; data: Household }
  | { kind: "add-purok" }
  | { kind: "edit-purok"; data: Purok }
  | null;

function sectorBadges(m: Member) {
  const badges: { label: string; cls: string }[] = [];
  if (m.sc)  badges.push({ label: "SC",  cls: "bg-blue-100 text-blue-800 ring-blue-600/20" });
  if (m.pwd) badges.push({ label: "PWD", cls: "bg-green-100 text-green-800 ring-green-600/20" });
  if (m.ip)  badges.push({ label: "IP",  cls: "bg-orange-100 text-orange-800 ring-orange-600/20" });
  return badges;
}

function MembersPage() {
  const store = useStore();
  const { state } = store;
  const session = state.session!;
  const isAdmin = session.role === "Admin";
  const isPurokLeader = session.role === "Purok Leader";

  // Filters
  const [query, setQuery] = useState("");
  const [selectedLastNames, setSelectedLastNames] = useState<string[]>([]);
  const [barangayFilter, setBarangayFilter] = useState("all");
  const [purokFilter, setPurokFilter] = useState("all");
  const [sectorFilter, setSectorFilter] = useState("all");

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
  const householdById = useMemo(() => new Map(state.households.map((h) => [h.id, h])), [state.households]);
  const purokById = useMemo(() => new Map(state.puroks.map((p) => [p.id, p])), [state.puroks]);
  const barangayById = useMemo(() => new Map(state.barangays.map((b) => [b.id, b])), [state.barangays]);

  // All unique last names
  const allLastNames = useMemo(() => {
    const names = new Set(state.members.map((m) => m.lastName).filter(Boolean));
    return [...names].sort();
  }, [state.members]);

  // Visible puroks (filtered by barangay)
  const visiblePuroks = useMemo(
    () => barangayFilter === "all" ? state.puroks : state.puroks.filter((p) => p.barangayId === Number(barangayFilter)),
    [barangayFilter, state.puroks],
  );

  // Scope members by role
  const scopedMembers = useMemo(() => {
    if (isAdmin) return state.members;
    if (isPurokLeader) {
      const purokHH = new Set(state.households.filter((h) => h.purokId === session.linkedEntityId).map((h) => h.id));
      return state.members.filter((m) => purokHH.has(m.householdId));
    }
    // Household Leader
    return state.members.filter((m) => m.householdId === session.linkedEntityId);
  }, [state.members, state.households, isAdmin, isPurokLeader, session.linkedEntityId]);

  // Filter
  const filtered = useMemo(() => {
    const keywords = query.trim().toLowerCase().split(/\s+/).filter(Boolean);
    return scopedMembers.filter((m) => {
      const household = householdById.get(m.householdId);
      if (!household) return false;
      const purok = purokById.get(household.purokId);
      if (!purok) return false;

      if (barangayFilter !== "all" && purok.barangayId !== Number(barangayFilter)) return false;
      if (purokFilter !== "all" && household.purokId !== Number(purokFilter)) return false;
      if (sectorFilter === "SC" && !m.sc) return false;
      if (sectorFilter === "PWD" && !m.pwd) return false;
      if (sectorFilter === "IP" && !m.ip) return false;
      if (selectedLastNames.length > 0 && !selectedLastNames.includes(m.lastName)) return false;

      if (keywords.length > 0) {
        const text = `${memberFullName(m)} ${m.pn} ${m.precinct} ${m.address}`.toLowerCase();
        if (!keywords.every((kw) => text.includes(kw))) return false;
      }

      return true;
    });
  }, [scopedMembers, query, barangayFilter, purokFilter, sectorFilter, selectedLastNames, householdById, purokById]);

  // Sort
  const sorted = useMemo(() => {
    const arr = [...filtered];
    const dir = sortDir === "asc" ? 1 : -1;
    arr.sort((a, b) => {
      let cmp = 0;
      switch (sortKey) {
        case "name": cmp = memberFullName(a).localeCompare(memberFullName(b)); break;
        case "pn": cmp = a.pn.localeCompare(b.pn); break;
        case "age": cmp = a.age - b.age; break;
        case "status": cmp = a.status.localeCompare(b.status); break;
        case "purok": {
          const pa = purokById.get(householdById.get(a.householdId)?.purokId ?? 0)?.name ?? "";
          const pb = purokById.get(householdById.get(b.householdId)?.purokId ?? 0)?.name ?? "";
          cmp = pa.localeCompare(pb); break;
        }
        case "household": {
          const ha = householdById.get(a.householdId)?.householdLeaderName ?? "";
          const hb = householdById.get(b.householdId)?.householdLeaderName ?? "";
          cmp = ha.localeCompare(hb); break;
        }
      }
      return cmp * dir;
    });
    return arr;
  }, [filtered, sortKey, sortDir, householdById, purokById]);

  // Paginate
  const totalPages = Math.max(1, Math.ceil(sorted.length / perPage));
  const paginated = sorted.slice(page * perPage, (page + 1) * perPage);

  const toggleSort = (key: SortKey) => {
    if (sortKey === key) setSortDir((d) => d === "asc" ? "desc" : "asc");
    else { setSortKey(key); setSortDir("asc"); }
    setPage(0);
  };

  const sortIcon = (key: SortKey) => sortKey === key ? (sortDir === "asc" ? " ↑" : " ↓") : "";

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

  // Households scoped to current user
  const scopedHouseholds = useMemo(() => {
    if (isAdmin) return state.households;
    if (isPurokLeader) return state.households.filter((h) => h.purokId === session.linkedEntityId);
    return state.households.filter((h) => h.id === session.linkedEntityId);
  }, [state.households, isAdmin, isPurokLeader, session.linkedEntityId]);

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
        <h1 className="text-lg font-semibold">Members</h1>
        <p className="text-sm text-slate-500">
          {isAdmin ? "Manage residents, households and purok leaders" : `Members in your ${isPurokLeader ? "purok" : "household"}`}
        </p>
      </header>

      <div className="space-y-4 p-6">
        {/* Action buttons */}
        <div className="flex flex-wrap gap-2">
          <button onClick={() => setModal({ kind: "add-member" })} className="flex items-center gap-1.5 rounded-lg bg-slate-900 px-3 py-2 text-xs font-semibold text-white transition-colors hover:bg-slate-700">
            <Plus className="h-3.5 w-3.5" /> Add Member
          </button>
          {isAdmin && (
            <>
              <button onClick={() => setModal({ kind: "add-household" })} className="flex items-center gap-1.5 rounded-lg bg-indigo-600 px-3 py-2 text-xs font-semibold text-white transition-colors hover:bg-indigo-700">
                <Plus className="h-3.5 w-3.5" /> Add Household
              </button>
              <button onClick={() => setModal({ kind: "add-purok" })} className="flex items-center gap-1.5 rounded-lg bg-emerald-600 px-3 py-2 text-xs font-semibold text-white transition-colors hover:bg-emerald-700">
                <Plus className="h-3.5 w-3.5" /> Add Purok
              </button>
            </>
          )}
        </div>

        {/* Advanced filters */}
        <AdvancedFilter
          query={query} onQueryChange={(v) => { setQuery(v); setPage(0); }}
          allLastNames={allLastNames}
          selectedLastNames={selectedLastNames}
          onSelectedLastNamesChange={(v) => { setSelectedLastNames(v); setPage(0); }}
          sectorFilter={sectorFilter} onSectorFilterChange={(v) => { setSectorFilter(v); setPage(0); }}
          purokOptions={visiblePuroks.map((p) => ({ id: p.id, label: p.name }))}
          purokFilter={purokFilter} onPurokFilterChange={(v) => { setPurokFilter(v); setPage(0); }}
          barangayOptions={state.barangays.map((b) => ({ id: b.id, label: b.name }))}
          barangayFilter={barangayFilter} onBarangayFilterChange={(v) => { setBarangayFilter(v); setPurokFilter("all"); setPage(0); }}
        />

        {/* Data table */}
        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                  <th className="px-4 py-2.5 font-semibold cursor-pointer select-none hover:text-slate-700" onClick={() => toggleSort("name")}>Name{sortIcon("name")}</th>
                  <th className="px-4 py-2.5 font-semibold cursor-pointer select-none hover:text-slate-700" onClick={() => toggleSort("pn")}>PN{sortIcon("pn")}</th>
                  <th className="px-4 py-2.5 font-semibold cursor-pointer select-none hover:text-slate-700" onClick={() => toggleSort("purok")}>Purok{sortIcon("purok")}</th>
                  <th className="px-4 py-2.5 font-semibold cursor-pointer select-none hover:text-slate-700" onClick={() => toggleSort("household")}>Household{sortIcon("household")}</th>
                  <th className="px-4 py-2.5 font-semibold cursor-pointer select-none hover:text-slate-700" onClick={() => toggleSort("age")}>Age{sortIcon("age")}</th>
                  <th className="px-4 py-2.5 font-semibold cursor-pointer select-none hover:text-slate-700" onClick={() => toggleSort("status")}>Status{sortIcon("status")}</th>
                  <th className="px-4 py-2.5 font-semibold">Sectors</th>
                  <th className="px-4 py-2.5 font-semibold">Remarks</th>
                  {(isAdmin || isPurokLeader) && <th className="px-4 py-2.5 font-semibold" />}
                </tr>
              </thead>
              <tbody>
                {paginated.map((m) => {
                  const household = householdById.get(m.householdId);
                  const purok = household ? purokById.get(household.purokId) : undefined;
                  const badges = sectorBadges(m);
                  return (
                    <tr key={m.id} className={`border-b border-slate-100 border-l-3 last:border-b-0 transition-colors hover:bg-slate-50 ${rowBorderColor(m)}`}>
                      <td className="whitespace-nowrap px-4 py-2.5 font-medium cursor-pointer hover:text-indigo-600" onClick={() => setSelected(m)}>
                        {memberFullName(m)}
                      </td>
                      <td className="whitespace-nowrap px-4 py-2.5 text-slate-600">{m.pn || "—"}</td>
                      <td className="whitespace-nowrap px-4 py-2.5 text-slate-600">{purok?.name.split(" - ")[0] ?? "—"}</td>
                      <td className="whitespace-nowrap px-4 py-2.5 text-slate-600">{household?.householdLeaderName ?? "—"}</td>
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
                      {(isAdmin || isPurokLeader) && (
                        <td className="px-4 py-2.5">
                          <div className="flex items-center gap-1">
                            <button onClick={() => setModal({ kind: "edit-member", data: m })} className="rounded-md p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700" title="Edit">
                              <Pencil className="h-3.5 w-3.5" />
                            </button>
                            {isAdmin && (
                              <button onClick={() => { if (confirm(`Delete ${memberFullName(m)}?`)) deleteMember(m.id); }} className="rounded-md p-1 text-slate-400 hover:bg-red-50 hover:text-red-600" title="Delete">
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
                  <tr><td colSpan={9} className="px-4 py-12 text-center text-sm text-slate-400">No members match the current filters.</td></tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Footer / pagination */}
          <div className="flex items-center justify-between border-t border-slate-200 bg-slate-50 px-4 py-2.5">
            <p className="text-xs text-slate-500">
              Showing {paginated.length} of {sorted.length} members (page {page + 1}/{totalPages})
            </p>
            <div className="flex items-center gap-2">
              <select value={perPage} onChange={(e) => { setPerPage(Number(e.target.value)); setPage(0); }} className="rounded-md border border-slate-300 px-2 py-1 text-xs">
                {[25, 50, 100].map((n) => <option key={n} value={n}>{n}/page</option>)}
              </select>
              <button disabled={page === 0} onClick={() => setPage((p) => p - 1)} className="rounded-md border border-slate-300 px-2.5 py-1 text-xs font-medium disabled:opacity-40 hover:bg-white">Prev</button>
              <button disabled={page >= totalPages - 1} onClick={() => setPage((p) => p + 1)} className="rounded-md border border-slate-300 px-2.5 py-1 text-xs font-medium disabled:opacity-40 hover:bg-white">Next</button>
            </div>
          </div>
        </div>

        {/* Household Leaders table (Admin only) */}
        {isAdmin && (
          <div>
            <div className="mb-2 flex items-center justify-between">
              <h2 className="text-sm font-semibold text-slate-700">Household Leaders</h2>
              <button onClick={() => setModal({ kind: "add-household" })} className="flex items-center gap-1 rounded-lg bg-indigo-50 px-3 py-1.5 text-xs font-medium text-indigo-700 hover:bg-indigo-100 transition-colors">
                <Plus className="h-3.5 w-3.5" /> Add Household
              </button>
            </div>
            <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="border-b border-slate-200 bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                      {["Household Leader", "Address", "Purok", "Members", ""].map((h, i) => (
                        <th key={i} className="px-4 py-2.5 font-semibold">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {state.households.map((h) => {
                      const purok = purokById.get(h.purokId);
                      const hMembers = state.members.filter((m) => m.householdId === h.id);
                      return (
                        <tr key={h.id} className="border-b border-slate-100 last:border-0 hover:bg-slate-50">
                          <td className="whitespace-nowrap px-4 py-2.5 font-medium">{h.householdLeaderName}</td>
                          <td className="px-4 py-2.5 text-slate-600">{h.address}</td>
                          <td className="whitespace-nowrap px-4 py-2.5 text-slate-600">{purok?.name.split(" - ")[0] ?? "—"}</td>
                          <td className="px-4 py-2.5 text-slate-600">{hMembers.length}</td>
                          <td className="px-4 py-2.5">
                            <div className="flex items-center gap-1">
                              <button onClick={() => setModal({ kind: "edit-household", data: h })} className="rounded-md p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700"><Pencil className="h-3.5 w-3.5" /></button>
                              <button onClick={() => { if (confirm("Delete household?")) store.deleteHousehold(h.id); }} className="rounded-md p-1 text-slate-400 hover:bg-red-50 hover:text-red-600"><Trash2 className="h-3.5 w-3.5" /></button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Purok Leaders table (Admin only) */}
        {isAdmin && (
          <div>
            <div className="mb-2 flex items-center justify-between">
              <h2 className="text-sm font-semibold text-slate-700">Purok Leaders</h2>
              <button onClick={() => setModal({ kind: "add-purok" })} className="flex items-center gap-1 rounded-lg bg-emerald-50 px-3 py-1.5 text-xs font-medium text-emerald-700 hover:bg-emerald-100 transition-colors">
                <Plus className="h-3.5 w-3.5" /> Add Purok
              </button>
            </div>
            <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="border-b border-slate-200 bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                      {["Purok Name", "Leader", "Barangay", "Households", "Members", ""].map((h, i) => (
                        <th key={i} className="px-4 py-2.5 font-semibold">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {state.puroks.map((p) => {
                      const barangay = barangayById.get(p.barangayId);
                      const pHouses = state.households.filter((h) => h.purokId === p.id);
                      const pMembers = state.members.filter((m) => pHouses.some((h) => h.id === m.householdId));
                      return (
                        <tr key={p.id} className="border-b border-slate-100 last:border-0 hover:bg-slate-50">
                          <td className="whitespace-nowrap px-4 py-2.5 font-medium">{p.name}</td>
                          <td className="whitespace-nowrap px-4 py-2.5 text-slate-600">{p.purokLeaderName}</td>
                          <td className="whitespace-nowrap px-4 py-2.5 text-slate-600">{barangay?.name.replace("Barangay ", "") ?? "—"}</td>
                          <td className="px-4 py-2.5 text-slate-600">{pHouses.length}</td>
                          <td className="px-4 py-2.5 text-slate-600">{pMembers.length}</td>
                          <td className="px-4 py-2.5">
                            <div className="flex items-center gap-1">
                              <button onClick={() => setModal({ kind: "edit-purok", data: p })} className="rounded-md p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700"><Pencil className="h-3.5 w-3.5" /></button>
                              <button onClick={() => { if (confirm(`Delete "${p.name}"?`)) store.deletePurok(p.id); }} className="rounded-md p-1 text-slate-400 hover:bg-red-50 hover:text-red-600"><Trash2 className="h-3.5 w-3.5" /></button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Detail panel */}
      {selected && (
        <MemberDetailPanel
          member={selected}
          householdById={householdById}
          purokById={purokById}
          barangayById={barangayById}
          canManage={isAdmin || isPurokLeader}
          onClose={() => setSelected(null)}
          onEdit={() => setModal({ kind: "edit-member", data: selected })}
          onDelete={() => { if (confirm(`Delete ${memberFullName(selected)}?`)) { deleteMember(selected.id); setSelected(null); } }}
        />
      )}

      {/* Modals */}
      {modal?.kind === "add-member" && (
        <MemberFormModal householdsData={scopedHouseholds} onSave={(d) => saveMember(d)} onClose={() => setModal(null)} />
      )}
      {modal?.kind === "edit-member" && (
        <MemberFormModal initial={modal.data} householdsData={state.households} onSave={(d) => saveMember(d, modal.data.id)} onClose={() => setModal(null)} />
      )}
      {modal?.kind === "add-household" && (
        <HouseholdModal puroksData={state.puroks} onSave={(d) => { store.addHousehold(d); setModal(null); }} onClose={() => setModal(null)} />
      )}
      {modal?.kind === "edit-household" && (
        <HouseholdModal initial={modal.data} puroksData={state.puroks} onSave={(d) => { store.updateHousehold(modal.data.id, d); setModal(null); }} onClose={() => setModal(null)} />
      )}
      {modal?.kind === "add-purok" && (
        <PurokModal barangaysData={state.barangays} onSave={(d) => { store.addPurok(d); setModal(null); }} onClose={() => setModal(null)} />
      )}
      {modal?.kind === "edit-purok" && (
        <PurokModal initial={modal.data} barangaysData={state.barangays} onSave={(d) => { store.updatePurok(modal.data.id, d); setModal(null); }} onClose={() => setModal(null)} />
      )}
    </>
  );
}
