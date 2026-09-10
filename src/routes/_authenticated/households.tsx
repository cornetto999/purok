import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Pencil, Plus, Trash2, UserCheck, Users } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { HouseholdModal } from "@/components/entity-modals";
import { ModalShell } from "@/components/modal-shell";
import { useStore } from "@/lib/store";
import { memberFullName, type Household, type Member } from "@/lib/types";

export const Route = createFileRoute("/_authenticated/households")({
  component: HouseholdsPage,
});

function HouseholdsPage() {
  const { state, saveHouseholdWithUser, deleteHousehold } = useStore();
  const navigate = useNavigate();
  const [editing, setEditing] = useState<Household | null | "new">(null);
  const [viewing, setViewing] = useState<Household | null>(null);
  const purokById = useMemo(
    () => new Map(state.puroks.map((purok) => [purok.id, purok])),
    [state.puroks],
  );
  const membersByHouseholdId = useMemo(() => {
    const grouped = new Map<number, Member[]>();
    state.members.forEach((member) => {
      const members = grouped.get(member.householdId) ?? [];
      members.push(member);
      grouped.set(member.householdId, members);
    });
    return grouped;
  }, [state.members]);

  useEffect(() => {
    if (state.session?.role !== "Admin") void navigate({ to: "/my-dashboard" });
  }, [navigate, state.session]);

  return (
    <>
      <header className="border-b border-slate-200 bg-white px-6 py-4">
        <h1 className="text-lg font-semibold">Household Leaders</h1>
        <p className="text-sm text-slate-500">
          Manage household records and their leaders
        </p>
      </header>
      <div className="space-y-4 p-6">
        <div>
          <button
            onClick={() => setEditing("new")}
            className="inline-flex items-center gap-1.5 rounded-lg bg-indigo-600 px-3 py-2 text-xs font-semibold text-white hover:bg-indigo-700"
          >
            <Plus className="h-3.5 w-3.5" /> Add Household
          </button>
        </div>
        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                  <th className="px-4 py-2.5">Household Leader</th>
                  <th className="px-4 py-2.5">Account</th>
                  <th className="px-4 py-2.5">Address</th>
                  <th className="px-4 py-2.5">Purok</th>
                  <th className="px-4 py-2.5">Members</th>
                  <th className="px-4 py-2.5" />
                </tr>
              </thead>
              <tbody>
                {state.households.map((household) => {
                  const householdMembers =
                    membersByHouseholdId.get(household.id) ?? [];
                  const householdLeader = householdMembers.find(
                    (member) => member.is_household_leader,
                  );
                  const leaderName = householdLeader
                    ? memberFullName(householdLeader)
                    : household.householdLeaderName;
                  const leaderUser = state.users.find(
                    (u) =>
                      u.role === "Household Leader" &&
                      u.linked_entity_id === household.id,
                  );

                  return (
                    <tr
                      key={household.id}
                      className="border-b border-slate-100 last:border-0 hover:bg-slate-50"
                    >
                      <td className="px-4 py-2.5 font-medium">
                        <button
                          type="button"
                          onClick={() => setViewing(household)}
                          className="text-left hover:text-indigo-600 hover:underline"
                          title="View household members"
                        >
                          {leaderName}
                        </button>
                      </td>
                      <td className="px-4 py-2.5">
                        {leaderUser ? (
                          <span className="inline-flex items-center gap-1 rounded-md bg-indigo-50 px-2 py-0.5 font-mono text-xs font-medium text-indigo-700">
                            <UserCheck className="h-3 w-3" />@
                            {leaderUser.username}
                          </span>
                        ) : (
                          <span className="text-xs italic text-slate-400">
                            No account
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-2.5 text-slate-600">
                        {household.address}
                      </td>
                      <td className="px-4 py-2.5 text-slate-600">
                        {purokById.get(household.purokId)?.name ?? "—"}
                      </td>
                      <td className="px-4 py-2.5 text-slate-600">
                        {householdMembers.length}
                      </td>
                      <td className="px-4 py-2.5">
                        <button
                          onClick={() => setEditing(household)}
                          className="rounded-md p-1 text-slate-400 hover:bg-slate-100"
                        >
                          <Pencil className="h-3.5 w-3.5" />
                        </button>
                        <button
                          onClick={() => {
                            if (confirm("Delete household?"))
                              void deleteHousehold(household.id);
                          }}
                          className="rounded-md p-1 text-slate-400 hover:bg-red-50 hover:text-red-600"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
      {editing === "new" && (
        <HouseholdModal
          puroksData={state.puroks}
          barangaysData={state.barangays}
          usersData={state.users}
          onSave={(data, userAccount) => {
            void saveHouseholdWithUser(data, userAccount);
            setEditing(null);
          }}
          onClose={() => setEditing(null)}
        />
      )}
      {editing && editing !== "new" && (
        <HouseholdModal
          initial={editing}
          puroksData={state.puroks}
          barangaysData={state.barangays}
          usersData={state.users}
          onSave={(data, userAccount) => {
            void saveHouseholdWithUser(data, userAccount, editing.id);
            setEditing(null);
          }}
          onClose={() => setEditing(null)}
        />
      )}
      {viewing && (
        <HouseholdMembersModal
          household={viewing}
          members={membersByHouseholdId.get(viewing.id) ?? []}
          purokName={purokById.get(viewing.purokId)?.name}
          onClose={() => setViewing(null)}
        />
      )}
    </>
  );
}

function HouseholdMembersModal({
  household,
  members,
  purokName,
  onClose,
}: {
  household: Household;
  members: Member[];
  purokName?: string | undefined;
  onClose: () => void;
}) {
  const selectedLeader = members.find((member) => member.is_household_leader);
  const displayedLeaderName = selectedLeader
    ? memberFullName(selectedLeader)
    : household.householdLeaderName;
  const sortedMembers = [...members].sort((a, b) => {
    if (a.is_household_leader !== b.is_household_leader) {
      return a.is_household_leader ? -1 : 1;
    }
    return memberFullName(a).localeCompare(memberFullName(b));
  });

  return (
    <ModalShell title="Household Members" onClose={onClose} width="max-w-3xl">
      <div className="mb-5 flex items-start justify-between gap-4 rounded-xl bg-indigo-50 px-4 py-3">
        <div>
          <p className="font-semibold text-slate-900">{displayedLeaderName}</p>
          <p className="mt-0.5 text-sm text-slate-600">
            {[household.address, purokName].filter(Boolean).join(" • ") ||
              "No address recorded"}
          </p>
        </div>
        <span className="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-white px-2.5 py-1 text-xs font-medium text-indigo-700 shadow-sm">
          <Users className="h-3.5 w-3.5" /> {members.length} member
          {members.length === 1 ? "" : "s"}
        </span>
      </div>

      {sortedMembers.length > 0 ? (
        <div className="overflow-hidden rounded-lg border border-slate-200">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-4 py-2.5">Name</th>
                <th className="px-4 py-2.5">Role</th>
                <th className="px-4 py-2.5">Age</th>
                <th className="px-4 py-2.5">Civil Status</th>
                <th className="px-4 py-2.5">Address</th>
              </tr>
            </thead>
            <tbody>
              {sortedMembers.map((member) => (
                <tr key={member.id} className="border-t border-slate-100">
                  <td className="px-4 py-3 font-medium text-slate-900">
                    {memberFullName(member)}
                  </td>
                  <td className="px-4 py-3">
                    {member.is_household_leader ? (
                      <span className="rounded-full bg-indigo-50 px-2 py-0.5 text-xs font-semibold text-indigo-700">
                        Household Leader
                      </span>
                    ) : (
                      <span className="text-slate-600">Household Member</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-slate-600">{member.age}</td>
                  <td className="px-4 py-3 text-slate-600">{member.status}</td>
                  <td className="max-w-48 truncate px-4 py-3 text-slate-600">
                    {member.address || "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="rounded-lg border border-dashed border-slate-300 px-4 py-10 text-center text-sm text-slate-500">
          No members have been assigned to this household yet.
        </div>
      )}
    </ModalShell>
  );
}
