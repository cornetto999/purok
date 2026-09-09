import { useState, useRef, useCallback } from "react";
import { X, Upload, FileSpreadsheet, CheckCircle, AlertTriangle, Loader2, Users, Home, MapPin } from "lucide-react";
import { parseEntrySheet, type ImportSummary } from "@/lib/import-entry-sheet";
import { useStore } from "@/lib/store";

type Stage = "idle" | "parsing" | "preview" | "importing" | "done" | "error";

export function ImportDataModal({ onClose }: { onClose: () => void }) {
  const store = useStore();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [stage, setStage] = useState<Stage>("idle");
  const [fileName, setFileName] = useState<string>("");
  const [summary, setSummary] = useState<ImportSummary | null>(null);
  const [errorMsg, setErrorMsg] = useState<string>("");
  const [isDragging, setIsDragging] = useState(false);

  // ── File handling ─────────────────────────────────────────────────────────

  const processFile = useCallback(async (file: File) => {
    setFileName(file.name);
    setStage("parsing");
    setErrorMsg("");

    try {
      const result = await parseEntrySheet(file);
      setSummary(result);
      setStage("preview");
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to parse file.");
      setStage("error");
    }
  }, []);

  const handleFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) void processFile(file);
    },
    [processFile]
  );

  // ── Drag & drop ──────────────────────────────────────────────────────────

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      const file = e.dataTransfer.files[0];
      if (file) void processFile(file);
    },
    [processFile]
  );

  // ── Confirm import ───────────────────────────────────────────────────────

  const handleConfirmImport = useCallback(async () => {
    if (!summary) return;
    setStage("importing");
    try {
      await store.bulkImport(summary.data);
      setStage("done");
    } catch (err: any) {
      setErrorMsg(err.message || "Import failed.");
      setStage("error");
    }
  }, [summary, store]);

  // ── Reset ─────────────────────────────────────────────────────────────────

  const handleReset = useCallback(() => {
    setStage("idle");
    setFileName("");
    setSummary(null);
    setErrorMsg("");
    if (fileInputRef.current) fileInputRef.current.value = "";
  }, []);

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
        onClick={stage === "importing" ? undefined : onClose}
      />

      {/* Modal */}
      <div className="relative z-10 w-full max-w-xl rounded-2xl bg-white shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600">
              <FileSpreadsheet className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-slate-800">Excel Data Importer</h2>
              <p className="text-xs text-slate-500">Upload an ENTRY-sheet Excel file</p>
            </div>
          </div>
          {stage !== "importing" && (
            <button
              onClick={onClose}
              className="rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        {/* Body */}
        <div className="px-6 py-5">
          {/* ─── IDLE: Drag & drop zone ──────────────────────────────────── */}
          {stage === "idle" && (
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`group flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed px-6 py-12 text-center transition-all ${
                isDragging
                  ? "border-indigo-500 bg-indigo-50 scale-[1.01]"
                  : "border-slate-300 bg-slate-50 hover:border-indigo-400 hover:bg-indigo-50/50"
              }`}
            >
              <div
                className={`mb-4 flex h-14 w-14 items-center justify-center rounded-full transition-all ${
                  isDragging
                    ? "bg-indigo-100 text-indigo-600 scale-110"
                    : "bg-slate-200 text-slate-500 group-hover:bg-indigo-100 group-hover:text-indigo-600"
                }`}
              >
                <Upload className="h-6 w-6" />
              </div>
              <p className="text-sm font-semibold text-slate-700">
                {isDragging ? "Drop your file here" : "Drag & drop your Excel file"}
              </p>
              <p className="mt-1 text-xs text-slate-500">
                or click to browse · Accepts <span className="font-medium">.xlsx, .xls</span>
              </p>
              <p className="mt-3 rounded-md bg-white px-3 py-1.5 text-[11px] text-slate-400 border border-slate-200 shadow-sm">
                Expects a sheet named <span className="font-bold text-indigo-600">ENTRY</span> with columns: PN, SN, LAST, FIRST, MIDDLE, ADDRESS, CODE, PL, HL, HM, REMARKS
              </p>
              <input
                ref={fileInputRef}
                type="file"
                accept=".xlsx,.xls"
                onChange={handleFileChange}
                className="hidden"
              />
            </div>
          )}

          {/* ─── PARSING: Loading spinner ─────────────────────────────────── */}
          {stage === "parsing" && (
            <div className="flex flex-col items-center justify-center py-16">
              <Loader2 className="h-10 w-10 animate-spin text-indigo-600" />
              <p className="mt-4 text-sm font-medium text-slate-700">
                Parsing <span className="font-semibold text-indigo-600">{fileName}</span>...
              </p>
              <p className="mt-1 text-xs text-slate-500">Reading ENTRY sheet and building hierarchy</p>
            </div>
          )}

          {/* ─── PREVIEW: Summary before commit ──────────────────────────── */}
          {stage === "preview" && summary && (
            <div className="space-y-5">
              {/* File name badge */}
              <div className="flex items-center gap-2 rounded-lg bg-green-50 border border-green-200 px-4 py-2.5">
                <CheckCircle className="h-4 w-4 text-green-600 flex-shrink-0" />
                <div>
                  <p className="text-sm font-medium text-green-800">File parsed successfully</p>
                  <p className="text-xs text-green-600">{fileName}</p>
                </div>
              </div>

              {/* Summary cards */}
              <div className="grid grid-cols-3 gap-3">
                <SummaryCard icon={Users} label="Members" count={summary.memberCount} color="indigo" />
                <SummaryCard icon={Home} label="Households" count={summary.householdCount} color="emerald" />
                <SummaryCard icon={MapPin} label="Puroks" count={summary.purokCount} color="amber" />
              </div>

              {/* Warning */}
              <div className="flex items-start gap-3 rounded-lg bg-amber-50 border border-amber-200 px-4 py-3">
                <AlertTriangle className="h-4 w-4 text-amber-600 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-xs font-semibold text-amber-800">This will replace all existing data</p>
                  <p className="text-xs text-amber-700 mt-0.5">
                    All current Barangays, Puroks, Households, and Members in the database will be deleted and replaced with this import.
                  </p>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-1">
                <button
                  onClick={handleReset}
                  className="flex-1 rounded-lg border border-slate-300 py-2.5 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-50"
                >
                  Choose Different File
                </button>
                <button
                  onClick={() => void handleConfirmImport()}
                  className="flex-1 flex items-center justify-center gap-2 rounded-lg bg-indigo-600 py-2.5 text-sm font-semibold text-white shadow-sm transition-all hover:bg-indigo-700 hover:shadow-md active:scale-[0.98]"
                >
                  <Upload className="h-4 w-4" />
                  Confirm Import
                </button>
              </div>
            </div>
          )}

          {/* ─── IMPORTING: Progress ─────────────────────────────────────── */}
          {stage === "importing" && (
            <div className="flex flex-col items-center justify-center py-16">
              <Loader2 className="h-10 w-10 animate-spin text-indigo-600" />
              <p className="mt-4 text-sm font-medium text-slate-700">
                Importing data to database...
              </p>
              <p className="mt-1 text-xs text-slate-500">
                Inserting {summary?.memberCount ?? 0} members across {summary?.purokCount ?? 0} puroks
              </p>
              <p className="mt-3 text-[11px] text-slate-400">Please do not close this window</p>
            </div>
          )}

          {/* ─── DONE: Success ───────────────────────────────────────────── */}
          {stage === "done" && (
            <div className="flex flex-col items-center justify-center py-12">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
              <p className="mt-4 text-base font-semibold text-slate-800">Import Complete!</p>
              <p className="mt-1 text-sm text-slate-500">
                Successfully imported {summary?.memberCount} members, {summary?.householdCount} households, and {summary?.purokCount} puroks.
              </p>
              <button
                onClick={onClose}
                className="mt-6 rounded-lg bg-indigo-600 px-6 py-2.5 text-sm font-semibold text-white shadow-sm transition-all hover:bg-indigo-700 hover:shadow-md active:scale-[0.98]"
              >
                Done
              </button>
            </div>
          )}

          {/* ─── ERROR ───────────────────────────────────────────────────── */}
          {stage === "error" && (
            <div className="flex flex-col items-center justify-center py-12">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-red-100">
                <AlertTriangle className="h-8 w-8 text-red-600" />
              </div>
              <p className="mt-4 text-base font-semibold text-red-800">Import Failed</p>
              <p className="mt-1 max-w-sm text-center text-sm text-red-600">{errorMsg}</p>
              <button
                onClick={handleReset}
                className="mt-6 rounded-lg border border-slate-300 px-6 py-2.5 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50"
              >
                Try Again
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Summary card sub-component ──────────────────────────────────────────────

function SummaryCard({
  icon: Icon,
  label,
  count,
  color,
}: {
  icon: typeof Users;
  label: string;
  count: number;
  color: "indigo" | "emerald" | "amber";
}) {
  const colorMap = {
    indigo: { bg: "bg-indigo-50", text: "text-indigo-700", icon: "text-indigo-500", border: "border-indigo-100" },
    emerald: { bg: "bg-emerald-50", text: "text-emerald-700", icon: "text-emerald-500", border: "border-emerald-100" },
    amber: { bg: "bg-amber-50", text: "text-amber-700", icon: "text-amber-500", border: "border-amber-100" },
  };
  const c = colorMap[color];

  return (
    <div className={`flex flex-col items-center rounded-xl border ${c.border} ${c.bg} p-4`}>
      <Icon className={`h-5 w-5 ${c.icon}`} />
      <p className={`mt-2 text-2xl font-bold ${c.text}`}>{count.toLocaleString()}</p>
      <p className="text-[11px] font-medium text-slate-500">{label}</p>
    </div>
  );
}
