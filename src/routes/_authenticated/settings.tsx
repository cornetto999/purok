import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import {
  Download,
  FileSpreadsheet,
  RotateCcw,
  TableProperties,
  Users,
  Plus,
  Trash2,
  Pencil,
} from "lucide-react";
import { useStore } from "@/lib/store";
import { exportToExcel, downloadTemplate } from "@/lib/excel";
import { ImportDataModal } from "@/components/import-data-modal";
import type { Team } from "@/lib/types";

export const Route = createFileRoute("/_authenticated/settings")({
  head: () => ({
    meta: [
      { title: "Settings — Barangay RMS" },
      {
        name: "description",
        content: "Import/export data and system settings.",
      },
    ],
  }),
  component: SettingsPage,
});

function SettingsPage() {
  const store = useStore();
  const { state } = store;
  const navigate = useNavigate();
  const [showImportModal, setShowImportModal] = useState(false);

  useEffect(() => {
    if (state.session?.role !== "Admin") {
      void navigate({ to: "/my-dashboard" });
    }
  }, [state.session, navigate]);

  const handleExport = () => {
    void exportToExcel({
      barangays: state.barangays,
      puroks: state.puroks,
      households: state.households,
      members: state.members,
    });
  };

  const handleReset = () => {
    alert(
      "Reset data is disabled in Supabase mode. Please run the SQL schema migration again to reset.",
    );
  };

  const handleClearStorage = () => {
    if (
      confirm(
        "This will clear ALL saved data from localStorage, including user accounts. You will be logged out. Continue?",
      )
    ) {
      try {
        localStorage.removeItem("brms_data");
        localStorage.removeItem("brms_session");
      } catch {
        // Ignore
      }
      window.location.reload();
    }
  };

  return (
    <>
      <header className="border-b border-slate-200 bg-white px-6 py-4">
        <h1 className="text-lg font-semibold">Settings</h1>
        <p className="text-sm text-slate-500">
          Import/export data and manage system settings
        </p>
      </header>

      <div className="space-y-6 p-6">
        {/* Excel operations */}
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="mb-1 text-sm font-semibold text-slate-700">
            Excel Import / Export
          </h2>
          <p className="mb-5 text-xs text-slate-500">
            Import an ENTRY sheet or export the current data.
          </p>

          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => setShowImportModal(true)}
              className="flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2.5 text-sm font-medium text-white shadow-sm transition-colors hover:bg-emerald-700"
            >
              <TableProperties className="h-4 w-4" /> Import ENTRY Sheet
            </button>

            <button
              onClick={handleExport}
              className="flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50"
            >
              <Download className="h-4 w-4" /> Export Excel
            </button>

            <button
              onClick={() => void downloadTemplate()}
              className="flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50"
            >
              <FileSpreadsheet className="h-4 w-4" /> Download Template
            </button>
          </div>
        </div>

        {/* Data stats */}
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="mb-1 text-sm font-semibold text-slate-700">
            Current Data Summary
          </h2>
          <p className="mb-4 text-xs text-slate-500">
            Data persisted in localStorage.
          </p>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {(
              [
                ["Barangays", state.barangays.length],
                ["Puroks", state.puroks.length],
                ["Households", state.households.length],
                ["Members", state.members.length],
              ] as const
            ).map(([label, count]) => (
              <div
                key={label}
                className="rounded-lg bg-slate-50 p-3 text-center"
              >
                <p className="text-xl font-bold">{count}</p>
                <p className="text-[11px] text-slate-500">{label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Team Management */}
        <TeamManagement />

        {/* Danger zone */}
        <div className="rounded-xl border border-red-200 bg-red-50 p-6">
          <h2 className="mb-1 text-sm font-semibold text-red-800">
            Danger Zone
          </h2>
          <p className="mb-4 text-xs text-red-600">
            These actions are irreversible.
          </p>
          <div className="flex flex-wrap gap-3">
            <button
              onClick={handleReset}
              className="flex items-center gap-2 rounded-lg border border-red-300 bg-white px-4 py-2.5 text-sm font-medium text-red-700 transition-colors hover:bg-red-100"
            >
              <RotateCcw className="h-4 w-4" /> Reset to Seed Data
            </button>
            <button
              onClick={handleClearStorage}
              className="flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-red-700"
            >
              Clear All Storage
            </button>
          </div>
        </div>
      </div>

      {showImportModal && (
        <ImportDataModal onClose={() => setShowImportModal(false)} />
      )}
    </>
  );
}

function TeamManagement() {
  const { state, addTeam, updateTeam, deleteTeam } = useStore();
  const [showForm, setShowForm] = useState(false);
  const [editingTeam, setEditingTeam] = useState<Team | null>(null);
  
  const [teamName, setTeamName] = useState("");
  const [description, setDescription] = useState("");
  const [barangayId, setBarangayId] = useState<number>(state.barangays[0]?.id || 0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!teamName.trim() || barangayId === 0) return;
    
    if (editingTeam) {
      await updateTeam(editingTeam.id, {
        team_name: teamName.trim(),
        description: description.trim(),
        barangay_id: barangayId,
      });
    } else {
      await addTeam({
        team_name: teamName.trim(),
        description: description.trim(),
        barangay_id: barangayId,
      });
    }
    
    resetForm();
  };

  const handleEdit = (team: Team) => {
    setEditingTeam(team);
    setTeamName(team.team_name);
    setDescription(team.description || "");
    setBarangayId(team.barangay_id);
    setShowForm(true);
  };

  const handleDelete = async (id: number) => {
    if (confirm("Are you sure you want to delete this team? Members in this team will be marked as unassigned.")) {
      await deleteTeam(id);
    }
  };

  const resetForm = () => {
    setShowForm(false);
    setEditingTeam(null);
    setTeamName("");
    setDescription("");
    setBarangayId(state.barangays[0]?.id || 0);
  };

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-sm font-semibold text-slate-700 flex items-center gap-2">
            <Users className="h-4 w-4 text-emerald-600" /> Manage Teams
          </h2>
          <p className="text-xs text-slate-500">
            Create groups or teams to categorize members.
          </p>
        </div>
        {!showForm && (
          <button
            onClick={() => setShowForm(true)}
            className="flex items-center gap-1.5 rounded-lg bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-700 hover:bg-emerald-100"
          >
            <Plus className="h-3.5 w-3.5" /> Add Team
          </button>
        )}
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="mb-6 rounded-lg border border-slate-200 bg-slate-50 p-4 space-y-4">
          <h3 className="text-xs font-bold uppercase text-slate-600">{editingTeam ? "Edit Team" : "New Team"}</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="mb-1 block text-xs font-medium text-slate-700">Team Name *</label>
              <input
                required
                className="w-full rounded-md border border-slate-300 px-3 py-1.5 text-sm outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                value={teamName}
                onChange={(e) => setTeamName(e.target.value)}
                placeholder="e.g. Red Faction"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-slate-700">Barangay *</label>
              <select
                required
                className="w-full rounded-md border border-slate-300 px-3 py-1.5 text-sm outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 bg-white"
                value={barangayId}
                onChange={(e) => setBarangayId(Number(e.target.value))}
              >
                {state.barangays.map(b => (
                  <option key={b.id} value={b.id}>{b.name}</option>
                ))}
              </select>
            </div>
            <div className="md:col-span-2">
              <label className="mb-1 block text-xs font-medium text-slate-700">Description (Optional)</label>
              <textarea
                className="w-full rounded-md border border-slate-300 px-3 py-1.5 text-sm outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Optional description"
                rows={2}
              />
            </div>
          </div>
          
          <div className="flex justify-end gap-2 pt-2 border-t border-slate-200">
            <button
              type="button"
              onClick={resetForm}
              className="rounded-md px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="rounded-md bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-emerald-700"
            >
              {editingTeam ? "Save Changes" : "Create Team"}
            </button>
          </div>
        </form>
      )}

      {state.teams.length > 0 ? (
        <div className="overflow-hidden rounded-lg border border-slate-200">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-4 py-2 font-semibold text-slate-600 text-xs uppercase tracking-wider">Team Name</th>
                <th className="px-4 py-2 font-semibold text-slate-600 text-xs uppercase tracking-wider">Barangay</th>
                <th className="px-4 py-2 font-semibold text-slate-600 text-xs uppercase tracking-wider">Description</th>
                <th className="px-4 py-2 text-right font-semibold text-slate-600 text-xs uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {state.teams.map(team => {
                const b = state.barangays.find(br => br.id === team.barangay_id);
                return (
                  <tr key={team.id} className="hover:bg-slate-50/50">
                    <td className="px-4 py-2.5 font-medium text-slate-900">{team.team_name}</td>
                    <td className="px-4 py-2.5 text-slate-600">{b?.name || "Unknown"}</td>
                    <td className="px-4 py-2.5 text-slate-500 text-xs">{team.description || "—"}</td>
                    <td className="px-4 py-2.5 text-right">
                      <button onClick={() => handleEdit(team)} className="text-slate-400 hover:text-indigo-600 p-1">
                        <Pencil className="h-4 w-4" />
                      </button>
                      <button onClick={() => handleDelete(team.id)} className="text-slate-400 hover:text-red-600 p-1 ml-1">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ) : (
        <p className="text-xs text-slate-500 italic py-4 border border-dashed border-slate-200 rounded-lg text-center">No teams created yet.</p>
      )}
    </div>
  );
}
