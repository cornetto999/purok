import { useMemo, useState } from "react";
import { Search, Users } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  memberFullName,
  type Household,
  type Member,
  type Purok,
} from "@/lib/types";

const roles = [
  { key: "all", label: "All residents" },
  { key: "is_purok_leader_indicator", label: "PL · Purok leaders" },
  { key: "is_household_leader", label: "HL · Household leaders" },
  { key: "is_household_member", label: "HM · Household members" },
  { key: "unassigned", label: "No role assigned" },
] as const;
type RoleFilter = (typeof roles)[number]["key"];
const hasNoRole = (member: Member) =>
  !member.is_purok_leader_indicator &&
  !member.is_household_leader &&
  !member.is_household_member;
const pageSize = 25;

export function PurokMembersDialog({
  purok,
  barangayName,
  members,
  households,
}: {
  purok: Purok;
  barangayName: string;
  members: Member[];
  households: ReadonlyMap<number, Household>;
}) {
  const [open, setOpen] = useState(false);
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <button
          type="button"
          className="w-full rounded-lg border border-slate-200 py-2 text-xs font-medium text-slate-600 transition-colors hover:bg-slate-50"
        >
          View Members →
        </button>
      </DialogTrigger>
      <DialogContent className="flex max-h-[85vh] w-[calc(100%-2rem)] max-w-4xl flex-col overflow-hidden">
        <DialogHeader className="shrink-0 pr-6">
          <DialogTitle>{purok.name} · Members</DialogTitle>
          <DialogDescription>
            {barangayName} · {members.length.toLocaleString()} residents ·
            Leader: {purok.purokLeaderName || "—"}
          </DialogDescription>
        </DialogHeader>
        {open && <MemberRoster members={members} households={households} />}
      </DialogContent>
    </Dialog>
  );
}

function MemberRoster({
  members,
  households,
}: {
  members: Member[];
  households: ReadonlyMap<number, Household>;
}) {
  const [role, setRole] = useState<RoleFilter>("all");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const counts = useMemo(
    () =>
      Object.fromEntries(
        roles.map(({ key }) => [
          key,
          members.filter(
            (member) =>
              key === "all" ||
              (key === "unassigned" ? hasNoRole(member) : member[key]),
          ).length,
        ]),
      ),
    [members],
  );
  const filtered = useMemo(() => {
    const keywords = search
      .trim()
      .toLocaleLowerCase()
      .split(/\s+/)
      .filter(Boolean);
    return members
      .filter((member) => {
        if (
          role !== "all" &&
          !(role === "unassigned" ? hasNoRole(member) : member[role])
        )
          return false;
        const household = households.get(Number(member.householdId));
        const text = [
          memberFullName(member),
          member.precinct || member.pn,
          member.no,
          household?.householdLeaderName,
        ]
          .join(" ")
          .toLocaleLowerCase();
        return keywords.every((keyword) => text.includes(keyword));
      })
      .sort((a, b) => memberFullName(a).localeCompare(memberFullName(b)));
  }, [members, households, role, search]);
  const pages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const currentPage = Math.min(page, pages);
  const start = (currentPage - 1) * pageSize;
  const visible = filtered.slice(start, start + pageSize);

  return (
    <>
      <div
        className="flex shrink-0 flex-wrap gap-2"
        aria-label="Filter residents by role"
      >
        {roles.map(({ key, label }) => (
          <button
            key={key}
            type="button"
            aria-pressed={role === key}
            onClick={() => {
              setRole(key);
              setPage(1);
            }}
            className={`rounded-full border px-3 py-1.5 text-xs font-medium transition-colors ${role === key ? "border-indigo-600 bg-indigo-600 text-white" : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"}`}
          >
            {label}{" "}
            <span className="ml-1 tabular-nums">
              {counts[key]?.toLocaleString()}
            </span>
          </button>
        ))}
      </div>
      <label className="flex shrink-0 items-center gap-2 rounded-xl border border-slate-200 px-3 py-2.5">
        <Search
          aria-hidden="true"
          className="h-4 w-4 shrink-0 text-slate-400"
        />
        <span className="sr-only">Search purok residents</span>
        <input
          value={search}
          onChange={(event) => {
            setSearch(event.target.value);
            setPage(1);
          }}
          placeholder="Search name, household, precinct, or number…"
          className="min-w-0 flex-1 bg-transparent text-sm outline-none"
        />
      </label>
      <div className="min-h-0 overflow-auto rounded-xl border border-slate-200">
        <table className="w-full min-w-[640px] text-left text-sm">
          <caption className="sr-only">Residents in the selected purok</caption>
          <thead className="sticky top-0 bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
            <tr>
              {["Name", "Role", "Household", "Precinct", "No."].map(
                (heading) => (
                  <th key={heading} scope="col" className="px-4 py-3">
                    {heading}
                  </th>
                ),
              )}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {visible.map((member) => (
              <tr key={member.id} className="hover:bg-slate-50/60">
                <td className="px-4 py-3 font-medium text-slate-800">
                  {memberFullName(member)}
                </td>
                <td className="px-4 py-3">
                  <div className="flex flex-wrap gap-1">
                    {member.is_purok_leader_indicator && (
                      <RoleBadge label="PL" title="Purok leader" />
                    )}
                    {member.is_household_leader && (
                      <RoleBadge label="HL" title="Household leader" />
                    )}
                    {member.is_household_member && (
                      <RoleBadge label="HM" title="Household member" />
                    )}
                    {hasNoRole(member) && (
                      <span className="text-xs text-slate-400">
                        No role assigned
                      </span>
                    )}
                  </div>
                </td>
                <td className="px-4 py-3 text-slate-600">
                  {households.get(Number(member.householdId))
                    ?.householdLeaderName || "—"}
                </td>
                <td className="px-4 py-3 text-slate-600">
                  {member.precinct || member.pn || "—"}
                </td>
                <td className="px-4 py-3 text-slate-600">{member.no || "—"}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {visible.length === 0 && (
          <div className="px-4 py-10 text-center text-sm text-slate-500">
            <Users
              aria-hidden="true"
              className="mx-auto mb-2 h-7 w-7 text-slate-300"
            />
            {members.length === 0
              ? "No residents in this purok yet."
              : "No residents match this role or search."}
          </div>
        )}
      </div>
      <div className="flex shrink-0 flex-wrap items-center justify-between gap-2 text-xs text-slate-500">
        <p role="status">
          Showing {filtered.length ? start + 1 : 0}–
          {Math.min(start + pageSize, filtered.length)} of{" "}
          {filtered.length.toLocaleString()} residents
        </p>
        <div className="flex items-center gap-2">
          <button
            type="button"
            disabled={currentPage === 1}
            onClick={() => setPage(currentPage - 1)}
            className="rounded-lg border px-3 py-2 disabled:opacity-40"
          >
            Previous
          </button>
          <span>
            Page {currentPage} of {pages}
          </span>
          <button
            type="button"
            disabled={currentPage === pages}
            onClick={() => setPage(currentPage + 1)}
            className="rounded-lg border px-3 py-2 disabled:opacity-40"
          >
            Next
          </button>
        </div>
      </div>
    </>
  );
}

function RoleBadge({ label, title }: { label: string; title: string }) {
  return (
    <span
      title={title}
      aria-label={title}
      className="rounded-full bg-indigo-50 px-2 py-0.5 text-xs font-semibold text-indigo-700"
    >
      {label}
    </span>
  );
}
