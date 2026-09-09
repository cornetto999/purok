import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState, useEffect, useMemo } from "react";
import {
  AlertTriangle,
  Bot,
  CheckCircle2,
  Clock,
  Copy,
  Filter,
  KeyRound,
  Lock,
  RefreshCw,
  Search,
  Shield,
  ShieldAlert,
  ShieldCheck,
  Unlock,
  Users,
  Wifi,
} from "lucide-react";
import { useStore } from "@/lib/store";
import { supabase } from "@/lib/supabase";
import type { SecurityLog, SecurityEventType, User } from "@/lib/types";

export const Route = createFileRoute("/_authenticated/security")({
  head: () => ({
    meta: [
      { title: "Security Monitor — Barangay RMS" },
      {
        name: "description",
        content: "Real-time threat observability and account lockout monitoring.",
      },
    ],
  }),
  component: SecurityMonitorPage,
});

function formatRelativeTime(dateString: string): string {
  const diffSecs = Math.max(
    0,
    Math.floor((Date.now() - new Date(dateString).getTime()) / 1000),
  );

  if (diffSecs < 10) return "just now";
  if (diffSecs < 60) return `${diffSecs}s ago`;
  const diffMins = Math.floor(diffSecs / 60);
  if (diffMins < 60) return `${diffMins}m ago`;
  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `${diffHours}h ago`;
  const diffDays = Math.floor(diffHours / 24);
  return `${diffDays}d ago`;
}

