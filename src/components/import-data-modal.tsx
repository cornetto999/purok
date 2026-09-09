import { useState, useRef, useCallback } from "react";
import { useNavigate } from "@tanstack/react-router";
import {
  X,
  Upload,
  FileSpreadsheet,
  CheckCircle,
  AlertTriangle,
  Loader2,
  Users,
  Home,
  MapPin,
  Play,
  Square,
  Trash2,
} from "lucide-react";
import {
  type BatchItem,
  createBatchItem,
  isExcelFile,
  processBatchUpload,
} from "@/lib/batch-importer";
import { BARANGAYS_SEED_DATA } from "@/lib/barangay-data";
import { useStore } from "@/lib/store";

export function ImportDataModal({ onClose }: { onClose: () => void }) {
  const store = useStore();
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [queue, setQueue] = useState<BatchItem[]>([]);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [ignoredCount, setIgnoredCount] = useState<number>(0);

  const isCancelledRef = useRef<boolean>(false);

  // Available barangays for override dropdown
  const allBarangayOptions = Array.from(
    new Set([
      ...BARANGAYS_SEED_DATA.map((b) => b.name),
      ...store.state.barangays.map((b) => b.name).filter((n) => n !== "Imported Barangay"),
    ]),
  );

  // ── Add files to queue ───────────────────────────────────────────────────

  const addFilesToQueue = useCallback((fileList: FileList | File[]) => {
    const files = Array.from(fileList);
    const validFiles: File[] = [];
    let nonExcel = 0;

    for (const f of files) {
      if (isExcelFile(f)) {
        validFiles.push(f);
      } else {
        nonExcel++;
      }
    }

    if (nonExcel > 0) {
      setIgnoredCount((prev) => prev + nonExcel);
    }

    if (validFiles.length === 0) return;

    setQueue((prev) => {
      // Avoid duplicate file names if identical
      const existingNames = new Set(prev.map((i) => `${i.fileName}-${i.file.size}`));
      const newItems = validFiles
        .filter((f) => !existingNames.has(`${f.name}-${f.size}`))
        .map(createBatchItem);

      return [...prev, ...newItems];
    });
  }, []);

  const handleFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files && e.target.files.length > 0) {
        addFilesToQueue(e.target.files);
        e.target.value = "";
      }
    },
    [addFilesToQueue],
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
      if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
        addFilesToQueue(e.dataTransfer.files);
      }
    },
    [addFilesToQueue],
  );

  // ── Item updates ─────────────────────────────────────────────────────────

  const handleTargetBarangayChange = (itemId: string, newBarangay: string) => {
    setQueue((prev) =>
      prev.map((item) =>
        item.id === itemId
          ? { ...item, targetBarangay: newBarangay }
          : item,
      ),
    );
  };

  const handleRemoveItem = (itemId: string) => {
    if (isProcessing) return;
    setQueue((prev) => prev.filter((item) => item.id !== itemId));
  };

  const handleClearCompleted = () => {
    if (isProcessing) return;
    setQueue((prev) => prev.filter((item) => item.status === "pending"));
  };

  const handleClearAll = () => {
    if (isProcessing) return;
    setQueue([]);
    setIgnoredCount(0);
  };

  // ── Batch Upload Execution ────────────────────────────────────────────────

  const handleStartBatch = async () => {
    const pendingItems = queue.filter(
      (i) => i.status === "pending" || i.status === "failed",
    );
    if (pendingItems.length === 0 || isProcessing) return;

    setIsProcessing(true);
    isCancelledRef.current = false;

    const onProgress = (itemId: string, patch: Partial<BatchItem>) => {
      setQueue((prev) =>
        prev.map((item) => (item.id === itemId ? { ...item, ...patch } : item)),
      );
    };

    try {
      await processBatchUpload(
        queue,
        onProgress,
        () => isCancelledRef.current,
      );
    } finally {
      setIsProcessing(false);
      // Refresh local store with all newly added records
      void store.refreshData();
    }
  };

  const handleCancelBatch = () => {
    isCancelledRef.current = true;
  };

  // ── Statistics ────────────────────────────────────────────────────────────

  const totalFiles = queue.length;
  const pendingCount = queue.filter((i) => i.status === "pending").length;
  const processingCount = queue.filter((i) => i.status === "processing").length;
  const successCount = queue.filter((i) => i.status === "success").length;
  const failedCount = queue.filter((i) => i.status === "failed").length;
  const totalImportedMembers = queue.reduce((acc, i) => acc + i.memberCount, 0);

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
    >
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity"
        onClick={() => !isProcessing && onClose()}
      />

      {/* Modal Dialog */}
      <div className="relative z-10 flex max-h-[92vh] w-full max-w-4xl flex-col rounded-2xl bg-white shadow-2xl overflow-hidden border border-slate-200 animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-200 bg-slate-50/80 px-6 py-4">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-100 text-indigo-600">
              <FileSpreadsheet className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-slate-800">
                Bulk Multi-Barangay Importer
              </h2>
              <p className="text-xs text-slate-500">
                Upload multiple RV_[Barangay].xlsx files at once for automatic relational mapping.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            disabled={isProcessing}
            aria-label="Close"
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-200 hover:text-slate-600 transition-colors disabled:opacity-40"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Dropzone */}
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => !isProcessing && fileInputRef.current?.click()}
            className={`flex flex-col items-center justify-center rounded-2xl border-2 border-dashed p-7 text-center transition-all cursor-pointer ${
              isDragging
                ? "border-indigo-500 bg-indigo-50/60 scale-[1.005]"
                : "border-slate-300 bg-slate-50/50 hover:border-indigo-400 hover:bg-slate-50"
            } ${isProcessing ? "opacity-60 cursor-not-allowed" : ""}`}
          >
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept=".xlsx,.xls"
              onChange={handleFileChange}
              className="hidden"
              disabled={isProcessing}
            />
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-100/70 text-indigo-600 shadow-sm">
              <Upload className="h-6 w-6" />
            </div>
            <p className="mt-3 text-sm font-semibold text-slate-800">
              Drop multiple RV Excel files here, or{" "}
              <span className="text-indigo-600 underline decoration-indigo-300 underline-offset-2">
                browse files
              </span>
            </p>
            <p className="mt-1 text-xs text-slate-500">
              Supports multiple files (e.g. <code>RV_BURNAY.xlsx</code>, <code>RV_COGON.xlsx</code>, <code>RV_POBLACION.xlsx</code>).
            </p>
            <span className="mt-2 inline-flex items-center gap-1 rounded-full bg-slate-200/60 px-2.5 py-0.5 text-[11px] font-medium text-slate-600">
              Accepts .xlsx and .xls with "ENTRY" sheet
            </span>
          </div>

          {/* Ignored non-excel files notice */}
          {ignoredCount > 0 && (
            <div className="flex items-center justify-between rounded-lg bg-amber-50 border border-amber-200 px-3.5 py-2 text-xs text-amber-800">
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-amber-600 flex-shrink-0" />
                <span>
                  Ignored {ignoredCount} non-Excel file(s). Only .xlsx and .xls files are processed.
                </span>
              </div>
              <button
                onClick={() => setIgnoredCount(0)}
                className="text-amber-700 hover:text-amber-900 font-medium"
              >
                Dismiss
              </button>
            </div>
          )}

          {/* Queue Section */}
          {queue.length > 0 && (
            <div className="space-y-3">
              {/* Queue Controls & Status Counts */}
              <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-200 bg-slate-50/70 p-3.5">
                <div className="flex items-center gap-4 text-xs font-medium text-slate-600">
                  <span>
                    Queue: <strong className="text-slate-900">{totalFiles}</strong> files
                  </span>
                  {pendingCount > 0 && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-slate-200 px-2 py-0.5 text-slate-700 text-[11px]">
                      {pendingCount} Pending
                    </span>
                  )}
                  {processingCount > 0 && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-blue-100 text-blue-700 px-2 py-0.5 text-[11px] animate-pulse">
                      <Loader2 className="h-3 w-3 animate-spin" /> Processing
                    </span>
                  )}
                  {successCount > 0 && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 text-emerald-700 px-2 py-0.5 text-[11px]">
                      <CheckCircle className="h-3 w-3" /> {successCount} Success
                    </span>
                  )}
                  {failedCount > 0 && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-red-100 text-red-700 px-2 py-0.5 text-[11px]">
                      <AlertTriangle className="h-3 w-3" /> {failedCount} Failed
                    </span>
                  )}
                  {totalImportedMembers > 0 && (
                    <span className="text-indigo-600 font-semibold">
                      +{totalImportedMembers.toLocaleString()} Residents
                    </span>
                  )}
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2">
                  {!isProcessing ? (
                    <>
                      {pendingCount > 0 && (
                        <button
                          onClick={() => void handleStartBatch()}
                          className="inline-flex items-center gap-1.5 rounded-lg bg-indigo-600 px-3.5 py-1.5 text-xs font-semibold text-white shadow-sm hover:bg-indigo-700 active:scale-95 transition-all"
                        >
                          <Play className="h-3.5 w-3.5 fill-white" /> Start Batch Import ({pendingCount})
                        </button>
                      )}
                      {successCount > 0 && (
                        <button
                          onClick={handleClearCompleted}
                          className="rounded-lg border border-slate-300 px-2.5 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-100 transition-colors"
                        >
                          Clear Success
                        </button>
                      )}
                      <button
                        onClick={handleClearAll}
                        className="rounded-lg border border-slate-300 px-2.5 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-100 transition-colors"
                      >
                        Clear All
                      </button>
                    </>
                  ) : (
                    <button
                      onClick={handleCancelBatch}
                      className="inline-flex items-center gap-1.5 rounded-lg bg-rose-600 px-3 py-1.5 text-xs font-semibold text-white shadow-sm hover:bg-rose-700 active:scale-95 transition-all"
                    >
                      <Square className="h-3 w-3 fill-white" /> Cancel Batch
                    </button>
                  )}
                </div>
              </div>

              {/* Batch Import Queue Table */}
              <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead>
                      <tr className="border-b border-slate-200 bg-slate-50 text-xs font-semibold uppercase tracking-wider text-slate-500">
                        <th className="px-4 py-2.5">File Name</th>
                        <th className="px-4 py-2.5">Detected Barangay</th>
                        <th className="px-4 py-2.5 text-right">Row Count</th>
                        <th className="px-4 py-2.5">Status</th>
                        <th className="px-3 py-2.5 w-10 text-center" />
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {queue.map((item) => {
                        const isPending = item.status === "pending";
                        const isProc = item.status === "processing";
                        const isSuccess = item.status === "success";
                        const isFailed = item.status === "failed";

                        return (
                          <tr
                            key={item.id}
                            className={`transition-colors ${
                              isProc
                                ? "bg-blue-50/40"
                                : isSuccess
                                  ? "bg-emerald-50/20"
                                  : isFailed
                                    ? "bg-red-50/20"
                                    : "hover:bg-slate-50/60"
                            }`}
                          >
                            {/* File Name */}
                            <td className="px-4 py-3">
                              <div className="flex items-center gap-2">
                                <FileSpreadsheet
                                  className={`h-4 w-4 flex-shrink-0 ${
                                    isSuccess
                                      ? "text-emerald-600"
                                      : isFailed
                                        ? "text-red-500"
                                        : "text-indigo-600"
                                  }`}
                                />
                                <div className="min-w-0">
                                  <p className="truncate font-medium text-slate-800 text-xs sm:text-sm">
                                    {item.fileName}
                                  </p>
                                  <span className="text-[11px] text-slate-400">
                                    {formatFileSize(item.file.size)}
                                  </span>
                                </div>
                              </div>
                            </td>

                            {/* Detected Barangay */}
                            <td className="px-4 py-3">
                              {isPending ? (
                                <select
                                  value={item.targetBarangay}
                                  onChange={(e) =>
                                    handleTargetBarangayChange(item.id, e.target.value)
                                  }
                                  className="rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-xs font-semibold text-slate-800 shadow-sm outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-200"
                                >
                                  {/* Include current detected name if not in standard list */}
                                  {!allBarangayOptions.includes(item.targetBarangay) && (
                                    <option value={item.targetBarangay}>
                                      {item.targetBarangay} (New)
                                    </option>
                                  )}
                                  {allBarangayOptions.map((b) => (
                                    <option key={b} value={b}>
                                      {b}
                                    </option>
                                  ))}
                                </select>
                              ) : (
                                <span className="inline-flex items-center gap-1 rounded-md bg-indigo-50 px-2 py-1 text-xs font-semibold text-indigo-700 border border-indigo-100">
                                  <MapPin className="h-3 w-3" />
                                  {item.targetBarangay}
                                </span>
                              )}
                            </td>

                            {/* Row Count */}
                            <td className="px-4 py-3 text-right">
                              {isSuccess ? (
                                <span className="font-semibold text-emerald-700 text-xs sm:text-sm">
                                  {item.memberCount.toLocaleString()} residents
                                </span>
                              ) : isProc ? (
                                <span className="text-xs text-blue-600 animate-pulse">
                                  Importing...
                                </span>
                              ) : isFailed ? (
                                <span className="text-xs text-slate-400">—</span>
                              ) : (
                                <span className="text-xs text-slate-400">Queued</span>
                              )}
                            </td>

                            {/* Status */}
                            <td className="px-4 py-3">
                              {isPending && (
                                <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-600">
                                  Pending
                                </span>
                              )}
                              {isProc && (
                                <span className="inline-flex items-center gap-1 rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-semibold text-blue-700">
                                  <Loader2 className="h-3 w-3 animate-spin" /> Processing
                                </span>
                              )}
                              {isSuccess && (
                                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-semibold text-emerald-700">
                                  <CheckCircle className="h-3.5 w-3.5 text-emerald-600" /> Success
                                </span>
                              )}
                              {isFailed && (
                                <div className="space-y-0.5">
                                  <span className="inline-flex items-center gap-1 rounded-full bg-red-100 px-2.5 py-0.5 text-xs font-semibold text-red-700">
                                    <AlertTriangle className="h-3.5 w-3.5 text-red-600" /> Failed
                                  </span>
                                  {item.errorMessage && (
                                    <p className="text-[11px] text-red-600 max-w-[200px] truncate" title={item.errorMessage}>
                                      {item.errorMessage}
                                    </p>
                                  )}
                                </div>
                              )}
                            </td>

                            {/* Remove button */}
                            <td className="px-3 py-3 text-center">
                              {!isProcessing && (
                                <button
                                  onClick={() => handleRemoveItem(item.id)}
                                  className="rounded p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors"
                                  title="Remove file"
                                >
                                  <Trash2 className="h-3.5 w-3.5" />
                                </button>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* Info Card */}
          <div className="flex items-start gap-3 rounded-xl border border-indigo-100 bg-indigo-50/50 p-4">
            <CheckCircle className="h-4 w-4 text-indigo-600 mt-0.5 flex-shrink-0" />
            <div className="text-xs text-indigo-900 space-y-1">
              <p className="font-semibold">Relational Mapping & Safety</p>
              <p className="text-indigo-800 leading-relaxed">
                For each uploaded file, the importer will check if the Barangay exists in the database (or auto-create it), extract Puroks from the <code>CODE</code> column, create Households from <code>HL</code> (Household Leader) entries, and map all <code>HM</code> members directly to their corresponding Household and Barangay. If any file fails (e.g. missing ENTRY sheet), other files will continue processing safely.
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between border-t border-slate-200 bg-slate-50 px-6 py-4">
          <p className="text-xs text-slate-500">
            {successCount > 0
              ? `${successCount} of ${totalFiles} files imported (${totalImportedMembers.toLocaleString()} residents added)`
              : "Ready to process RV spreadsheets"}
          </p>

          <div className="flex items-center gap-2">
            {successCount > 0 && (
              <button
                onClick={() => {
                  onClose();
                  void navigate({ to: "/members" });
                }}
                className="rounded-lg bg-emerald-600 px-4 py-2 text-xs font-semibold text-white shadow-sm hover:bg-emerald-700 transition-all"
              >
                View Members ({totalImportedMembers.toLocaleString()})
              </button>
            )}

            <button
              onClick={onClose}
              disabled={isProcessing}
              className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 transition-colors disabled:opacity-50"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
