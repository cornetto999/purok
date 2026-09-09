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
          label: "Members",
          icon: <Users className="h-4 w-4" />,
        },
      ];

  return (
    <aside
      className={`hidden shrink-0 flex-col border-r border-slate-200 bg-white transition-[width] duration-200 md:flex ${collapsed ? "w-16" : "w-60"}`}
    >
      {/* Branding */}
      <div
        className={`flex items-center border-b border-slate-200 py-4 ${collapsed ? "justify-center px-2" : "gap-2.5 px-5"}`}
      >
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-900 text-white">
          <Home className="h-4.5 w-4.5" />
        </div>
        {!collapsed && (
          <>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-bold leading-tight tracking-tight">
                Barangay RMS
              </p>
              <p className="text-[11px] text-slate-500">Resident Management</p>
            </div>
            <button
              onClick={onToggle}
              title="Collapse sidebar"
              aria-label="Collapse sidebar"
              className="rounded-md p-1.5 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700"
            >
              <PanelLeftClose className="h-4 w-4" />
            </button>
          </>
        )}
      </div>

      {/* Nav links */}
      <nav
        className={`flex-1 space-y-0.5 text-sm ${collapsed ? "p-2" : "p-3"}`}
      >
        {collapsed && (
          <button
            onClick={onToggle}
            title="Open sidebar"
            aria-label="Open sidebar"
            className="mb-2 flex w-full items-center justify-center rounded-lg p-2.5 text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-900"
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
                  ? "bg-slate-900 text-white shadow-sm"
                  : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
              }`}
            >
              {item.icon}
              {!collapsed && item.label}
              {!collapsed && item.badge !== undefined && item.badge > 0 && (
                <span className="ml-auto rounded-full bg-amber-100 px-1.5 py-0.5 text-[10px] font-bold text-amber-800">
                  {item.badge.toLocaleString()}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* User chip */}
      <div className={`border-t border-slate-200 ${collapsed ? "p-2" : "p-3"}`}>
        <div
          className={`flex rounded-xl bg-slate-50 ${collapsed ? "flex-col items-center gap-1 p-2" : "items-center gap-2.5 px-3 py-2.5"}`}
        >
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-slate-900 text-[11px] font-bold text-white">
            {session.displayName.charAt(0).toUpperCase()}
          </div>
          {!collapsed && (
            <div className="min-w-0 flex-1">
              <p className="truncate text-xs font-semibold text-slate-800">
                {session.displayName}
              </p>
              <p className="text-[10px] text-slate-500">{session.role}</p>
            </div>
          )}
          <button
            onClick={logout}
            title="Sign out"
            className="rounded-md p-1.5 text-slate-400 transition-colors hover:bg-slate-200 hover:text-red-600"
          >
            <LogOut className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    </aside>
  );
}