function SecurityMonitorPage() {
  const store = useStore();
  const { state } = store;
  const navigate = useNavigate();
  const session = state.session!;

  const [logs, setLogs] = useState<SecurityLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [query, setQuery] = useState("");
  const [eventTypeFilter, setEventTypeFilter] = useState<string>("ALL");
  const [copiedIp, setCopiedIp] = useState<string | null>(null);
  const [unlockingId, setUnlockingId] = useState<number | null>(null);
  const [newLiveEvent, setNewLiveEvent] = useState<SecurityLog | null>(null);

  // Admin access guard
  useEffect(() => {
    if (session.role !== "Admin") {
      void navigate({ to: "/my-dashboard" });
    }
  }, [session.role, navigate]);

  // Initial fetch of security logs
  const fetchLogs = async () => {
    try {
      const { data, error } = await supabase
        .from("security_logs")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(150);

      if (!error && data) {
        setLogs(data as SecurityLog[]);
      }
    } finally {
      setLoading(false);
    }
  };

  // Real-Time Subscription to Supabase Realtime
  useEffect(() => {
    void fetchLogs();

    const channel = supabase
      .channel("admin-security-monitor-channel")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "security_logs",
        },
        (payload) => {
          const newLog = payload.new as SecurityLog;
          setLogs((prev) => [newLog, ...prev]);
          setNewLiveEvent(newLog);

          // Clear notification highlight after 4 seconds
          setTimeout(() => {
            setNewLiveEvent((curr) => (curr?.id === newLog.id ? null : curr));
          }, 4000);
        },
      )
      .subscribe((status) => {
        setIsSubscribed(status === "SUBSCRIBED");
      });

    return () => {
      void supabase.removeChannel(channel);
    };
  }, []);

  // Currently locked accounts in system
  const lockedUsers = useMemo(() => {
    const now = new Date().getTime();
    return state.users.filter((u) => {
      if (!u.account_locked_until) return false;
      return new Date(u.account_locked_until).getTime() > now;
    });
  }, [state.users]);

  // Unlock user account action
  const handleUnlockUser = async (userId: number, username: string) => {
    if (!confirm(`Unlock account for user "${username}" immediately?`)) return;
    setUnlockingId(userId);
    try {
      const res = await fetch("/api/security/unlock", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId }),
      });
      const data = await res.json();
      if (data.success) {
        await store.refreshData();
      } else {
        alert(data.error || "Failed to unlock account.");
      }
    } catch {
      alert("Failed to reach server.");
    } finally {
      setUnlockingId(null);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedIp(text);
    setTimeout(() => setCopiedIp(null), 2000);
  };

  // KPI calculations
  const stats = useMemo(() => {
    let failedLogins = 0;
    let lockedEvents = 0;
    let captchaFails = 0;

    for (const log of logs) {
      if (log.event_type === "FAILED_LOGIN") failedLogins++;
      else if (log.event_type === "ACCOUNT_LOCKED") lockedEvents++;
      else if (log.event_type === "CAPTCHA_FAILED") captchaFails++;
    }

    return {
      total: logs.length,
      failedLogins,
      lockedEvents,
      captchaFails,
    };
  }, [logs]);

  // Filtered log entries
  const filteredLogs = useMemo(() => {
    const q = query.trim().toLowerCase();
    return logs.filter((log) => {
      if (eventTypeFilter !== "ALL" && log.event_type !== eventTypeFilter) {
        return false;
      }
      if (q) {
        const text = `${log.attempted_username} ${log.ip_address} ${log.event_type}`.toLowerCase();
        if (!text.includes(q)) return false;
      }
      return true;
    });
  }, [logs, query, eventTypeFilter]);

  return (
    <>
      {/* Header */}
      <header className="border-b border-slate-200 bg-white px-6 py-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-bold text-slate-900">
                Security Monitor & Threat Observability
              </h1>
              <span className="rounded-full bg-slate-900 px-2 py-0.5 text-[10px] font-bold text-white uppercase tracking-wide">
                Admin Exclusive
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Real-time audit stream tracking failed authentications, bot mitigation, and account lockouts.
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            {/* Realtime connection badge */}
            <div
              className={`flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ring-1 ring-inset ${
                isSubscribed
                  ? "bg-emerald-50 text-emerald-700 ring-emerald-600/20"
                  : "bg-amber-50 text-amber-700 ring-amber-600/20"
              }`}
            >
              <span
                className={`h-2 w-2 rounded-full ${
                  isSubscribed ? "bg-emerald-500 animate-ping" : "bg-amber-500"
                }`}
              />
              <Wifi className="h-3.5 w-3.5" />
              {isSubscribed ? "Live WebSocket Connected" : "Connecting…"}
            </div>

            <button
              onClick={() => {
                void fetchLogs();
                void store.refreshData();
              }}
              className="flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-50 hover:text-slate-900"
              title="Refresh security log stream"
            >
              <RefreshCw className="h-3.5 w-3.5" /> Refresh
            </button>
          </div>
        </div>
      </header>

      <div className="space-y-6 p-6">
        {/* Live Incoming Alert Banner */}
        {newLiveEvent && (
          <div className="rounded-xl border border-indigo-200 bg-gradient-to-r from-indigo-50 to-blue-50 p-4 shadow-sm animate-in slide-in-from-top-2 duration-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <span className="relative flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-indigo-600" />
                </span>
                <p className="text-xs font-bold text-indigo-900">
                  New Security Event Captured in Real-Time:
                </p>
                <span className="rounded bg-indigo-100 px-2 py-0.5 text-xs font-mono font-bold text-indigo-800">
                  {newLiveEvent.event_type}
                </span>
                <span className="text-xs text-indigo-700">
                  Target: <strong className="text-indigo-950">{newLiveEvent.attempted_username}</strong> from IP {newLiveEvent.ip_address}
                </span>
              </div>
              <span className="text-[11px] font-medium text-indigo-500">Live stream</span>
            </div>
          </div>
        )}

        {/* Security KPI Stats */}
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Total Security Logs
              </span>
              <Shield className="h-4 w-4 text-indigo-600" />
            </div>
            <p className="mt-2 text-2xl font-bold text-slate-900">{stats.total}</p>
            <p className="text-[11px] text-slate-400 mt-0.5">Recorded attempts</p>
          </div>

          <div className="rounded-xl border border-red-200 bg-red-50/50 p-4 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-red-700 uppercase tracking-wider">
                Locked Accounts
              </span>
              <ShieldAlert className="h-4 w-4 text-red-600" />
            </div>
            <p className="mt-2 text-2xl font-bold text-red-950">{lockedUsers.length}</p>
            <p className="text-[11px] text-red-600 mt-0.5 font-medium">
              {stats.lockedEvents} lockout events total
            </p>
          </div>

          <div className="rounded-xl border border-amber-200 bg-amber-50/50 p-4 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-amber-700 uppercase tracking-wider">
                Failed Password Logins
              </span>
              <AlertTriangle className="h-4 w-4 text-amber-600" />
            </div>
            <p className="mt-2 text-2xl font-bold text-amber-950">{stats.failedLogins}</p>
            <p className="text-[11px] text-amber-700 mt-0.5 font-medium">Under 4 attempts</p>
          </div>

          <div className="rounded-xl border border-purple-200 bg-purple-50/50 p-4 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-purple-700 uppercase tracking-wider">
                Bot / Captcha Blocks
              </span>
              <Bot className="h-4 w-4 text-purple-600" />
            </div>
            <p className="mt-2 text-2xl font-bold text-purple-950">{stats.captchaFails}</p>
            <p className="text-[11px] text-purple-700 mt-0.5 font-medium">reCAPTCHA v2 failures</p>
          </div>
        </div>

        {/* Active Locked Accounts Section (if any) */}
        {lockedUsers.length > 0 && (
          <div className="rounded-2xl border border-red-300 bg-red-50/80 p-5 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ShieldAlert className="h-5 w-5 text-red-600" />
                <h3 className="text-sm font-bold text-red-950 uppercase tracking-wide">
                  Currently Locked Accounts ({lockedUsers.length})
                </h3>
              </div>
              <span className="text-xs font-medium text-red-700">
                15-Minute Rate Limit Active
              </span>
            </div>

            <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2 lg:grid-cols-3">
              {lockedUsers.map((u) => (
                <div
                  key={u.id}
                  className="flex items-center justify-between rounded-xl border border-red-200 bg-white p-3 shadow-xs"
                >
                  <div className="space-y-0.5">
                    <p className="font-bold text-slate-900 text-xs">{u.displayName}</p>
                    <p className="font-mono text-[11px] text-slate-500">@{u.username}</p>
                    <p className="text-[10px] text-red-600 flex items-center gap-1 font-medium">
                      <Clock className="h-3 w-3" />
                      Locked until: {new Date(u.account_locked_until!).toLocaleTimeString()}
                    </p>
                  </div>
                  <button
                    disabled={unlockingId === u.id}
                    onClick={() => handleUnlockUser(u.id, u.username)}
                    className="flex items-center gap-1 rounded-lg bg-red-600 px-2.5 py-1.5 text-xs font-bold text-white shadow-xs hover:bg-red-700 disabled:opacity-50"
                  >
                    <Unlock className="h-3 w-3" />
                    {unlockingId === u.id ? "Unlocking…" : "Unlock"}
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Filter Controls & Search */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative flex-1 max-w-md">
            <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Filter by username, IP address, or event…"
              className="w-full rounded-xl border border-slate-200 bg-white pl-9 pr-4 py-2 text-xs outline-none transition focus:border-indigo-600 focus:ring-2 focus:ring-indigo-100"
            />
          </div>

          <div className="flex flex-wrap items-center gap-1.5">
            <button
              onClick={() => setEventTypeFilter("ALL")}
              className={`rounded-lg px-3 py-1.5 text-xs font-bold transition ${
                eventTypeFilter === "ALL"
                  ? "bg-slate-900 text-white shadow-xs"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              All Events ({logs.length})
            </button>
            <button
              onClick={() => setEventTypeFilter("ACCOUNT_LOCKED")}
              className={`flex items-center gap-1 rounded-lg px-3 py-1.5 text-xs font-bold transition ${
                eventTypeFilter === "ACCOUNT_LOCKED"
                  ? "bg-red-600 text-white shadow-xs"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              <ShieldAlert className="h-3 w-3" />
              Locked ({stats.lockedEvents})
            </button>
            <button
              onClick={() => setEventTypeFilter("FAILED_LOGIN")}
              className={`flex items-center gap-1 rounded-lg px-3 py-1.5 text-xs font-bold transition ${
                eventTypeFilter === "FAILED_LOGIN"
                  ? "bg-amber-600 text-white shadow-xs"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              <AlertTriangle className="h-3 w-3" />
              Failed Logins ({stats.failedLogins})
            </button>
            <button
              onClick={() => setEventTypeFilter("CAPTCHA_FAILED")}
              className={`flex items-center gap-1 rounded-lg px-3 py-1.5 text-xs font-bold transition ${
                eventTypeFilter === "CAPTCHA_FAILED"
                  ? "bg-purple-600 text-white shadow-xs"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              <Bot className="h-3 w-3" />
              Captcha Failed ({stats.captchaFails})
            </button>
          </div>
        </div>

        {/* Real-Time Security Logs Table */}
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50/80 text-xs font-bold uppercase tracking-wider text-slate-500">
                  <th className="px-4 py-3">Timestamp</th>
                  <th className="px-4 py-3">Event Type</th>
                  <th className="px-4 py-3">Target Username</th>
                  <th className="px-4 py-3">Source IP Address</th>
                  <th className="px-4 py-3 text-right">Target Account Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredLogs.map((log) => {
                  const targetUser = state.users.find(
                    (u) =>
                      u.username.toLowerCase() ===
                      log.attempted_username.toLowerCase(),
                  );
                  const isLockedNow =
                    targetUser?.account_locked_until &&
                    new Date(targetUser.account_locked_until).getTime() >
                      Date.now();

                  return (
                    <tr
                      key={log.id}
                      className={`hover:bg-slate-50/80 transition-colors ${
                        newLiveEvent?.id === log.id
                          ? "bg-indigo-50/60 animate-pulse"
                          : ""
                      }`}
                    >
                      {/* Timestamp */}
                      <td className="whitespace-nowrap px-4 py-3">
                        <div className="font-medium text-slate-900 text-xs">
                          {new Date(log.created_at).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                            second: "2-digit",
                          })}
                        </div>
                        <div className="text-[11px] text-slate-400">
                          {new Date(log.created_at).toLocaleDateString()} ·{" "}
                          <span className="font-semibold text-slate-600">
                            {formatRelativeTime(log.created_at)}
                          </span>
                        </div>
                      </td>

                      {/* Event Type Badge */}
                      <td className="whitespace-nowrap px-4 py-3">
                        {log.event_type === "ACCOUNT_LOCKED" && (
                          <span className="inline-flex items-center gap-1.5 rounded-full bg-red-50 px-2.5 py-1 text-xs font-bold text-red-700 ring-1 ring-inset ring-red-600/30">
                            <ShieldAlert className="h-3.5 w-3.5 text-red-600" />
                            ACCOUNT LOCKED
                          </span>
                        )}
                        {log.event_type === "FAILED_LOGIN" && (
                          <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-2.5 py-1 text-xs font-bold text-amber-800 ring-1 ring-inset ring-amber-600/30">
                            <AlertTriangle className="h-3.5 w-3.5 text-amber-600" />
                            FAILED LOGIN
                          </span>
                        )}
                        {log.event_type === "CAPTCHA_FAILED" && (
                          <span className="inline-flex items-center gap-1.5 rounded-full bg-purple-50 px-2.5 py-1 text-xs font-bold text-purple-700 ring-1 ring-inset ring-purple-600/30">
                            <Bot className="h-3.5 w-3.5 text-purple-600" />
                            CAPTCHA FAILED
                          </span>
                        )}
                      </td>

                      {/* Target Username */}
                      <td className="px-4 py-3">
                        <div className="font-mono text-xs font-bold text-slate-900">
                          {log.attempted_username || "—"}
                        </div>
                        <div className="text-[11px] text-slate-400">
                          {targetUser ? (
                            <span className="text-emerald-700 font-medium flex items-center gap-1">
                              <CheckCircle2 className="h-3 w-3" />
                              Registered {targetUser.role}
                            </span>
                          ) : (
                            <span className="text-slate-400 italic">
                              Unregistered username
                            </span>
                          )}
                        </div>
                      </td>

                      {/* IP Address */}
                      <td className="whitespace-nowrap px-4 py-3">
                        <div className="flex items-center gap-1.5">
                          <code className="rounded bg-slate-100 px-2 py-0.5 text-xs font-mono text-slate-700">
                            {log.ip_address}
                          </code>
                          <button
                            onClick={() => copyToClipboard(log.ip_address)}
                            className="rounded p-1 text-slate-400 hover:bg-slate-200 hover:text-slate-700"
                            title="Copy IP"
                          >
                            <Copy className="h-3 w-3" />
                          </button>
                          {copiedIp === log.ip_address && (
                            <span className="text-[10px] text-emerald-600 font-bold">
                              Copied!
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Target Account Status & Actions */}
                      <td className="whitespace-nowrap px-4 py-3 text-right">
                        {isLockedNow ? (
                          <div className="inline-flex items-center gap-2">
                            <span className="rounded-full bg-red-100 px-2 py-0.5 text-[10px] font-bold text-red-800">
                              Locked
                            </span>
                            {targetUser && (
                              <button
                                disabled={unlockingId === targetUser.id}
                                onClick={() =>
                                  handleUnlockUser(
                                    targetUser.id,
                                    targetUser.username,
                                  )
                                }
                                className="inline-flex items-center gap-1 rounded-md bg-red-600 px-2.5 py-1 text-xs font-bold text-white shadow-xs hover:bg-red-700 disabled:opacity-50"
                              >
                                <Unlock className="h-3 w-3" /> Unlock
                              </button>
                            )}
                          </div>
                        ) : targetUser ? (
                          <span className="text-xs text-slate-500 font-medium">
                            Attempts: {targetUser.failed_login_attempts || 0} / 4
                          </span>
                        ) : (
                          <span className="text-xs text-slate-400">—</span>
                        )}
                      </td>
                    </tr>
                  );
                })}

                {filteredLogs.length === 0 && !loading && (
                  <tr>
                    <td colSpan={5} className="py-12 text-center text-slate-400">
                      <ShieldCheck className="mx-auto h-8 w-8 text-slate-300 mb-2" />
                      <p className="text-sm font-semibold text-slate-700">
                        No security incidents found
                      </p>
                      <p className="text-xs text-slate-400 mt-0.5">
                        {query || eventTypeFilter !== "ALL"
                          ? "No logs match the selected filter."
                          : "No suspicious or failed authentication attempts recorded yet."}
                      </p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </>
  );
}
