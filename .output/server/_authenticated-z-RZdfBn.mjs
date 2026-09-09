import { o as __toESM } from "./_runtime.mjs";
import { n as require_jsx_runtime, r as require_react } from "./_libs/react+tanstack__react-query.mjs";
import { r as useStore } from "./_ssr/store-D6_VlWDf.mjs";
import { _ as useNavigate, f as Outlet, g as Link, l as useLocation } from "./_libs/@tanstack/react-router+[...].mjs";
import { b as House, h as LogOut, l as Settings, m as MapPin, n as Users, r as UserCheck, v as LayoutDashboard } from "./_libs/lucide-react.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/_authenticated-z-RZdfBn.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function AppSidebar() {
	const { state, logout } = useStore();
	const location = useLocation();
	const session = state.session;
	if (!session) return null;
	const navItems = session.role === "Admin" ? [
		{
			to: "/dashboard",
			label: "Overview",
			icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LayoutDashboard, { className: "h-4 w-4" })
		},
		{
			to: "/members",
			label: "Members",
			icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Users, { className: "h-4 w-4" })
		},
		{
			to: "/puroks",
			label: "Puroks",
			icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(MapPin, { className: "h-4 w-4" })
		},
		{
			to: "/users",
			label: "Users",
			icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(UserCheck, { className: "h-4 w-4" })
		},
		{
			to: "/settings",
			label: "Settings",
			icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Settings, { className: "h-4 w-4" })
		}
	] : [{
		to: "/my-dashboard",
		label: "My Dashboard",
		icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(UserCheck, { className: "h-4 w-4" })
	}, {
		to: "/members",
		label: "Members",
		icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Users, { className: "h-4 w-4" })
	}];
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("aside", {
		className: "hidden w-60 shrink-0 flex-col border-r border-slate-200 bg-white md:flex",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex items-center gap-2.5 border-b border-slate-200 px-5 py-4",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "flex h-9 w-9 items-center justify-center rounded-lg bg-slate-900 text-white",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(House, { className: "h-4.5 w-4.5" })
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-sm font-bold leading-tight tracking-tight",
					children: "Barangay RMS"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-[11px] text-slate-500",
					children: "Resident Management"
				})] })]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("nav", {
				className: "flex-1 space-y-0.5 p-3 text-sm",
				children: navItems.map((item) => {
					const isActive = location.pathname === item.to || item.to !== "/" && location.pathname.startsWith(item.to);
					return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
						to: item.to,
						className: `flex w-full items-center gap-2.5 rounded-lg px-3 py-2.5 font-medium transition-all duration-150 ${isActive ? "bg-slate-900 text-white shadow-sm" : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"}`,
						children: [item.icon, item.label]
					}, item.to);
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "border-t border-slate-200 p-3",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-center gap-2.5 rounded-xl bg-slate-50 px-3 py-2.5",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-slate-900 text-[11px] font-bold text-white",
							children: session.displayName.charAt(0).toUpperCase()
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "min-w-0 flex-1",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "truncate text-xs font-semibold text-slate-800",
								children: session.displayName
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-[10px] text-slate-500",
								children: session.role
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							onClick: logout,
							title: "Sign out",
							className: "rounded-md p-1.5 text-slate-400 transition-colors hover:bg-slate-200 hover:text-red-600",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LogOut, { className: "h-3.5 w-3.5" })
						})
					]
				})
			})
		]
	});
}
function AuthenticatedLayout() {
	const { state } = useStore();
	const navigate = useNavigate();
	(0, import_react.useEffect)(() => {
		if (!state.session) navigate({ to: "/login" });
	}, [state.session, navigate]);
	if (!state.session) return null;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex min-h-screen bg-slate-50 text-slate-900",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AppSidebar, {}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("main", {
			className: "flex-1 overflow-x-hidden",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Outlet, {})
		})]
	});
}
//#endregion
export { AuthenticatedLayout as component };
