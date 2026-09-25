import { createFileRoute, Outlet, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useStore } from "@/lib/store";
import { AppSidebar } from "@/components/app-sidebar";

export const Route = createFileRoute("/_authenticated")({
  component: AuthenticatedLayout,
});

function AuthenticatedLayout() {
  const { state, logout, refreshData } = useStore();
  const navigate = useNavigate();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  // Auth guard
  useEffect(() => {
    if (state.sessionChecked && !state.session) {
      void navigate({ to: "/login" });
    }
  }, [state.sessionChecked, state.session, navigate]);

  if (!state.sessionChecked || !state.session) return null;

  if (
    state.initialized &&
    !state.users.some(
      (user) =>
        user.id === state.session!.userId &&
        user.username === state.session!.username,
    )
  ) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-50 p-6">
        <div className="max-w-md space-y-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h1 className="text-xl font-bold text-slate-900">
            Sign in to your current account
          </h1>
          <p className="text-sm text-slate-600">
            This saved session no longer matches an account. Sign in again to
            view your claimed members.
          </p>
          <button
            onClick={logout}
            className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white"
          >
            Sign in again
          </button>
        </div>
      </main>
    );
  }

  return (
    <div className="flex min-h-screen bg-grid text-slate-900">
      <AppSidebar
        collapsed={sidebarCollapsed}
        onToggle={() => setSidebarCollapsed((collapsed) => !collapsed)}
      />
      <main className="flex-1 overflow-x-hidden">
        {state.loadError && (
          <div
            role="alert"
            className="m-6 rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-800"
          >
            <p>{state.loadError}</p>
            <button
              onClick={() => void refreshData()}
              disabled={state.loading}
              className="mt-3 rounded-lg bg-white px-3 py-2 font-semibold ring-1 ring-rose-200 disabled:opacity-50"
            >
              Try again
            </button>
          </div>
        )}
        {state.initialized ? (
          <Outlet />
        ) : !state.loadError ? (
          <div
            role="status"
            aria-live="polite"
            aria-busy="true"
            className="space-y-6 p-6"
          >
            <p className="text-sm font-medium text-slate-600">
              Loading your records…
            </p>
            <div
              aria-hidden="true"
              className="space-y-6 animate-pulse motion-reduce:animate-none"
            >
              <div className="h-24 rounded-2xl bg-slate-200/70" />
              <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
                {Array.from({ length: 4 }, (_, index) => (
                  <div
                    key={index}
                    className="h-28 rounded-2xl bg-slate-200/70"
                  />
                ))}
              </div>
            </div>
          </div>
        ) : null}
      </main>
    </div>
  );
}
