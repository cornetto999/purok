import type { ReactNode } from "react";

export function StatCard({ icon, label, value, onClick, accent }: {
  icon: ReactNode;
  label: string;
  value: number | string;
  onClick?: () => void;
  accent?: string;
}) {
  return (
    <div
      onClick={onClick}
      className={`group relative flex items-center gap-4 overflow-hidden rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition-all duration-200 ${
        onClick ? "cursor-pointer hover:border-slate-300 hover:shadow-md hover:-translate-y-0.5" : ""
      }`}
    >
      {accent && (
        <div
          className="absolute left-0 top-0 h-full w-1 transition-all group-hover:w-1.5"
          style={{ backgroundColor: accent }}
        />
      )}
      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-slate-100 transition-colors group-hover:bg-slate-200">
        {icon}
      </div>
      <div>
        <p className="text-2xl font-bold leading-none tracking-tight">{value}</p>
        <p className="mt-1 text-sm text-slate-500">{label}</p>
      </div>
    </div>
  );
}
