import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Pencil, Plus, Trash2, UserCheck } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { PurokModal } from "@/components/entity-modals";
import { useStore } from "@/lib/store";
import type { Purok } from "@/lib/types";

export const Route = createFileRoute("/_authenticated/purok-leaders")({
  component: PurokLeadersPage,
});

function PurokLeadersPage() {
  const { state, savePurokWithUser, deletePurok } = useStore();
  const navigate = useNavigate();
  const [editing, setEditing] = useState<Purok | null | "new">(null);
  const barangayById = useMemo(
    () => new Map(state.barangays.map((barangay) => [barangay.id, barangay])),
    [state.barangays],
  );

  useEffect(() => {
    if (state.session?.role !== "Admin") void navigate({ to: "/my-dashboard" });
  }, [navigate, state.session]);

  return (
    <>
      <header className="border-b border-slate-200 bg-white px-6 py-4">
        <h1 className="text-lg font-semibold">Purok Leaders</h1>
        <p className="text-sm text-slate-500">
          Manage puroks and their assigned leaders
        </p>
      </header>
      <div className="space-y-4 p-6">
        <div>
          <button
            onClick={() => setEditing("new")}
            className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 px-3 py-2 text-xs font-semibold text-white hover:bg-emerald-700"
          >
            <Plus className="h-3.5 w-3.5" /> Add Purok
          </button>
        </div>
        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                  <th className="px-4 py-2.5">Purok</th>
                  <th className="px-4 py-2.5">Leader</th>
                  <th className="px-4 py-2.5">Account</th>
                  <th className="px-4 py-2.5">Barangay</th>
                  <th className="px-4 py-2.5">Households</th>
                  <th className="px-4 py-2.5">Members</th>
                  <th className="px-4 py-2.5" />
                </tr>
              </thead>
              <tbody>
                {state.puroks.map((purok) => {
                  const households = state.households.filter(
                    (household) => household.purokId === purok.id,
                  );
                  const householdIds = new Set(
                    households.map((household) => household.id),
                  );
                  const leaderUser = state.users.find(
                    (u) =>
                      u.role === "Purok Leader" &&
                      u.linked_entity_id === purok.id,
                  );

                  return (
                    <tr
                      key={purok.id}
                      className="border-b border-slate-100 last:border-0 hover:bg-slate-50"
                    >
                      <td className="px-4 py-2.5 font-medium">{purok.name}</td>
                      <td className="px-4 py-2.5 text-slate-600">
                        {purok.purokLeaderName}
                      </td>
                      <td className="px-4 py-2.5">
                        {leaderUser ? (
                          <span className="inline-flex items-center gap-1 rounded-md bg-emerald-50 px-2 py-0.5 font-mono text-xs font-medium text-emerald-700">
                            <UserCheck className="h-3 w-3" />@{leaderUser.username}
                          </span>
                        ) : (
                          <span className="text-xs italic text-slate-400">
                            No account
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-2.5 text-slate-600">
                        {barangayById.get(purok.barangayId)?.name ?? "—"}
                      </td>
                      <td className="px-4 py-2.5 text-slate-600">
                        {households.length}
                      </td>
                      <td className="px-4 py-2.5 text-slate-600">
                        {
                          state.members.filter((member) =>
                            householdIds.has(member.householdId),
                          ).length
                        }
                      </td>
                      <td className="px-4 py-2.5">
                        <button
                          onClick={() => setEditing(purok)}
                          className="rounded-md p-1 text-slate-400 hover:bg-slate-100"
                        >
                          <Pencil className="h-3.5 w-3.5" />
                        </button>
                        <button
                          onClick={() => {
                            if (confirm(`Delete "${purok.name}"?`))
                              void deletePurok(purok.id);
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
        <PurokModal
          barangaysData={state.barangays}
          usersData={state.users}
          onSave={(data, userAccount) => {
            void savePurokWithUser(data, userAccount);
            setEditing(null);
          }}
          onClose={() => setEditing(null)}
        />
      )}
      {editing && editing !== "new" && (
        <PurokModal
          initial={editing}
          barangaysData={state.barangays}
          usersData={state.users}
          onSave={(data, userAccount) => {
            void savePurokWithUser(data, userAccount, editing.id);
            setEditing(null);
          }}
          onClose={() => setEditing(null)}
        />
      )}
    </>
  );
}
