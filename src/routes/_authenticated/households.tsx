import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Pencil, Plus, Trash2, UserCheck } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { HouseholdModal } from "@/components/entity-modals";
import { useStore } from "@/lib/store";
import type { Household } from "@/lib/types";

export const Route = createFileRoute("/_authenticated/households")({
  component: HouseholdsPage,
});

function HouseholdsPage() {
  const { state, saveHouseholdWithUser, deleteHousehold } = useStore();
  const navigate = useNavigate();
  const [editing, setEditing] = useState<Household | null | "new">(null);
  const purokById = useMemo(
    () => new Map(state.puroks.map((purok) => [purok.id, purok])),
    [state.puroks],
  );

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
                        {household.householdLeaderName}
                      </td>
                      <td className="px-4 py-2.5">
                        {leaderUser ? (
                          <span className="inline-flex items-center gap-1 rounded-md bg-indigo-50 px-2 py-0.5 font-mono text-xs font-medium text-indigo-700">
                            <UserCheck className="h-3 w-3" />@{leaderUser.username}
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
                        {
                          state.members.filter(
                            (member) => member.householdId === household.id,
                          ).length
                        }
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
    </>
  );
}
