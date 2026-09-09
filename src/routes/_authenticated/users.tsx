import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { Plus, Trash2 } from "lucide-react";
import { useStore } from "@/lib/store";
import { UserModal } from "@/components/user-modal";

export const Route = createFileRoute("/_authenticated/users")({
  head: () => ({
    meta: [
      { title: "Users — Barangay RMS" },
      { name: "description", content: "Manage user accounts and role assignments." },
    ],
  }),
  component: UsersPage,
});

function UsersPage() {
  const store = useStore();
  const { state } = store;
  const navigate = useNavigate();
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    if (state.session?.role !== "Admin") {
      void navigate({ to: "/my-dashboard" });
    }
  }, [state.session, navigate]);

  const { users, puroks, households } = state;

  const getAssignment = (user: typeof users[number]) => {
    if (user.role === "Admin") return "Full system access";
    if (user.role === "Purok Leader") {
      const p = puroks.find((pk) => pk.id === user.linked_entity_id);
      return p ? p.name : "Unassigned";
    }
    const h = households.find((hh) => hh.id === user.linked_entity_id);
    return h ? `${h.householdLeaderName} — ${h.address}` : "Unassigned";
  };

  const roleBadgeCls = (role: string) => {
    switch (role) {
      case "Admin": return "bg-slate-800 text-white";
      case "Purok Leader": return "bg-indigo-50 text-indigo-700";
      case "Household Leader": return "bg-emerald-50 text-emerald-700";
      default: return "bg-slate-100 text-slate-600";
    }
  };

  return (
    <>
      <header className="border-b border-slate-200 bg-white px-6 py-4">
        <h1 className="text-lg font-semibold">Users</h1>
        <p className="text-sm text-slate-500">Manage user accounts and role assignments</p>
      </header>

      <div className="space-y-6 p-6">
        <div className="flex justify-end">
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-1.5 rounded-lg bg-slate-900 px-4 py-2 text-xs font-semibold text-white transition-colors hover:bg-slate-700"
          >
            <Plus className="h-4 w-4" /> Create User
          </button>
        </div>

        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="border-b border-slate-200 bg-slate-50 text-xs uppercase text-slate-500">
              <tr>
                <th className="px-4 py-3 font-semibold">Display Name</th>
                <th className="px-4 py-3 font-semibold">Username</th>
                <th className="px-4 py-3 font-semibold">Role</th>
                <th className="px-4 py-3 font-semibold">Assignment</th>
                <th className="px-4 py-3 font-semibold" />
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {users
                .sort((a, b) => a.displayName.localeCompare(b.displayName))
                .map((u) => (
                  <tr key={u.id} className="hover:bg-slate-50 transition-colors">
                    <td className="whitespace-nowrap px-4 py-3 font-medium text-slate-900">{u.displayName}</td>
                    <td className="whitespace-nowrap px-4 py-3 font-mono text-xs text-slate-500">{u.username}</td>
                    <td className="whitespace-nowrap px-4 py-3">
                      <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[10px] font-bold ${roleBadgeCls(u.role)}`}>
                        {u.role}
                      </span>
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-slate-600 max-w-[250px] truncate">{getAssignment(u)}</td>
                    <td className="px-4 py-3">
                      {u.id !== state.session?.userId && (
                        <button
                          onClick={() => { if (confirm(`Delete user "${u.username}"?`)) store.deleteUser(u.id); }}
                          className="rounded-md p-1.5 text-slate-400 transition-colors hover:bg-red-50 hover:text-red-600"
                          title="Delete user"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>

        {users.length === 0 && (
          <p className="py-8 text-center text-sm text-slate-400">No user accounts.</p>
        )}
      </div>

      {showModal && (
        <UserModal
          puroksData={puroks}
          householdsData={households}
          onSave={(data) => {
            store.addUser(data);
            setShowModal(false);
          }}
          onClose={() => setShowModal(false)}
        />
      )}
    </>
  );
}
