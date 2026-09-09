import { n as require_jsx_runtime } from "../_libs/react+tanstack__react-query.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/stat-card-Bf1ozPwh.js
var import_jsx_runtime = require_jsx_runtime();
function StatCard({ icon, label, value, onClick, accent }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		onClick,
		className: `group relative flex items-center gap-4 overflow-hidden rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition-all duration-200 ${onClick ? "cursor-pointer hover:border-slate-300 hover:shadow-md hover:-translate-y-0.5" : ""}`,
		children: [
			accent && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "absolute left-0 top-0 h-full w-1 transition-all group-hover:w-1.5",
				style: { backgroundColor: accent }
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-slate-100 transition-colors group-hover:bg-slate-200",
				children: icon
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-2xl font-bold leading-none tracking-tight",
				children: value
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-1 text-sm text-slate-500",
				children: label
			})] })
		]
	});
}
//#endregion
export { StatCard as t };
