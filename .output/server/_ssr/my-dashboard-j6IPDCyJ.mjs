import { o as __toESM } from "../_runtime.mjs";
import { n as require_jsx_runtime, r as require_react } from "../_libs/react+tanstack__react-query.mjs";
import { r as useStore } from "./store-D6_VlWDf.mjs";
import { _ as useNavigate } from "../_libs/@tanstack/react-router+[...].mjs";
import { A as Accessibility, b as House, f as Plus, h as LogOut, m as MapPin, n as Users, x as Flag } from "../_libs/lucide-react.mjs";
import { t as StatCard } from "./stat-card-Bf1ozPwh.mjs";
import { n as memberFullName, t as MemberFormModal } from "./member-form-modal-BmtZKKRt.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/my-dashboard-j6IPDCyJ.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function sectorBadges(m) {
	const badges = [];
	if (m.sc) badges.push({
		label: "SC",
		cls: "bg-blue-100 text-blue-800 ring-blue-600/20"
	});
	if (m.pwd) badges.push({
		label: "PWD",
		cls: "bg-green-100 text-green-800 ring-green-600/20"
	});
	if (m.ip) badges.push({
		label: "IP",
		cls: "bg-orange-100 text-orange-800 ring-orange-600/20"
	});
	return badges;
}
function MyDashboardPage() {
	const store = useStore();
	const { state, logout } = store;
	const navigate = useNavigate();
	const session = state.session;
	const [showAddMember, setShowAddMember] = (0, import_react.useState)(false);
	(0, import_react.useEffect)(() => {
		if (session.role === "Admin") navigate({ to: "/dashboard" });
	}, [session.role, navigate]);
	const isPurokLeader = session.role === "Purok Leader";
	const isHouseholdLeader = session.role === "Household Leader";
	const scopedHouseholds = (0, import_react.useMemo)(() => {
		if (isPurokLeader) return state.households.filter((h) => h.purokId === session.linkedEntityId);
		if (isHouseholdLeader) return state.households.filter((h) => h.id === session.linkedEntityId);
		return [];
	}, [
		state.households,
		isPurokLeader,
		isHouseholdLeader,
		session.linkedEntityId
	]);
	const scopedMembers = (0, import_react.useMemo)(() => {
		const hhIds = new Set(scopedHouseholds.map((h) => h.id));
		return state.members.filter((m) => hhIds.has(m.householdId));
	}, [state.members, scopedHouseholds]);
	const scopeLabel = (0, import_react.useMemo)(() => {
		if (isPurokLeader) return state.puroks.find((pk) => pk.id === session.linkedEntityId)?.name ?? "Purok";
		return state.households.find((hh) => hh.id === session.linkedEntityId)?.address ?? "Household";
	}, [
		isPurokLeader,
		state.puroks,
		state.households,
		session.linkedEntityId
	]);
	const scCount = scopedMembers.filter((m) => m.sc).length;
	const pwdCount = scopedMembers.filter((m) => m.pwd).length;
	const ipCount = scopedMembers.filter((m) => m.ip).length;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", {
			className: "border-b border-slate-200 bg-white px-6 py-4",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
				className: "text-lg font-semibold",
				children: "My Dashboard"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
				className: "text-sm text-slate-500",
				children: [
					"Signed in as ",
					session.role,
					" · ",
					scopeLabel
				]
			})]
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "space-y-6 p-6",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-center justify-between rounded-xl border border-emerald-200 bg-gradient-to-r from-emerald-50 to-teal-50 px-6 py-4",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex items-center gap-3",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-600 text-white shadow-sm",
							children: isPurokLeader ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(MapPin, { className: "h-5 w-5" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(House, { className: "h-5 w-5" })
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "font-semibold text-emerald-900",
							children: session.displayName
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
							className: "text-xs text-emerald-700",
							children: [
								session.role,
								" · ",
								scopeLabel
							]
						})] })]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex items-center gap-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
							onClick: () => setShowAddMember(true),
							className: "flex items-center gap-1.5 rounded-lg bg-emerald-600 px-3 py-2 text-xs font-semibold text-white transition-colors hover:bg-emerald-700",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Plus, { className: "h-3.5 w-3.5" }), " Add Member"]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
							onClick: logout,
							className: "flex items-center gap-1.5 rounded-lg border border-emerald-300 px-3 py-2 text-xs font-medium text-emerald-800 transition-colors hover:bg-emerald-100",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(LogOut, { className: "h-3.5 w-3.5" }), " Sign Out"]
						})]
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "grid grid-cols-2 gap-4 sm:grid-cols-4",
					children: [
						isPurokLeader && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatCard, {
							icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(House, { className: "h-5 w-5 text-indigo-600" }),
							label: "Households",
							value: scopedHouseholds.length
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatCard, {
							icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Users, { className: "h-5 w-5 text-sky-600" }),
							label: "Total Members",
							value: scopedMembers.length
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatCard, {
							icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Flag, { className: "h-5 w-5 text-blue-600" }),
							label: "Senior Citizens",
							value: scCount
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatCard, {
							icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Accessibility, { className: "h-5 w-5 text-green-600" }),
							label: "PWD",
							value: pwdCount
						}),
						isHouseholdLeader && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatCard, {
							icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Users, { className: "h-5 w-5 text-orange-500" }),
							label: "Indigenous (IP)",
							value: ipCount
						})
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h2", {
					className: "text-sm font-semibold text-slate-700",
					children: [
						"Members (",
						scopedMembers.length,
						")"
					]
				}),
				isPurokLeader && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "space-y-4",
					children: [scopedHouseholds.map((h) => {
						const hMembers = state.members.filter((m) => m.householdId === h.id);
						return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex items-center justify-between border-b border-slate-100 bg-slate-50 px-4 py-3",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "text-sm font-semibold",
									children: h.householdLeaderName
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "ml-2 text-xs text-slate-500",
									children: h.address
								})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
									className: "rounded-full bg-slate-200 px-2 py-0.5 text-[10px] font-bold text-slate-600",
									children: [hMembers.length, " members"]
								})]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CompactMemberTable, { members: hMembers })]
						}, h.id);
					}), scopedHouseholds.length === 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "py-8 text-center text-sm text-slate-400",
						children: "No households found in this purok."
					})]
				}),
				isHouseholdLeader && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CompactMemberTable, { members: scopedMembers })
				})
			]
		}),
		showAddMember && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(MemberFormModal, {
			householdsData: scopedHouseholds,
			defaultHouseholdId: isHouseholdLeader ? session.linkedEntityId ?? void 0 : void 0,
			onSave: (data) => {
				store.addMember(data);
				setShowAddMember(false);
			},
			onClose: () => setShowAddMember(false)
		})
	] });
}
function CompactMemberTable({ members }) {
	if (members.length === 0) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
		className: "px-4 py-6 text-center text-sm text-slate-400",
		children: "No members yet."
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "overflow-x-auto",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("table", {
			className: "w-full text-left text-sm",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("thead", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("tr", {
				className: "border-b border-slate-100 text-xs uppercase tracking-wide text-slate-500",
				children: [
					"Name",
					"PN",
					"Age",
					"Status",
					"Sectors",
					"Remarks"
				].map((h, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
					className: "px-4 py-2.5 font-semibold",
					children: h
				}, i))
			}) }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("tbody", { children: members.map((m) => {
				const badges = sectorBadges(m);
				return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", {
					className: "border-b border-slate-100 last:border-0 hover:bg-slate-50 transition-colors",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
							className: "whitespace-nowrap px-4 py-2.5 font-medium",
							children: memberFullName(m)
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
							className: "whitespace-nowrap px-4 py-2.5 text-slate-600",
							children: m.pn || "—"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
							className: "px-4 py-2.5 text-slate-600",
							children: m.age
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
							className: "px-4 py-2.5 text-slate-600",
							children: m.status
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
							className: "px-4 py-2.5",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex gap-1",
								children: [badges.length === 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "text-xs text-slate-300",
									children: "—"
								}), badges.map((b) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: `inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-semibold ring-1 ring-inset ${b.cls}`,
									children: b.label
								}, b.label))]
							})
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
							className: "max-w-[160px] truncate px-4 py-2.5 text-slate-500",
							children: m.remarks || /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "text-slate-300",
								children: "—"
							})
						})
					]
				}, m.id);
			}) })]
		})
	});
}
//#endregion
export { MyDashboardPage as component };
