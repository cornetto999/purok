import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { useStore } from "@/lib/store";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Barangay RMS — Resident Management System" },
      { name: "description", content: "Administrative system for managing barangay resident records." },
    ],
  }),
  component: Index,
});

function Index() {
  const { state } = useStore();
  const navigate = useNavigate();

  useEffect(() => {
    if (!state.session) {
      void navigate({ to: "/login" });
    } else if (state.session.role === "Admin") {
      void navigate({ to: "/dashboard" });
    } else {
      void navigate({ to: "/my-dashboard" });
    }
  }, [state.session, navigate]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50">
      <div className="text-center">
        <div className="mb-4 h-8 w-8 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent mx-auto"></div>
        <p className="text-sm font-medium text-slate-600">Loading...</p>
      </div>
    </div>
  );
}
