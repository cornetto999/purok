import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Home, LogIn, AlertCircle } from "lucide-react";
import { useStore } from "@/lib/store";

export const Route = createFileRoute("/login")({
  head: () => ({
    meta: [
      { title: "Sign In — Barangay RMS" },
      { name: "description", content: "Sign in to access the Barangay Resident Management System." },
    ],
  }),
  component: LoginPage,
});

function LoginPage() {
  const { login, state } = useStore();
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // If already logged in, redirect
  if (state.session) {
    const dest = state.session.role === "Admin" ? "/dashboard" : "/my-dashboard";
    void navigate({ to: dest });
    return null;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const session = await login(username, password);
      if (!session) {
        setError("Invalid username or password.");
        return;
      }
      const dest = session.role === "Admin" ? "/dashboard" : "/my-dashboard";
      void navigate({ to: dest });
    } catch {
      setError("An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-4">
      {/* Background concentric rings */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden opacity-[0.06]">
        {Array.from({ length: 20 }).map((_, i) => (
          <div
            key={i}
            className="absolute rounded-full border border-white"
            style={{
              width: `${60 + i * 50}px`,
              height: `${60 + i * 50}px`,
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
            }}
          />
        ))}
      </div>

      <div className="relative w-full max-w-md">
        <div className="overflow-hidden rounded-2xl bg-white shadow-2xl">
          {/* Brand header */}
          <div className="bg-gradient-to-r from-slate-900 to-slate-800 px-8 py-7 text-white">
            <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-white/10 ring-1 ring-white/20 backdrop-blur">
              <Home className="h-6 w-6" />
            </div>
            <h1 className="text-xl font-bold tracking-tight">Barangay RMS</h1>
            <p className="mt-1 text-sm text-slate-400">Resident Management System</p>
          </div>

          {/* Login form */}
          <form onSubmit={handleSubmit} className="space-y-5 p-8">
            <div>
              <p className="mb-1 text-lg font-semibold text-slate-800">Sign in</p>
              <p className="text-sm text-slate-500">Enter your credentials to access the system</p>
            </div>

            {error && (
              <div className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                <AlertCircle className="h-4 w-4 shrink-0" />
                {error}
              </div>
            )}

            <div>
              <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-500">Username</label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="e.g. admin"
                required
                autoFocus
                className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none transition focus:border-slate-600 focus:ring-2 focus:ring-slate-200"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-500">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none transition focus:border-slate-600 focus:ring-2 focus:ring-slate-200"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-slate-900 py-3 text-sm font-semibold text-white shadow-md transition-all hover:bg-slate-700 hover:shadow-lg active:scale-[0.98] disabled:opacity-60"
            >
              <LogIn className="h-4 w-4" />
              {loading ? "Signing in…" : "Sign In"}
            </button>

            {/* Demo credentials hint */}
            <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
              <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400 mb-2">Demo Accounts</p>
              <div className="space-y-1 text-xs text-slate-600">
                <p><span className="font-semibold">Admin:</span> admin / password123</p>
                <p><span className="font-semibold">Purok Leader:</span> rodrigo.alvarez / password123</p>
                <p><span className="font-semibold">Household Leader:</span> reyes.antonio / password123</p>
              </div>
            </div>
          </form>
        </div>

        <p className="mt-4 text-center text-xs text-slate-500">
          Barangay Resident Management System · Powered by Purok
        </p>
      </div>
    </div>
  );
}
