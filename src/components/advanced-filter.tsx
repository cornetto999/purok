import { useMemo, useState } from "react";
import { ChevronDown, Search, X } from "lucide-react";

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
    <div className="space-y-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      {/* Search bar */}
      <div className="relative">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
        <input
          value={query}
          onChange={(e) => onQueryChange(e.target.value)}
          placeholder="Search by name, precinct, or multi-keyword (space separated)…"
          className="w-full rounded-lg border border-slate-300 bg-white py-2.5 pl-9 pr-3 text-sm outline-none transition focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
        />
      </div>

      {/* Filter row */}
      <div className="flex flex-wrap items-center gap-2">
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
          className="rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none transition focus:border-slate-500"
        >
          <option value="all">All Barangays</option>
          {barangayOptions.map((b) => <option key={b.id} value={b.id}>{b.label}</option>)}
        </select>

        {/* Purok */}
        <select
          value={purokFilter}
          onChange={(e) => onPurokFilterChange(e.target.value)}
          className="rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none transition focus:border-slate-500"
        >
          <option value="all">All Puroks</option>
          {purokOptions.map((p) => <option key={p.id} value={p.id}>{p.label}</option>)}
        </select>

        {/* Sector */}
        <select
          value={sectorFilter}
          onChange={(e) => onSectorFilterChange(e.target.value)}
          className="rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none transition focus:border-slate-500"
        >
          <option value="all">All Sectors</option>
          <option value="SC">Senior Citizen (SC)</option>
          <option value="PWD">PWD</option>
          <option value="IP">Indigenous (IP)</option>
        </select>

        {/* Team */}
        {teamOptions.length > 0 && (
          <select
            value={teamFilter}
            onChange={(e) => onTeamFilterChange(e.target.value)}
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none transition focus:border-slate-500"
          >
            <option value="all">All Teams</option>
            <option value="unassigned">Unassigned</option>
            {teamOptions.map((t) => <option key={t.id} value={t.id}>{t.label}</option>)}
          </select>
        )}

        {hasActiveFilters && (
          <button
            onClick={clearAll}
            className="flex items-center gap-1 rounded-lg border border-red-200 px-3 py-2 text-xs font-medium text-red-600 transition-colors hover:bg-red-50"
          >
            <X className="h-3 w-3" /> Clear All
          </button>
        )}
      </div>

      {/* Active filters display */}
      {selectedLastNames.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          <span className="text-xs text-slate-500 leading-6">Filtered by:</span>
          {selectedLastNames.map((name) => (
            <span
              key={name}
              className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-700"
            >
              {name}
              <button
                onClick={() => onSelectedLastNamesChange(selectedLastNames.filter((n) => n !== name))}
                className="rounded-full p-0.5 hover:bg-slate-200"
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
        className={`flex items-center gap-1.5 rounded-lg border px-3 py-2 text-sm transition-colors ${
          selected.length > 0
            ? "border-slate-500 bg-slate-50 font-medium text-slate-800"
            : "border-slate-300 text-slate-600 hover:border-slate-400"
        }`}
      >
        {label} {selected.length > 0 && <span className="rounded-full bg-slate-800 px-1.5 py-0.5 text-[10px] font-bold text-white">{selected.length}</span>}
        <ChevronDown className={`h-3.5 w-3.5 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute left-0 top-full z-50 mt-1 w-64 rounded-xl border border-slate-200 bg-white shadow-lg">
            <div className="border-b border-slate-100 p-2">
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search names…"
                className="w-full rounded-md border border-slate-200 px-2.5 py-1.5 text-xs outline-none focus:border-slate-400"
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
                  className="flex items-center gap-2 rounded-md px-2.5 py-1.5 text-sm cursor-pointer hover:bg-slate-50"
                >
                  <input
                    type="checkbox"
                    checked={selected.includes(name)}
                    onChange={() => toggle(name)}
                    className="h-3.5 w-3.5 rounded border-slate-300 accent-slate-800"
                  />
                  {name}
                </label>
              ))}
            </div>
            {selected.length > 0 && (
              <div className="border-t border-slate-100 p-2">
                <button
                  onClick={() => onChange([])}
                  className="w-full rounded-md py-1 text-xs font-medium text-red-600 hover:bg-red-50"
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
