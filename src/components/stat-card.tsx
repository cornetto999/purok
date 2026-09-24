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
      className={`group relative flex items-center gap-4 overflow-hidden rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm transition-all duration-200 ${
        onClick ? "cursor-pointer hover:border-slate-300 hover:shadow-lg hover:-translate-y-0.5" : ""
      }`}
    >
      {/* Subtle background glow */}
      {accent && (
        <div
          className="pointer-events-none absolute -right-4 -top-4 h-20 w-20 rounded-full opacity-10 blur-2xl transition-all duration-300 group-hover:opacity-20"
          style={{ backgroundColor: accent }}
        />
      )}
      {/* Left accent bar */}
      {accent && (
        <div
          className="absolute left-0 top-0 h-full w-1 rounded-l-2xl transition-all duration-200 group-hover:w-1.5"
          style={{ backgroundColor: accent }}
        />
      )}
      <div
        className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl shadow-sm transition-all duration-200 group-hover:scale-105"
        style={
          accent
            ? {
                background: `linear-gradient(135deg, ${accent}22, ${accent}44)`,
                boxShadow: `0 2px 8px ${accent}30`,
              }
            : { background: "oklch(0.96 0.005 250)" }
        }
      >
        {icon}
      </div>
      <div className="min-w-0">
        <p className="text-2xl font-bold leading-none tracking-tight text-slate-900">
          {typeof value === "number" ? value.toLocaleString() : value}
        </p>
        <p className="mt-1 truncate text-sm font-medium text-slate-500">{label}</p>
      </div>
    </div>
  );
}
