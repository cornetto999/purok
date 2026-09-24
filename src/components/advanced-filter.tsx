import { useMemo, useState } from "react";
import { ChevronDown, Search, SlidersHorizontal, X } from "lucide-react";

interface AdvancedFilterProps {
  query: string;
  onQueryChange: (v: string) => void;
  // Multi-select last name filter
  allLastNames: string[];
  selectedLastNames: string[];
  onSelectedLastNamesChange: (v: string[]) => void;
  // Sector filter
  sectorFilter: string;
  onSectorFilterChange: (v: string) => void;
  // Purok dropdown
  purokOptions: { id: number; label: string }[];
  purokFilter: string;
  onPurokFilterChange: (v: string) => void;
  // Barangay dropdown
  barangayOptions: { id: number; label: string }[];
  barangayFilter: string;
  onBarangayFilterChange: (v: string) => void;
  // Team dropdown
  teamOptions: { id: number; label: string }[];
  teamFilter: string;
  onTeamFilterChange: (v: string) => void;
}

const selectCls =
  "rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 outline-none transition-all focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 hover:border-slate-300 cursor-pointer";

export function AdvancedFilter({
  query, onQueryChange,
  allLastNames, selectedLastNames, onSelectedLastNamesChange,
  sectorFilter, onSectorFilterChange,
  purokOptions, purokFilter, onPurokFilterChange,
  barangayOptions, barangayFilter, onBarangayFilterChange,
  teamOptions, teamFilter, onTeamFilterChange,
}: AdvancedFilterProps) {
  const hasActiveFilters = query || selectedLastNames.length > 0 || sectorFilter !== "all" || purokFilter !== "all" || barangayFilter !== "all" || teamFilter !== "all";

  const clearAll = () => {
    onQueryChange("");
    onSelectedLastNamesChange([]);
    onSectorFilterChange("all");
    onPurokFilterChange("all");
    onBarangayFilterChange("all");
    onTeamFilterChange("all");
  };

  return (
    <div className="space-y-3 rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm">
      {/* Search bar */}
      <div className="relative">
        <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
        <input
          value={query}
          onChange={(e) => onQueryChange(e.target.value)}
          placeholder="Search by name, precinct, or multi-keyword (space separated)…"
          className="w-full rounded-xl border border-slate-200 bg-slate-50/50 py-2.5 pl-10 pr-3 text-sm text-slate-800 outline-none transition-all placeholder:text-slate-400 focus:border-indigo-400 focus:bg-white focus:ring-2 focus:ring-indigo-100"
        />
        {query && (
          <button
            onClick={() => onQueryChange("")}
            className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded-md p-1 text-slate-400 hover:text-slate-600"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        )}
      </div>

      {/* Filter row */}
      <div className="flex flex-wrap items-center gap-2">
        {/* Filter icon label */}
        <span className="flex items-center gap-1 text-xs font-medium text-slate-400">
          <SlidersHorizontal className="h-3 w-3" />
          Filters:
        </span>

        {/* Multi-select last name */}
        <MultiSelectDropdown
          label="Last Name"
          options={allLastNames}
          selected={selectedLastNames}
          onChange={onSelectedLastNamesChange}
        />

        {/* Barangay */}
        <select
          value={barangayFilter}
          onChange={(e) => { onBarangayFilterChange(e.target.value); onPurokFilterChange("all"); }}
          className={selectCls}
        >
          <option value="all">All Barangays</option>
          {barangayOptions.map((b) => <option key={b.id} value={b.id}>{b.label}</option>)}
        </select>

        {/* Purok */}
        <select
          value={purokFilter}
          onChange={(e) => onPurokFilterChange(e.target.value)}
          className={selectCls}
        >
          <option value="all">All Puroks</option>
          {purokOptions.map((p) => <option key={p.id} value={p.id}>{p.label}</option>)}
        </select>

        {/* Sector */}
        <select
          value={sectorFilter}
          onChange={(e) => onSectorFilterChange(e.target.value)}
          className={selectCls}
        >
          <option value="all">All Sectors</option>
          <option value="SC">Senior Citizen (SC)</option>
          <option value="PWD">PWD</option>
          <option value="IP">Indigenous (IP)</option>
        </select>

        {/* Team */}
        <select
          value={teamFilter}
          onChange={(e) => onTeamFilterChange(e.target.value)}
          className={selectCls}
        >
          <option value="all">All Teams</option>
          <option value="unassigned">Unassigned</option>
          {teamOptions.map((t) => (
            <option key={t.id} value={t.id}>
              {t.label}
            </option>
          ))}
        </select>

        {hasActiveFilters && (
          <button
            onClick={clearAll}
            className="flex items-center gap-1 rounded-lg border border-red-100 bg-red-50 px-3 py-2 text-xs font-medium text-red-500 transition-colors hover:border-red-200 hover:bg-red-100"
          >
            <X className="h-3 w-3" /> Clear All
          </button>
        )}
      </div>

      {/* Active filters chips */}
      {selectedLastNames.length > 0 && (
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="text-xs font-medium text-slate-400 leading-6">Filtered by:</span>
          {selectedLastNames.map((name) => (
            <span
              key={name}
              className="inline-flex items-center gap-1 rounded-full bg-indigo-50 px-2.5 py-0.5 text-xs font-medium text-indigo-700 ring-1 ring-inset ring-indigo-200/60"
            >
              {name}
              <button
                onClick={() => onSelectedLastNamesChange(selectedLastNames.filter((n) => n !== name))}
                className="rounded-full p-0.5 hover:bg-indigo-200/50"
              >
                <X className="h-2.5 w-2.5" />
              </button>
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Multi-Select Dropdown ──────────────────────────────────────────────────────

function MultiSelectDropdown({ label, options, selected, onChange }: {
  label: string;
  options: string[];
  selected: string[];
  onChange: (v: string[]) => void;
}) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return q ? options.filter((o) => o.toLowerCase().includes(q)) : options;
  }, [options, search]);

  const toggle = (name: string) => {
    onChange(
      selected.includes(name)
        ? selected.filter((n) => n !== name)
        : [...selected, name]
    );
  };

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className={`flex items-center gap-1.5 rounded-lg border px-3 py-2 text-sm transition-all ${
          selected.length > 0
            ? "border-indigo-300 bg-indigo-50 font-medium text-indigo-700 ring-1 ring-indigo-200/60"
            : "border-slate-200 text-slate-600 hover:border-slate-300 hover:bg-slate-50"
        }`}
      >
        {label}{" "}
        {selected.length > 0 && (
          <span className="rounded-full bg-indigo-600 px-1.5 py-0.5 text-[10px] font-bold text-white">
            {selected.length}
          </span>
        )}
        <ChevronDown className={`h-3.5 w-3.5 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute left-0 top-full z-50 mt-1.5 w-64 rounded-xl border border-slate-200/80 bg-white shadow-xl shadow-slate-900/10">
            <div className="border-b border-slate-100 p-2">
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search names…"
                className="w-full rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1.5 text-xs outline-none focus:border-indigo-400 focus:bg-white focus:ring-2 focus:ring-indigo-100"
                autoFocus
              />
            </div>
            <div className="max-h-48 overflow-y-auto p-1">
              {filtered.length === 0 && (
                <p className="px-3 py-2 text-xs text-slate-400">No matches</p>
              )}
              {filtered.map((name) => (
                <label
                  key={name}
                  className="flex cursor-pointer items-center gap-2 rounded-lg px-2.5 py-1.5 text-sm hover:bg-slate-50"
                >
                  <input
                    type="checkbox"
                    checked={selected.includes(name)}
                    onChange={() => toggle(name)}
                    className="h-3.5 w-3.5 rounded border-slate-300 accent-indigo-600"
                  />
                  {name}
                </label>
              ))}
            </div>
            {selected.length > 0 && (
              <div className="border-t border-slate-100 p-2">
                <button
                  onClick={() => onChange([])}
                  className="w-full rounded-lg py-1 text-xs font-medium text-red-500 hover:bg-red-50"
                >
                  Clear selection
                </button>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
