import { useState, useMemo, useEffect, useRef } from "react";
import {
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  Filter,
  Flag,
  HelpCircle,
  Plus,
  Search,
  UserCheck,
  X,
  Sparkles,
} from "lucide-react";
import type { Member, Purok, Household, Barangay } from "@/lib/types";
import { memberFullName } from "@/lib/types";
import { supabase } from "@/lib/supabase";

interface PurokLeaderSearchClaimProps {
  barangayMembers: Member[];
  puroks: Purok[];
  households: Household[];
  leaderPurok: Purok;
  leaderBarangay?: Barangay | undefined;
  onClaimMember: (member: Member) => void;
  onAddNewMember?: (initialQuery?: string) => void;
  query?: string | undefined;
  onQueryChange?: ((val: string) => void) | undefined;
  hideHeroSearch?: boolean | undefined;
  claimedMemberIds?: Set<number>;
}

type ClaimFilterTab = "all-unlinked" | "unassigned" | "flagged-review" | "all-barangay";

export function PurokLeaderSearchClaim({
  barangayMembers,
  puroks,
  households,
  leaderPurok,
  leaderBarangay,
  onClaimMember,
  onAddNewMember,
  query: externalQuery,
  onQueryChange: onExternalQueryChange,
  hideHeroSearch = false,
  claimedMemberIds = new Set(),
}: PurokLeaderSearchClaimProps) {
  const [internalQuery, setInternalQuery] = useState("");
  const query = externalQuery !== undefined ? externalQuery : internalQuery;
  const setQuery = onExternalQueryChange || setInternalQuery;
  const [activeFilterTab, setActiveFilterTab] = useState<ClaimFilterTab>("all-unlinked");
  const [page, setPage] = useState(0);
  const [perPage, setPerPage] = useState(15);

  // Local set of claimed IDs for optimistic instant removal
  const [locallyClaimedIds, setLocallyClaimedIds] = useState<Set<number>>(new Set());

  // Direct Supabase async search state for querying across 15k+ database rows
  const [dbResults, setDbResults] = useState<Member[] | null>(null);
  const [isSearchingDb, setIsSearchingDb] = useState(false);
  const searchDebounceRef = useRef<NodeJS.Timeout | null>(null);

  const householdById = useMemo(
    () => new Map(households.map((h) => [h.id, h])),
    [households],
  );

  const purokById = useMemo(
    () => new Map(puroks.map((p) => [p.id, p])),
    [puroks],
  );

  // Determine whether a record is unassigned, flagged for review, or assigned
  const getMemberStatusInfo = (m: Member) => {
    const hh = householdById.get(m.householdId);
    const pk = hh ? purokById.get(hh.purokId) : undefined;

    // Check if explicitly flagged for review
    const isFlaggedForReview =
      m.is_purok_leader_indicator ||
      (m.remarks &&
        (m.remarks.toLowerCase().includes("flag") ||
          m.remarks.toLowerCase().includes("review") ||
          m.remarks.toLowerCase().includes("check") ||
          m.remarks.toLowerCase().includes("duplicate")));

    // Check if purok_id is null or points to unassigned
    const isUnassigned =
      m.purok_id === null ||
      m.purok_id === undefined ||
      !pk ||
      pk.name.toLowerCase().includes("unassigned") ||
      !m.code ||
      m.code.toLowerCase() === "null" ||
      m.code.toLowerCase().includes("unassigned") ||
      (hh?.householdLeaderName === "General Household" &&
        (!m.code || m.code.toLowerCase().includes("unassigned")));

    if (isFlaggedForReview) {
      return {
        category: "flagged-review" as const,
        isUnassigned,
        label: "Flagged for Review",
        badgeCls: "bg-rose-50 text-rose-800 ring-rose-600/30",
        icon: <Flag className="h-3.5 w-3.5 text-rose-600" />,
      };
    }

    if (isUnassigned) {
      return {
        category: "unassigned" as const,
        isUnassigned: true,
        label: "Unassigned Member",
        badgeCls: "bg-amber-50 text-amber-800 ring-amber-600/30",
        icon: <HelpCircle className="h-3.5 w-3.5 text-amber-600" />,
      };
    }

    if (m.purok_id === leaderPurok.id || pk?.id === leaderPurok.id || m.code === leaderPurok.name) {
      return {
        category: "my-purok" as const,
        isUnassigned: false,
        label: "In Your Purok",
        badgeCls: "bg-emerald-50 text-emerald-800 ring-emerald-600/30",
        icon: <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />,
      };
    }

    return {
      category: "other-purok" as const,
      isUnassigned: false,
      label: `Assigned to ${pk?.name || "Other Purok"}`,
      badgeCls: "bg-slate-100 text-slate-700 ring-slate-300",
      icon: <AlertTriangle className="h-3.5 w-3.5 text-slate-500" />,
    };
  };

  // Direct Supabase Search when query is typed (hits members table with purok_id IS NULL OR is_purok_leader_indicator = true)
  useEffect(() => {
    const trimmed = query.trim();
    if (!trimmed) {
      setDbResults(null);
      setIsSearchingDb(false);
      return;
    }

    if (searchDebounceRef.current) clearTimeout(searchDebounceRef.current);

    searchDebounceRef.current = setTimeout(async () => {
      setIsSearchingDb(true);
      try {
        let qb = supabase.from("members").select("*");

        // MUST filter for records where purok_id IS NULL OR records that are flagged for review
        if (activeFilterTab === "unassigned") {
          qb = qb.or("purok_id.is.null,code.ilike.%unassigned%");
        } else if (activeFilterTab === "flagged-review") {
          qb = qb.or("is_purok_leader_indicator.eq.true,remarks.ilike.%review%,remarks.ilike.%flag%");
        } else if (activeFilterTab === "all-unlinked") {
          qb = qb.or("purok_id.is.null,is_purok_leader_indicator.eq.true,code.ilike.%unassigned%");
        }

        // Search by First Name, Last Name, or Precinct No
        const terms = trimmed.replace(/[%_,]/g, " ").split(/\s+/).filter(Boolean);
        if (terms.length > 0) {
          const conditions = terms.map(
            (t) =>
              `firstName.ilike.%${t}%,lastName.ilike.%${t}%,middleName.ilike.%${t}%,pn.ilike.%${t}%,precinct.ilike.%${t}%,no.ilike.%${t}%`,
          );
          qb = qb.or(conditions.join(","));
        }

        qb = qb.limit(100);

        const { data, error } = await qb;
        if (!error && data) {
          setDbResults(data as unknown as Member[]);
        }
      } catch (err) {
        console.warn("Direct search query failed, using local store cache:", err);
      } finally {
        setIsSearchingDb(false);
      }
    }, 250);

    return () => {
      if (searchDebounceRef.current) clearTimeout(searchDebounceRef.current);
    };
  }, [query, activeFilterTab, leaderBarangay?.id]);

  // Compute active dataset: merge direct DB results if present, or use barangayMembers
  const baseMembers = useMemo(() => {
    const list = dbResults !== null ? dbResults : barangayMembers;
    // Exclude locally or externally claimed members
    return list.filter(
      (m) => !claimedMemberIds.has(m.id) && !locallyClaimedIds.has(m.id),
    );
  }, [dbResults, barangayMembers, claimedMemberIds, locallyClaimedIds]);

  // Filtered members according to tab and query
  const filtered = useMemo(() => {
    const rawTokens = query.trim().toLowerCase().split(/\s+/).filter(Boolean);

    return baseMembers.filter((m) => {
      const statusInfo = getMemberStatusInfo(m);

      // Core rule: By default, Tab 2 MUST filter for records where purok_id IS NULL (unassigned members) OR records that are flagged for review
      if (activeFilterTab === "all-unlinked") {
        if (!statusInfo.isUnassigned && statusInfo.category !== "flagged-review") {
          return false;
        }
      } else if (activeFilterTab === "unassigned") {
        if (!statusInfo.isUnassigned) return false;
      } else if (activeFilterTab === "flagged-review") {
        if (statusInfo.category !== "flagged-review") return false;
      }

      // Search query filtering across First Name, Last Name, Middle Name, PN, Precinct
      if (rawTokens.length > 0 && dbResults === null) {
        const searchable = [
          m.firstName,
          m.lastName,
          m.middleName,
          m.no,
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
  }, [baseMembers, query, activeFilterTab, dbResults, householdById, purokById, leaderPurok.id, leaderPurok.name]);

  // Summary counts for filter tabs
  const tabCounts = useMemo(() => {
    let unassigned = 0;
    let flagged = 0;

    for (const m of barangayMembers) {
      if (claimedMemberIds.has(m.id) || locallyClaimedIds.has(m.id)) continue;
      const info = getMemberStatusInfo(m);
      if (info.category === "flagged-review") flagged++;
      if (info.isUnassigned) unassigned++;
    }

    return {
      allUnlinked: unassigned + flagged,
      unassigned,
      flagged,
      allBarangay: barangayMembers.length,
    };
  }, [barangayMembers, claimedMemberIds, locallyClaimedIds, householdById, purokById, leaderPurok.id, leaderPurok.name]);

  // Pagination
  const totalPages = Math.max(1, Math.ceil(filtered.length / perPage));
  const paginated = useMemo(() => {
    const start = page * perPage;
    return filtered.slice(start, start + perPage);
  }, [filtered, page, perPage]);

  const handleQueryChange = (val: string) => {
    setQuery(val);
    setPage(0);
  };

  const handleFilterTabChange = (tab: ClaimFilterTab) => {
    setActiveFilterTab(tab);
    setPage(0);
  };

  const handleClaim = (member: Member) => {
    // Open modal
    onClaimMember(member);
  };

  return (
    <div className="space-y-4">
      {/* ── SEARCH & CLAIM HERO / INSTRUCTION HEADER ── */}
      {!hideHeroSearch && (
        <div className="overflow-hidden rounded-2xl border border-indigo-200/90 bg-gradient-to-br from-indigo-950 via-slate-900 to-indigo-900 p-6 text-white shadow-md">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center rounded-full bg-emerald-500/20 px-2.5 py-0.5 text-xs font-semibold text-emerald-300 ring-1 ring-inset ring-emerald-400/30">
                  Search & Claim Tool
                </span>
                <span className="text-xs text-indigo-300">
                  Target: {leaderPurok.name} · {leaderBarangay?.name || "Barangay"}
                </span>
              </div>
              <h2 className="text-xl font-bold tracking-tight text-white sm:text-2xl">
                Search & Claim Database
              </h2>
              <p className="text-xs text-indigo-200/80 sm:text-sm max-w-2xl">
                Locate unassigned residents (such as imported SK voters) and records flagged for review. Assign them directly into your Purok and Households.
              </p>
            </div>

            {onAddNewMember && (
              <div className="shrink-0">
                <button
                  onClick={() => onAddNewMember(query)}
                  className="flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-xs font-bold text-white shadow-sm transition-all hover:bg-emerald-500 active:scale-95"
                >
                  <Plus className="h-4 w-4" /> Add Resident
                </button>
              </div>
            )}
          </div>

          {/* Search Input */}
          <div className="mt-5 relative">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4 text-slate-400">
              <Search className="h-4 w-4 text-indigo-300" />
            </div>
            <input
              type="text"
              value={query}
              onChange={(e) => handleQueryChange(e.target.value)}
              placeholder="Search database by First Name, Last Name, or Precinct No. (PN)..."
              className="w-full rounded-xl border border-indigo-400/30 bg-white/10 pl-11 pr-10 py-3 text-sm text-white placeholder-indigo-200/60 shadow-inner backdrop-blur-md outline-none transition-all focus:border-indigo-400 focus:bg-white/20 focus:ring-2 focus:ring-indigo-400/30"
            />
            {query && (
              <button
                type="button"
                onClick={() => handleQueryChange("")}
                className="absolute inset-y-0 right-0 flex items-center pr-4 text-indigo-200 hover:text-white"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>
      )}

      {/* ── FILTER TABS & STATUS INDICATOR ── */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 pb-3">
        <div className="flex flex-wrap items-center gap-1.5">
          {/* Tab: All Unlinked / Available */}
          <button
            type="button"
            onClick={() => handleFilterTabChange("all-unlinked")}
            className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold transition-colors ${
              activeFilterTab === "all-unlinked"
                ? "bg-indigo-600 text-white shadow-xs"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            }`}
          >
            <Sparkles className="h-3.5 w-3.5" />
            <span>Unlinked & Review</span>
            <span
              className={`rounded-full px-1.5 py-0.2 text-[10px] ${
                activeFilterTab === "all-unlinked"
                  ? "bg-indigo-700 text-white"
                  : "bg-slate-200 text-slate-700"
              }`}
            >
              {tabCounts.allUnlinked}
            </span>
          </button>

          {/* Tab: Unassigned Members (purok_id IS NULL) */}
          <button
            type="button"
            onClick={() => handleFilterTabChange("unassigned")}
            className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold transition-colors ${
              activeFilterTab === "unassigned"
                ? "bg-amber-600 text-white shadow-xs"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            }`}
          >
            <HelpCircle className="h-3.5 w-3.5" />
            <span>Unassigned Voters</span>
            <span
              className={`rounded-full px-1.5 py-0.2 text-[10px] ${
                activeFilterTab === "unassigned"
                  ? "bg-amber-700 text-white"
                  : "bg-slate-200 text-slate-700"
              }`}
            >
              {tabCounts.unassigned}
            </span>
          </button>

          {/* Tab: Flagged for Review */}
          <button
            type="button"
            onClick={() => handleFilterTabChange("flagged-review")}
            className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold transition-colors ${
              activeFilterTab === "flagged-review"
                ? "bg-rose-600 text-white shadow-xs"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            }`}
          >
            <Flag className="h-3.5 w-3.5" />
            <span>Flagged for Review</span>
            <span
              className={`rounded-full px-1.5 py-0.2 text-[10px] ${
                activeFilterTab === "flagged-review"
                  ? "bg-rose-700 text-white"
                  : "bg-slate-200 text-slate-700"
              }`}
            >
              {tabCounts.flagged}
            </span>
          </button>

          {/* Tab: All Barangay Records (Optional lookup) */}
          <button
            type="button"
            onClick={() => handleFilterTabChange("all-barangay")}
            className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors ${
              activeFilterTab === "all-barangay"
                ? "bg-slate-800 text-white shadow-xs"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            }`}
          >
            All Database Records ({tabCounts.allBarangay})
          </button>
        </div>

        <div className="flex items-center gap-2 text-xs text-slate-500">
          {isSearchingDb && (
            <span className="inline-flex items-center gap-1 text-indigo-600 font-semibold">
              <span className="h-2.5 w-2.5 animate-spin rounded-full border-2 border-indigo-600 border-t-transparent" />
              Searching database...
            </span>
          )}
          <span>
            Showing <span className="font-bold text-slate-800">{filtered.length}</span> record{filtered.length === 1 ? "" : "s"}
          </span>
        </div>
      </div>

      {/* ── SEARCH RESULTS TABLE ── */}
      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/90 text-xs font-bold uppercase tracking-wider text-slate-600">
                <th className="px-4 py-3">Resident Name</th>
                <th className="px-4 py-3">Precinct</th>
                <th className="px-4 py-3">No.</th>
                <th className="px-4 py-3">Database Status</th>
                <th className="px-4 py-3">Demographics</th>
                <th className="px-4 py-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {paginated.map((m) => {
                const statusInfo = getMemberStatusInfo(m);

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
                      <div className="text-[11px] text-slate-400 truncate max-w-xs">
                        {m.address || "Imported voter record"}
                      </div>
                    </td>

                    {/* Precinct */}
                    <td className="whitespace-nowrap px-4 py-3">
                      <span className="font-mono text-xs font-bold text-indigo-900 bg-indigo-50 border border-indigo-200/60 px-2 py-0.5 rounded-md">
                        {m.precinct || m.pn || "—"}
                      </span>
                    </td>

                    {/* No. */}
                    <td className="whitespace-nowrap px-4 py-3">
                      <span className="font-mono text-xs font-semibold text-slate-700 bg-slate-100 border border-slate-200 px-2 py-0.5 rounded-md">
                        {m.no || "—"}
                      </span>
                    </td>

                    {/* Database Status */}
                    <td className="whitespace-nowrap px-4 py-3">
                      <span
                        className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset ${statusInfo.badgeCls}`}
                      >
                        {statusInfo.icon}
                        {statusInfo.label}
                      </span>
                    </td>

                    {/* Demographics */}
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
                          <span className="rounded bg-emerald-100 px-1.5 py-0.2 text-[10px] font-bold text-emerald-800">
                            PWD
                          </span>
                        )}
                        {m.ip && (
                          <span className="rounded bg-amber-100 px-1.5 py-0.2 text-[10px] font-bold text-amber-800">
                            IP
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Action Button: Claim Member */}
                    <td className="whitespace-nowrap px-4 py-3 text-right">
                      <button
                        type="button"
                        onClick={() => handleClaim(m)}
                        className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 px-3.5 py-2 text-xs font-bold text-white shadow-xs transition-all hover:bg-emerald-700 active:scale-95"
                      >
                        <UserCheck className="h-3.5 w-3.5" />
                        Claim Member
                      </button>
                    </td>
                  </tr>
                );
              })}

              {paginated.length === 0 && (
                <tr>
                  <td colSpan={5} className="py-12 text-center">
                    <div className="mx-auto max-w-sm space-y-3">
                      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-slate-400">
                        <Search className="h-6 w-6" />
                      </div>
                      <h3 className="text-sm font-semibold text-slate-800">
                        No members found
                      </h3>
                      <p className="text-xs text-slate-500">
                        {query
                          ? `No unassigned members match "${query}". Try searching by a different first name, last name, or precinct number.`
                          : "There are currently no records matching this category."}
                      </p>
                      {onAddNewMember && (
                        <button
                          type="button"
                          onClick={() => onAddNewMember(query)}
                          className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 px-3.5 py-2 text-xs font-bold text-white shadow-xs hover:bg-emerald-700"
                        >
                          <Plus className="h-3.5 w-3.5" />
                          Register as New Member
                        </button>
                      )}
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
              Page <span className="font-semibold text-slate-800">{page + 1}</span> of{" "}
              <span className="font-semibold text-slate-800">{totalPages}</span>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setPage((p) => Math.max(0, p - 1))}
                disabled={page === 0}
                className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-xs font-semibold text-slate-700 shadow-2xs hover:bg-slate-50 disabled:opacity-40"
              >
                <ChevronLeft className="h-3.5 w-3.5" /> Previous
              </button>
              <button
                type="button"
                onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
                disabled={page >= totalPages - 1}
                className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-xs font-semibold text-slate-700 shadow-2xs hover:bg-slate-50 disabled:opacity-40"
              >
                Next <ChevronRight className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
