import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState, useEffect, useRef } from "react";
import {
  AlertCircle,
  Clock,
  Eye,
  EyeOff,
  Home,
  Lock,
  LogIn,
  ShieldAlert,
  ShieldCheck,
} from "lucide-react";
import ReCAPTCHA from "react-google-recaptcha";
import { useStore } from "@/lib/store";

export const Route = createFileRoute("/login")({
  head: () => ({
    meta: [
      { title: "Sign In — Barangay RMS" },
      {
        name: "description",
        content: "Sign in to access the Barangay Resident Management System.",
      },
    ],
  }),
  component: LoginPage,
});

// Official Google reCAPTCHA v2 test site key as fallback for localhost dev
const DEFAULT_SITE_KEY = "6LeIxAcTAAAAAJcZVRqyHh71UMIEGNQ_MXjiZKhI";

function formatCountdown(totalSecs: number): string {
  const m = Math.floor(totalSecs / 60);
  const s = totalSecs % 60;
  return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
}

function LoginPage() {
  const { login, state } = useStore();
  const navigate = useNavigate();
  const recaptchaRef = useRef<ReCAPTCHA>(null);

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [captchaToken, setCaptchaToken] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Cooldown / Lockout countdown state
  const [lockedUntil, setLockedUntil] = useState<string | null>(null);
  const [countdownRemaining, setCountdownRemaining] = useState<number>(0);

  const siteKey =
    (typeof import.meta !== "undefined" &&
      import.meta.env &&
      import.meta.env.VITE_RECAPTCHA_SITE_KEY) ||
    DEFAULT_SITE_KEY;

  // If already logged in, redirect
  if (state.session) {
    const dest =
      state.session.role === "Admin" ? "/dashboard" : "/my-dashboard";
    void navigate({ to: dest });
    return null;
  }

  // Handle active countdown timer
  useEffect(() => {
    if (!lockedUntil) {
      setCountdownRemaining(0);
      return;
    }

    const calculateRemaining = () => {
      const remainingMs = new Date(lockedUntil).getTime() - Date.now();
      return Math.max(0, Math.ceil(remainingMs / 1000));
    };

    const initial = calculateRemaining();
    setCountdownRemaining(initial);

    if (initial <= 0) {
      setLockedUntil(null);
      return;
    }

    const timer = setInterval(() => {
      const remaining = calculateRemaining();
      setCountdownRemaining(remaining);
      if (remaining <= 0) {
        clearInterval(timer);
        setLockedUntil(null);
        setError("");
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [lockedUntil]);

  const isAccountLocked = countdownRemaining > 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isAccountLocked) return;

    if (!captchaToken) {
      setError("Please complete the reCAPTCHA verification to proceed.");
      return;
    }

    setError("");
    setLoading(true);

    try {
      const res = await login(username.trim(), password, captchaToken);

      if (res.success && res.session) {
        const dest =
          res.session.role === "Admin" ? "/dashboard" : "/my-dashboard";
        void navigate({ to: dest });
        return;
      }

      // Check if account is locked
      if (res.accountLocked && res.lockedUntil) {
        setLockedUntil(res.lockedUntil);
        setError(res.error || "Account locked due to multiple failed attempts.");
      } else {
        setError(res.error || "Invalid username or password.");
      }

      // Reset reCAPTCHA on failed attempt
      recaptchaRef.current?.reset();
      setCaptchaToken(null);
    } catch {
      setError("An unexpected authentication error occurred.");
      recaptchaRef.current?.reset();
      setCaptchaToken(null);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 p-4">
      {/* Background concentric ambient circles */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden opacity-[0.04]">
        {Array.from({ length: 20 }).map((_, i) => (
          <div
            key={i}
            className="absolute rounded-full border border-white"
            style={{
              width: `${80 + i * 60}px`,
              height: `${80 + i * 60}px`,
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
            }}
          />
        ))}
      </div>

      <div className="relative w-full max-w-md">
        <div className="overflow-hidden rounded-2xl bg-white shadow-2xl border border-slate-100">
          {/* Brand header */}
          <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 px-8 py-7 text-white">
            <div className="flex items-center justify-between mb-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/10 ring-1 ring-white/20 backdrop-blur shadow-inner">
                <Home className="h-6 w-6 text-indigo-200" />
              </div>
              <span className="flex items-center gap-1.5 rounded-full bg-emerald-500/20 px-3 py-1 text-xs font-semibold text-emerald-300 ring-1 ring-emerald-400/30">
                <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
                Protected Login
              </span>
            </div>
            <h1 className="text-xl font-bold tracking-tight text-white">
              Barangay RMS
            </h1>
            <p className="mt-1 text-xs text-indigo-200/80">
              Secure Resident Management System & RBAC Portal
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5 p-8">
            <div>
              <p className="text-lg font-bold text-slate-900">Sign In</p>
              <p className="text-xs text-slate-500">
                Enter your credentials to access your administrative role
              </p>
            </div>

            {/* Account Lockout Countdown Alert */}
            {isAccountLocked ? (
              <div className="rounded-xl border border-red-300 bg-red-50/90 p-4 text-red-900 shadow-sm animate-in fade-in zoom-in-95">
                <div className="flex items-start gap-3">
                  <ShieldAlert className="h-6 w-6 text-red-600 shrink-0 mt-0.5" />
                  <div className="space-y-1.5 flex-1">
                    <p className="text-xs font-bold uppercase tracking-wider text-red-800">
                      Security Lockout Triggered
                    </p>
                    <p className="text-xs text-red-800 font-medium leading-relaxed">
                      Account locked due to multiple failed attempts. Try again in:
                    </p>
                    <div className="flex items-center gap-2 pt-0.5">
                      <div className="flex items-center gap-1.5 rounded-lg bg-red-600 px-3 py-1 text-sm font-mono font-extrabold text-white shadow-xs">
                        <Clock className="h-4 w-4 animate-spin text-red-200" />
                        {formatCountdown(countdownRemaining)}
                      </div>
                      <span className="text-[11px] text-red-600 font-medium">
                        Cooldown in progress
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              error && (
                <div className="flex items-center gap-2.5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-xs font-medium text-red-700 shadow-xs">
                  <AlertCircle className="h-4 w-4 shrink-0 text-red-600" />
                  <span>{error}</span>
                </div>
              )
            )}

            {/* Username Input */}
            <div>
              <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-slate-600">
                Username
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="e.g. admin or rodrigo.alvarez"
                required
                disabled={isAccountLocked}
                autoFocus
                className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none transition-all focus:border-indigo-600 focus:ring-2 focus:ring-indigo-100 disabled:opacity-50"
              />
            </div>

            {/* Password Input */}
            <div>
              <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-slate-600">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  disabled={isAccountLocked}
                  className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 pr-10 text-sm outline-none transition-all focus:border-indigo-600 focus:ring-2 focus:ring-indigo-100 disabled:opacity-50"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 flex items-center pr-3 text-slate-400 hover:text-slate-600"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>

            {/* Google reCAPTCHA v2 Widget */}
            <div className="flex flex-col items-center justify-center pt-1 pb-1">
              <ReCAPTCHA
                ref={recaptchaRef}
                sitekey={siteKey}
                onChange={(token) => {
                  setCaptchaToken(token);
                  setError("");
                }}
                onExpired={() => setCaptchaToken(null)}
              />
              {!captchaToken && !isAccountLocked && (
                <p className="mt-1.5 text-[11px] text-slate-400 flex items-center gap-1">
                  <Lock className="h-3 w-3 text-slate-400" />
                  Please complete the reCAPTCHA to enable sign in
                </p>
              )}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading || !captchaToken || isAccountLocked}
              className={`flex w-full items-center justify-center gap-2 rounded-xl py-3 text-sm font-bold text-white shadow-md transition-all active:scale-[0.98] ${
                isAccountLocked
                  ? "bg-red-600 opacity-60 cursor-not-allowed"
                  : !captchaToken || loading
                    ? "bg-slate-400 opacity-70 cursor-not-allowed"
                    : "bg-slate-900 hover:bg-slate-800 hover:shadow-lg"
              }`}
            >
              {isAccountLocked ? (
                <>
                  <Lock className="h-4 w-4" />
                  Account Locked ({formatCountdown(countdownRemaining)})
                </>
              ) : (
                <>
                  <LogIn className="h-4 w-4" />
                  {loading ? "Verifying Credentials…" : "Sign In"}
                </>
              )}
            </button>

            {/* Demo Accounts Box */}
            <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-3.5 space-y-1.5 text-xs text-slate-600">
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                System Accounts for Testing
              </p>
              <div className="grid grid-cols-1 gap-1 text-[11px]">
                <p>
                  <span className="font-semibold text-slate-800">Admin:</span>{" "}
                  <code className="text-indigo-600 font-mono">admin</code> /{" "}
                  <code className="text-slate-600 font-mono">password123</code>
                </p>
                <p>
                  <span className="font-semibold text-slate-800">Purok Leader:</span>{" "}
                  <code className="text-indigo-600 font-mono">rodrigo.alvarez</code> /{" "}
                  <code className="text-slate-600 font-mono">purok123</code>
                </p>
              </div>
            </div>
          </form>
        </div>

        <p className="mt-4 text-center text-xs text-slate-400">
          Barangay Resident Management System · Enterprise Security Hardened
        </p>
      </div>
    </div>
  );
}
