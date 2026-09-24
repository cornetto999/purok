import { X } from "lucide-react";
import type { ReactNode } from "react";

export function ModalShell({ title, onClose, children, width = "max-w-lg" }: {
  title: string;
  onClose: () => void;
  children: ReactNode;
  width?: string;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-md"
        onClick={onClose}
      />
      <div
        className={`relative z-10 w-full ${width} overflow-hidden rounded-2xl bg-white shadow-2xl shadow-slate-900/20 animate-in fade-in zoom-in-95 duration-200`}
      >
        {/* Modal header */}
        <div className="flex items-center justify-between border-b border-slate-100 bg-gradient-to-r from-slate-50 to-white px-6 py-4">
          <h2 className="text-base font-semibold text-slate-800">{title}</h2>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="max-h-[75vh] overflow-y-auto px-6 py-5">{children}</div>
      </div>
    </div>
  );
}

export function Field({ label, children, className }: { label: string; children: ReactNode; className?: string }) {
  return (
    <div className={className}>
      <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-500">
        {label}
      </label>
      {children}
    </div>
  );
}

export const inputCls =
  "w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none transition-all focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100";

export function FormActions({ onClose, submitLabel, submitColor = "bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700" }: {
  onClose: () => void;
  submitLabel: string;
  submitColor?: string;
}) {
  return (
    <div className="flex justify-end gap-2 pt-3">
      <button
        type="button"
        onClick={onClose}
        className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-50"
      >
        Cancel
      </button>
      <button
        type="submit"
        className={`rounded-lg px-4 py-2 text-sm font-semibold text-white shadow-sm transition-all ${submitColor}`}
      >
        {submitLabel}
      </button>
    </div>
  );
}
