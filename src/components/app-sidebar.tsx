import {
  Home,
  LayoutDashboard,
  LogOut,
  MapPin,
  Settings,
  ShieldAlert,
  ClipboardCheck,
  ChartNoAxesCombined,
  House,
  Menu,
  PanelLeftClose,
  UserCheck,
  Users,
} from "lucide-react";
import { Link, useLocation } from "@tanstack/react-router";
import { useStore } from "@/lib/store";

type NavItem = {
  to: string;
  label: string;
  icon: React.ReactNode;
  badge?: number;
};

export function AppSidebar({
  collapsed,
  onToggle,
}: {
  collapsed: boolean;
  onToggle: () => void;
}) {
  const { state, logout } = useStore();
  const location = useLocation();
  const session = state.session;

  if (!session) return null;

  const isAdmin = session.role === "Admin";
  const isPurokLeader = session.role === "Purok Leader";

  const navItems: NavItem[] = isAdmin
    ? [
        {
          to: "/dashboard",
          label: "Overview",
          icon: <LayoutDashboard className="h-4 w-4" />,
        },
        {
          to: "/members",
          label: "Members",
          icon: <Users className="h-4 w-4" />,
        },
        {
          to: "/households",
          label: "Household Leaders",
          icon: <House className="h-4 w-4" />,
        },
        {
          to: "/purok-leaders",
          label: "Purok Leaders",
          icon: <UserCheck className="h-4 w-4" />,
        },
        {
          to: "/duplicate-members",
          label: "Duplicate Review",
          icon: <ClipboardCheck className="h-4 w-4" />,
          badge: state.pendingDuplicates.length,
        },
        {
          to: "/reports",
          label: "Reports",
          icon: <ChartNoAxesCombined className="h-4 w-4" />,
        },
        {
          to: "/puroks",
          label: "Barangays",
          icon: <MapPin className="h-4 w-4" />,
        },
        {
          to: "/users",
          label: "Users",
          icon: <UserCheck className="h-4 w-4" />,
        },
        {
          to: "/security",
          label: "Security Monitor",
          icon: <ShieldAlert className="h-4 w-4" />,
        },
        {
          to: "/settings",
          label: "Settings",
          icon: <Settings className="h-4 w-4" />,
        },
      ]
    : [
        {
          to: "/my-dashboard",
          label: "My Dashboard",
          icon: <UserCheck className="h-4 w-4" />,
        },
        {
          to: "/members",
          label: isPurokLeader ? "Find Members" : "Members",
          icon: <Users className="h-4 w-4" />,
        },
        ...(isPurokLeader
          ? [
              {
                to: "/member-list",
                label: "My Member List",
                icon: <Users className="h-4 w-4" />,
              },
            ]
          : []),
      ];

  const initials = session.displayName
    .split(" ")
    .slice(0, 2)
    .map((w) => w.charAt(0))
    .join("")
    .toUpperCase();

  return (
    <aside
      className={`sticky top-0 hidden h-screen shrink-0 flex-col border-r border-slate-200/80 bg-white shadow-sm transition-[width] duration-200 md:flex ${collapsed ? "w-16" : "w-60"}`}
    >
      {/* Branding */}
      <div
        className={`flex items-center border-b border-slate-100 py-4 ${collapsed ? "justify-center px-2" : "gap-2.5 px-5"}`}
      >
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-600 to-violet-600 text-white shadow-md shadow-indigo-200">
          <Home className="h-4 w-4" />
        </div>
        {!collapsed && (
          <>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-bold leading-tight tracking-tight text-slate-800">
                Barangay RMS
              </p>
              <p className="text-[10px] font-medium text-slate-400 tracking-wide uppercase">
                Resident Management
              </p>
            </div>
            <button
              onClick={onToggle}
              title="Collapse sidebar"
              aria-label="Collapse sidebar"
              className="rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700"
            >
              <PanelLeftClose className="h-4 w-4" />
            </button>
          </>
        )}
      </div>

      {/* Nav links */}
      <nav
        className={`flex-1 overflow-y-auto text-sm ${collapsed ? "space-y-0.5 p-2" : "space-y-0.5 p-3"}`}
      >
        {collapsed && (
          <button
            onClick={onToggle}
            title="Open sidebar"
            aria-label="Open sidebar"
            className="mb-2 flex w-full items-center justify-center rounded-lg p-2.5 text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-900"
          >
            <Menu className="h-4 w-4" />
          </button>
        )}
        {navItems.map((item) => {
          const isActive =
            location.pathname === item.to ||
            (item.to !== "/" && location.pathname.startsWith(item.to));
          return (
            <Link
              key={item.to}
              to={item.to}
              title={collapsed ? item.label : undefined}
              aria-label={collapsed ? item.label : undefined}
              className={`flex w-full items-center rounded-lg py-2.5 font-medium transition-all duration-150 ${collapsed ? "justify-center px-2" : "gap-2.5 px-3"} ${
                isActive
                  ? "bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-sm shadow-indigo-200"
                  : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
              }`}
            >
              <span className={`shrink-0 transition-transform duration-150 ${isActive ? "scale-110" : ""}`}>
                {item.icon}
              </span>
              {!collapsed && (
                <span className="min-w-0 flex-1 truncate">{item.label}</span>
              )}
              {!collapsed && item.badge !== undefined && item.badge > 0 && (
                <span className="ml-auto shrink-0 rounded-full bg-amber-400 px-1.5 py-0.5 text-[10px] font-bold text-amber-900">
                  {item.badge.toLocaleString()}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* User chip */}
      <div className={`border-t border-slate-100 ${collapsed ? "p-2" : "p-3"}`}>
        <div
          className={`flex rounded-xl bg-gradient-to-br from-slate-50 to-slate-100/80 ${collapsed ? "flex-col items-center gap-1.5 p-2" : "items-center gap-2.5 px-3 py-2.5"}`}
        >
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-violet-600 text-[11px] font-bold text-white shadow-sm">
            {initials}
          </div>
          {!collapsed && (
            <div className="min-w-0 flex-1">
              <p className="truncate text-xs font-semibold text-slate-800">
                {session.displayName}
              </p>
              <p className="text-[10px] font-medium text-slate-400">{session.role}</p>
            </div>
          )}
          <button
            onClick={logout}
            title="Sign out"
            className="rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-white hover:text-red-500 hover:shadow-sm"
          >
            <LogOut className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    </aside>
  );
}
