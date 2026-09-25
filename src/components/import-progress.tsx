import { Database, FileSpreadsheet, Loader2 } from "lucide-react";

interface ImportProgressProps {
  fileName: string | undefined;
  completedFiles: number;
  totalFiles: number;
}

export function ImportProgress({
  fileName,
  completedFiles,
  totalFiles,
}: ImportProgressProps) {
  const percent =
    totalFiles > 0 ? Math.round((completedFiles / totalFiles) * 100) : 0;

  return (
    <section className="rounded-2xl border border-indigo-200 bg-gradient-to-br from-indigo-50 via-white to-violet-50 px-6 py-7 text-center">
      <div
        aria-hidden="true"
        className="mb-4 flex items-center justify-center gap-3"
      >
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-indigo-100 bg-white text-indigo-600 shadow-sm motion-safe:animate-pulse">
          <FileSpreadsheet className="h-7 w-7" />
        </div>
        <div className="flex gap-2 text-indigo-500">
          {[0, 1, 2].map((dot) => (
            <span
              key={dot}
              className="h-2 w-2 rounded-full bg-current motion-safe:animate-bounce"
              style={{
                animationDelay: `${dot * 150}ms`,
                animationDuration: "1.2s",
              }}
            />
          ))}
        </div>
        <div className="relative flex h-14 w-14 items-center justify-center rounded-full bg-indigo-100 text-indigo-600">
          <span className="absolute inset-0 rounded-full border-2 border-indigo-200 border-t-indigo-600 motion-safe:animate-spin" />
          <Database className="h-6 w-6" />
        </div>
      </div>

      <div role="status" aria-live="polite" aria-atomic="true">
        <h3 className="text-base font-semibold text-slate-900">
          Importing your spreadsheets
        </h3>
        <p className="mx-auto mt-1 max-w-lg break-words text-sm font-medium text-indigo-700">
          {fileName ?? "Preparing your files…"}
        </p>
        <p className="mt-1 text-xs text-slate-500">
          {completedFiles} of {totalFiles} files processed. Keep this window
          open while records are saved.
        </p>
      </div>

      <div className="mx-auto mt-5 max-w-md">
        <div className="mb-2 flex items-center justify-between text-xs font-medium text-indigo-700">
          <span className="inline-flex items-center gap-1.5">
            <Loader2
              aria-hidden="true"
              className="h-3.5 w-3.5 motion-safe:animate-spin"
            />
            Import in progress
          </span>
          <span>{percent}% of files processed</span>
        </div>
        <div
          role="progressbar"
          aria-label="Files processed"
          aria-valuemin={0}
          aria-valuemax={totalFiles}
          aria-valuenow={completedFiles}
          aria-valuetext={`${completedFiles} of ${totalFiles} files processed`}
          className="h-2 overflow-hidden rounded-full bg-indigo-100"
        >
          <div
            className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-violet-500 transition-[width] duration-500 motion-reduce:transition-none"
            style={{ width: `${percent}%` }}
          />
        </div>
      </div>
    </section>
  );
}
