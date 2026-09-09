import { useState, useMemo } from "react";
import {
  Accessibility,
  AlertTriangle,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Filter,
  Flag,
  HelpCircle,
  Plus,
  Search,
  UserCheck,
  Users,
  X,
} from "lucide-react";
import type { Member, Purok, Household, Barangay } from "@/lib/types";
import { memberFullName } from "@/lib/types";

interface PurokLeaderSearchClaimProps {
  barangayMembers: Member[];
  puroks: Purok[];
  households: Household[];
  leaderPurok: Purok;
  leaderBarangay?: Barangay;
  onEditAndAssign: (member: Member) => void;
  onAddNewMember: (initialQuery?: string) => void;
}

type StatusFilter = "all" | "unassigned" | "my-purok" | "other-purok";

export function PurokLeaderSearchClaim({
  barangayMembers,
  puroks,
  households,
  leaderPurok,
  leaderBarangay,
  onEditAndAssign,
  onAddNewMember,
}: PurokLeaderSearchClaimProps) {
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [page, setPage] = useState(0);
  const [perPage, setPerPage] = useState(15);

  const householdById = useMemo(
    () => new Map(households.map((h) => [h.id, h])),
    [households],
  );

  const purokById = useMemo(
    () => new Map(puroks.map((p) => [p.id, p])),
    [puroks],
  );

  // Helper to determine status category for each member
  const getMemberStatusInfo = (m: Member) => {
    const hh = householdById.get(m.householdId);
    const pk = hh ? purokById.get(hh.purokId) : undefined;

    // Check if code or purok indicates unassigned
    const isUnassigned =
      !pk ||
      pk.name.toLowerCase().includes("unassigned") ||
      !m.code ||
      m.code.toLowerCase() === "null" ||
      m.code.toLowerCase().includes("unassigned") ||
      (hh?.householdLeaderName === "General Household" && (!m.code || m.code.toLowerCase().includes("unassigned")));

    if (isUnassigned) {
      return {
        category: "unassigned" as const,
        label: "Unassigned",
        purokName: "Unassigned",
        badgeCls: "bg-slate-100 text-slate-700 ring-slate-300",
        icon: <HelpCircle className="h-3.5 w-3.5 text-slate-500" />,
      };
    }

    if (pk?.id === leaderPurok.id || m.code === leaderPurok.name) {
      return {
        category: "my-purok" as const,
        label: "Assigned to Your Purok",
        purokName: leaderPurok.name,
        badgeCls: "bg-emerald-50 text-emerald-800 ring-emerald-600/30",
        icon: <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />,
      };
    }

    return {
      category: "other-purok" as const,
      label: `Assigned to ${pk?.name || "Other Purok"}`,
      purokName: pk?.name || "Other Purok",
      badgeCls: "bg-amber-50 text-amber-900 ring-amber-600/30",
      icon: <AlertTriangle className="h-3.5 w-3.5 text-amber-600" />,
    };
  };

  // Counts for status filter pills
  const counts = useMemo(() => {
    let unassigned = 0;
    let myPurok = 0;
    let otherPurok = 0;

    for (const m of barangayMembers) {
      const info = getMemberStatusInfo(m);
      if (info.category === "unassigned") unassigned++;
      else if (info.category === "my-purok") myPurok++;
      else otherPurok++;
    }

    return {
      all: barangayMembers.length,
      unassigned,
      myPurok,
      otherPurok,
    };
  }, [barangayMembers, householdById, purokById, leaderPurok.id, leaderPurok.name]);

  // Filtered members
  const filtered = useMemo(() => {
    const rawTokens = query.trim().toLowerCase().split(/\s+/).filter(Boolean);

    return barangayMembers.filter((m) => {
      const statusInfo = getMemberStatusInfo(m);

      // Status filter
      if (statusFilter === "unassigned" && statusInfo.category !== "unassigned")
        return false;
      if (statusFilter === "my-purok" && statusInfo.category !== "my-purok")
        return false;
      if (statusFilter === "other-purok" && statusInfo.category !== "other-purok")
        return false;

      // Search query filter (first_name, last_name, middle_name, pn, address)
      if (rawTokens.length > 0) {
        const searchable = [
          m.firstName,
          m.lastName,
          m.middleName,
          m.pn,
          m.precinct,
          m.address,
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();

        if (!rawTokens.every((token) => searchable.includes(token))) {
          return false;
        }
      }

      return true;
    });
  }, [barangayMembers, query, statusFilter, householdById, purokById, leaderPurok.id, leaderPurok.name]);

  // Paginated records
  const totalPages = Math.max(1, Math.ceil(filtered.length / perPage));
  const paginated = useMemo(() => {
    const start = page * perPage;
    return filtered.slice(start, start + perPage);
  }, [filtered, page, perPage]);

  const handleQueryChange = (val: string) => {
    setQuery(val);
    setPage(0);
  };

  const handleStatusFilterChange = (status: StatusFilter) => {
    setStatusFilter(status);
    setPage(0);
  };

  return (
    <div className="space-y-4">
      {/* Search & Claim Hero Header */}
      <div className="overflow-hidden rounded-2xl border border-indigo-200/80 bg-gradient-to-br from-indigo-900 via-slate-900 to-indigo-950 p-6 text-white shadow-md">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center rounded-full bg-indigo-500/20 px-2.5 py-0.5 text-xs font-semibold text-indigo-200 ring-1 ring-inset ring-indigo-400/30">
                Purok Leader Console
              </span>
              <span className="text-xs text-indigo-300">
                Scope: {leaderPurok.name} · {leaderBarangay?.name || "Barangay"}
              </span>
            </div>
            <h2 className="text-xl font-bold tracking-tight text-white sm:text-2xl">
              Member Search & Claim Registry
            </h2>
            <p className="text-xs text-indigo-200/80 sm:text-sm max-w-2xl">
              Search across the entire <span className="font-semibold text-white">{leaderBarangay?.name || "Barangay"}</span> database to locate unassigned voters (e.g. SK voters, new arrivals) and assign them to your Purok.
            </p>
          </div>

          <div className="shrink-0">
            <button
              onClick={() => onAddNewMember(query)}
              className="flex items-center gap-2 rounded-xl bg-emerald-500 px-4 py-2.5 text-xs font-bold text-white shadow-md transition-all hover:bg-emerald-400 hover:shadow-lg active:scale-95"
            >
              <Plus className="h-4 w-4" /> Add New Member
            </button>
          </div>
        </div>

        {/* Big Search Input */}
        <div className="mt-5 relative">
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4 text-slate-400">
            <Search className="h-5 w-5 text-indigo-300" />
          </div>
          <input
            type="text"
            value={query}
            onChange={(e) => handleQueryChange(e.target.value)}
            placeholder="Search by First Name, Last Name, Middle Name, or Precinct Number (PN)…"
            className="w-full rounded-xl border border-indigo-400/30 bg-white/10 pl-11 pr-10 py-3 text-sm text-white placeholder-indigo-200/60 shadow-inner backdrop-blur-md outline-none transition-all focus:border-indigo-400 focus:bg-white/20 focus:ring-2 focus:ring-indigo-400/30"
          />
          {query && (
            <button
              onClick={() => handleQueryChange("")}
              className="absolute inset-y-0 right-0 flex items-center pr-4 text-indigo-200 hover:text-white"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>

      {/* Filter Tabs & Counter */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 pb-3">
        <div className="flex flex-wrap items-center gap-1.5">
          <button
            onClick={() => handleStatusFilterChange("all")}
            className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors ${
              statusFilter === "all"
                ? "bg-slate-900 text-white shadow-xs"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            }`}
          >
            All Barangay Residents ({counts.all})
          </button>
          <button
            onClick={() => handleStatusFilterChange("unassigned")}
            className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors ${
              statusFilter === "unassigned"
                ? "bg-indigo-600 text-white shadow-xs"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            }`}
          >
            <HelpCircle className="h-3.5 w-3.5" />
            Unassigned ({counts.unassigned})
          </button>
          <button
            onClick={() => handleStatusFilterChange("my-purok")}
            className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors ${
              statusFilter === "my-purok"
                ? "bg-emerald-600 text-white shadow-xs"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            }`}
          >
            <CheckCircle2 className="h-3.5 w-3.5" />
            Assigned to Your Purok ({counts.myPurok})
          </button>
          <button
            onClick={() => handleStatusFilterChange("other-purok")}
            className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors ${
              statusFilter === "other-purok"
                ? "bg-amber-600 text-white shadow-xs"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            }`}
          >
            <AlertTriangle className="h-3.5 w-3.5" />
            Other Puroks ({counts.otherPurok})
          </button>
        </div>

        <div className="text-xs text-slate-500">
          Showing <span className="font-semibold text-slate-800">{filtered.length}</span> matching record{filtered.length === 1 ? "" : "s"}
        </div>
      </div>

      {/* Results Table */}
      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/80 text-xs font-semibold uppercase tracking-wider text-slate-500">
                <th className="px-4 py-3">Resident Name</th>
                <th className="px-4 py-3">Precinct No. (PN)</th>
                <th className="px-4 py-3">Current Status</th>
                <th className="px-4 py-3">Assigned Household</th>
                <th className="px-4 py-3">Demographics</th>
                <th className="px-4 py-3 text-right">Claim & Assign</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {paginated.map((m) => {
                const statusInfo = getMemberStatusInfo(m);
                const hh = householdById.get(m.householdId);

                return (
                  <tr
                    key={m.id}
                    className="hover:bg-slate-50/80 transition-colors"
                  >
                    {/* Name */}
                    <td className="px-4 py-3">
                      <div className="font-semibold text-slate-900">
                        {memberFullName(m)}
                      </div>
                      <div className="text-[11px] text-slate-400">
                        {m.address || "No voter address"}
                      </div>
                    </td>

                    {/* PN */}
                    <td className="whitespace-nowrap px-4 py-3">
                      <span className="font-mono text-xs font-semibold text-slate-700 bg-slate-100 px-2 py-0.5 rounded">
                        {m.pn || "—"}
                      </span>
                    </td>

                    {/* Status Badge */}
                    <td className="whitespace-nowrap px-4 py-3">
                      <span
                        className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset ${statusInfo.badgeCls}`}
                      >
                        {statusInfo.icon}
                        {statusInfo.label}
                      </span>
                    </td>

                    {/* Household */}
                    <td className="px-4 py-3 text-xs text-slate-600 max-w-[200px] truncate">
                      {hh && !statusInfo.label.includes("Unassigned") ? (
                        <div>
                          <p className="font-medium text-slate-800">{hh.householdLeaderName}</p>
                          <p className="text-[11px] text-slate-400 truncate">{hh.address}</p>
                        </div>
                      ) : (
                        <span className="text-slate-400 italic">No household assigned</span>
                      )}
                    </td>

                    {/* Demographics & Special Sectors */}
                    <td className="px-4 py-3 text-xs text-slate-600">
                      <div>
                        <span>{m.age ? `${m.age} y/o` : "Age —"} · {m.status || "Single"}</span>
                      </div>
                      <div className="flex gap-1 mt-1">
                        {m.sc && (
                          <span className="rounded bg-blue-100 px-1.5 py-0.2 text-[10px] font-bold text-blue-800">
                            SC
                          </span>
                        )}
                        {m.pwd && (
                          <span className="rounded bg-green-100 px-1.5 py-0.2 text-[10px] font-bold text-green-800">
                            PWD
                          </span>
                        )}
                        {m.ip && (
                          <span className="rounded bg-orange-100 px-1.5 py-0.2 text-[10px] font-bold text-orange-800">
                            IP
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Action Button */}
                    <td className="whitespace-nowrap px-4 py-3 text-right">
                      <button
                        onClick={() => onEditAndAssign(m)}
                        className="inline-flex items-center gap-1.5 rounded-lg bg-indigo-600 px-3 py-1.5 text-xs font-semibold text-white shadow-xs transition-colors hover:bg-indigo-700 active:scale-95"
                      >
                        <UserCheck className="h-3.5 w-3.5" />
                        Edit & Assign
                      </button>
                    </td>
                  </tr>
                );
              })}

              {paginated.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-12 text-center">
                    <div className="mx-auto max-w-sm space-y-3">
                      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-slate-400">
                        <Search className="h-6 w-6" />
                      </div>
                      <h3 className="text-sm font-semibold text-slate-800">
                        No residents found matching your criteria
                      </h3>
                      <p className="text-xs text-slate-500">
                        {query
                          ? `No records found in ${leaderBarangay?.name || "Barangay"} matching "${query}".`
                          : "There are currently no records in this category."}
                      </p>
                      <button
                        onClick={() => onAddNewMember(query)}
                        className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 px-3.5 py-2 text-xs font-bold text-white shadow-xs hover:bg-emerald-700"
                      >
                        <Plus className="h-3.5 w-3.5" />
                        Verify & Add as New Member
                      </button>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Bar */}
        {filtered.length > 0 && (
          <div className="flex flex-col items-center justify-between gap-3 border-t border-slate-200 bg-slate-50 px-4 py-3 text-xs sm:flex-row">
            <div className="text-slate-500">
              Showing <span className="font-semibold text-slate-800">{page * perPage + 1}</span> to{" "}
              <span className="font-semibold text-slate-800">
                {Math.min((page + 1) * perPage, filtered.length)}
              </span>{" "}
              of <span className="font-semibold text-slate-800">{filtered.length}</span> residents
            </div>

            <div className="flex items-center gap-2">
              <select
                value={perPage}
                onChange={(e) => {
                  setPerPage(Number(e.target.value));
                  setPage(0);
                }}
                className="rounded-md border border-slate-300 bg-white px-2 py-1 text-xs text-slate-600 outline-none"
              >
                <option value={15}>15 per page</option>
                <option value={25}>25 per page</option>
                <option value={50}>50 per page</option>
              </select>

              <div className="flex items-center gap-1">
                <button
                  disabled={page === 0}
                  onClick={() => setPage((p) => Math.max(0, p - 1))}
                  className="rounded-md border border-slate-300 bg-white p-1 text-slate-600 disabled:opacity-40 hover:bg-slate-100"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <span className="px-2 text-slate-600">
                  Page {page + 1} of {totalPages}
                </span>
                <button
                  disabled={page >= totalPages - 1}
                  onClick={() => setPage((p) => p + 1)}
                  className="rounded-md border border-slate-300 bg-white p-1 text-slate-600 disabled:opacity-40 hover:bg-slate-100"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
