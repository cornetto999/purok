import { o as __toESM } from "../_runtime.mjs";
import { n as require_jsx_runtime, r as require_react } from "../_libs/react+tanstack__react-query.mjs";
import { r as useStore } from "./store-D6_VlWDf.mjs";
import { _ as useNavigate } from "../_libs/@tanstack/react-router+[...].mjs";
import { m as MapPin, y as Landmark } from "../_libs/lucide-react.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/puroks-SrilcE2e.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function PuroksPage() {
	const { state } = useStore();
	const navigate = useNavigate();
	(0, import_react.useEffect)(() => {
		if (state.session?.role !== "Admin") navigate({ to: "/my-dashboard" });
	}, [state.session, navigate]);
	const { barangays, puroks, households, members } = state;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", {
		className: "border-b border-slate-200 bg-white px-6 py-4",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
			className: "text-lg font-semibold",
			children: "Puroks"
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "text-sm text-slate-500",
			children: "All puroks grouped by barangay"
		})]
	}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "space-y-8 p-6",
		children: barangays.map((b) => {
			const bPuroks = puroks.filter((p) => p.barangayId === b.id);
			return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mb-4 flex items-center gap-2",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Landmark, { className: "h-4 w-4 text-amber-600" }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
						className: "font-semibold text-slate-700",
						children: b.name
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
						className: "text-xs text-slate-400",
						children: ["— ", b.barangayCaptainName]
					})
				]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3",
				children: [bPuroks.map((p) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PurokCard, {
					purok: p,
					households,
					members,
					onViewMembers: () => void navigate({
						to: "/members",
						search: { purok: String(p.id) }
					})
				}, p.id)), bPuroks.length === 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "col-span-full py-8 text-center text-sm text-slate-400",
					children: "No puroks in this barangay."
				})]
			})] }, b.id);
		})
	})] });
}
function PurokCard({ purok, households: allHH, members: allMembers, onViewMembers }) {
	const stats = (0, import_react.useMemo)(() => {
		const pHH = allHH.filter((h) => h.purokId === purok.id);
		const pMembers = allMembers.filter((m) => pHH.some((h) => h.id === m.householdId));
		return {
			households: pHH.length,
			members: pMembers.length,
			sc: pMembers.filter((m) => m.sc).length,
			pwd: pMembers.filter((m) => m.pwd).length,
			ip: pMembers.filter((m) => m.ip).length
		};
	}, [
		purok.id,
		allHH,
		allMembers
	]);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "group rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition-all hover:border-slate-300 hover:shadow-md",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "mb-4 flex items-start justify-between",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-center gap-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(MapPin, { className: "h-4 w-4 text-indigo-500" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "font-semibold",
						children: purok.name
					})]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
					className: "mt-0.5 text-xs text-slate-500",
					children: ["Leader: ", purok.purokLeaderName]
				})] })
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mb-4 grid grid-cols-2 gap-2 text-center",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "rounded-lg bg-slate-50 py-2.5",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-lg font-bold",
						children: stats.households
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-[11px] text-slate-500",
						children: "Households"
					})]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "rounded-lg bg-slate-50 py-2.5",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-lg font-bold",
						children: stats.members
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-[11px] text-slate-500",
						children: "Members"
					})]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mb-4 flex flex-wrap gap-1.5",
				children: [
					stats.sc > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
						className: "inline-flex items-center rounded-full bg-blue-100 px-2 py-0.5 text-[11px] font-semibold text-blue-800 ring-1 ring-inset ring-blue-600/20",
						children: ["SC: ", stats.sc]
					}),
					stats.pwd > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
						className: "inline-flex items-center rounded-full bg-green-100 px-2 py-0.5 text-[11px] font-semibold text-green-800 ring-1 ring-inset ring-green-600/20",
						children: ["PWD: ", stats.pwd]
					}),
					stats.ip > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
						className: "inline-flex items-center rounded-full bg-orange-100 px-2 py-0.5 text-[11px] font-semibold text-orange-800 ring-1 ring-inset ring-orange-600/20",
						children: ["IP: ", stats.ip]
					}),
					stats.sc === 0 && stats.pwd === 0 && stats.ip === 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "text-xs text-slate-300",
						children: "No sector tags"
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
				onClick: onViewMembers,
				className: "w-full rounded-lg border border-slate-200 py-2 text-xs font-medium text-slate-600 transition-colors hover:bg-slate-50",
				children: "View Members →"
			})
		]
	});
}
//#endregion
export { PuroksPage as component };
