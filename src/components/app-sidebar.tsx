import {
  Home,
  LayoutDashboard,
  LogOut,
  MapPin,
  Settings,
  UserCheck,
  Users,
} from "lucide-react";
import { Link, useLocation } from "@tanstack/react-router";
import { useStore } from "@/lib/store";

type NavItem = {
  to: string;
  label: string;
  icon: React.ReactNode;
};

export function AppSidebar() {
  const { state, logout } = useStore();
  const location = useLocation();
  const session = state.session;

  if (!session) return null;

  const isAdmin = session.role === "Admin";

  const navItems: NavItem[] = isAdmin
    ? [
        { to: "/dashboard", label: "Overview", icon: <LayoutDashboard className="h-4 w-4" /> },
        { to: "/members", label: "Members", icon: <Users className="h-4 w-4" /> },
        { to: "/puroks", label: "Puroks", icon: <MapPin className="h-4 w-4" /> },
        { to: "/users", label: "Users", icon: <UserCheck className="h-4 w-4" /> },
        { to: "/settings", label: "Settings", icon: <Settings className="h-4 w-4" /> },
      ]
    : [
        { to: "/my-dashboard", label: "My Dashboard", icon: <UserCheck className="h-4 w-4" /> },
        { to: "/members", label: "Members", icon: <Users className="h-4 w-4" /> },
      ];

  return (
    <aside className="hidden w-60 shrink-0 flex-col border-r border-slate-200 bg-white md:flex">
      {/* Branding */}
      <div className="flex items-center gap-2.5 border-b border-slate-200 px-5 py-4">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-900 text-white">
          <Home className="h-4.5 w-4.5" />
        </div>
        <div>
          <p className="text-sm font-bold leading-tight tracking-tight">Barangay RMS</p>
          <p className="text-[11px] text-slate-500">Resident Management</p>
        </div>
      </div>

      {/* Nav links */}
      <nav className="flex-1 space-y-0.5 p-3 text-sm">
        {navItems.map((item) => {
          const isActive = location.pathname === item.to ||
            (item.to !== "/" && location.pathname.startsWith(item.to));
          return (
            <Link
              key={item.to}
              to={item.to}
              className={`flex w-full items-center gap-2.5 rounded-lg px-3 py-2.5 font-medium transition-all duration-150 ${
                isActive
                  ? "bg-slate-900 text-white shadow-sm"
                  : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
              }`}
            >
              {item.icon}
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* User chip */}
      <div className="border-t border-slate-200 p-3">
        <div className="flex items-center gap-2.5 rounded-xl bg-slate-50 px-3 py-2.5">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-slate-900 text-[11px] font-bold text-white">
            {session.displayName.charAt(0).toUpperCase()}
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-xs font-semibold text-slate-800">{session.displayName}</p>
            <p className="text-[10px] text-slate-500">{session.role}</p>
          </div>
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
