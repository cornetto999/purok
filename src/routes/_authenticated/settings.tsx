import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import {
  Download,
  FileSpreadsheet,
  RotateCcw,
  TableProperties,
} from "lucide-react";
import { useStore } from "@/lib/store";
import { exportToExcel, downloadTemplate } from "@/lib/excel";
import { ImportDataModal } from "@/components/import-data-modal";

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
