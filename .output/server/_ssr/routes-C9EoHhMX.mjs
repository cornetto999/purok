import { n as __toESM } from "../_runtime.mjs";
import { n as require_jsx_runtime, r as require_react } from "../_libs/react+tanstack__react-query.mjs";
import { a as Search, c as MapPin, d as LayoutDashboard, f as Landmark, h as Accessibility, i as Trash2, l as LogOut, m as Flag, n as Users, o as Plus, p as House, r as UserCheck, s as Pencil, t as X, u as LogIn } from "../_libs/lucide-react.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/routes-C9EoHhMX.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var barangays = [{
	id: 1,
	name: "Barangay San Isidro",
	barangayCaptainName: "Hon. Ricardo Mendoza"
}, {
	id: 2,
	name: "Barangay Santa Cruz",
	barangayCaptainName: "Hon. Josefina Aquino"
}];
var puroks = [
	{
		id: 1,
		barangayId: 1,
		name: "Purok 1 - Malinaw",
		purokLeaderName: "Rodrigo Alvarez"
	},
	{
		id: 2,
		barangayId: 1,
		name: "Purok 2 - Sampaguita",
		purokLeaderName: "Elena Domingo"
	},
	{
		id: 3,
		barangayId: 1,
		name: "Purok 3 - Kalayaan",
		purokLeaderName: "Marco Bautista"
	},
	{
		id: 4,
		barangayId: 2,
		name: "Purok 4 - Mabuhay",
		purokLeaderName: "Luz Fernandez"
	},
	{
		id: 5,
		barangayId: 2,
		name: "Purok 5 - Pag-asa",
		purokLeaderName: "Dario Ramos"
	}
];
var households = [
	{
		id: 101,
		purokId: 1,
		householdLeaderName: "Reyes, Antonio Cruz",
		address: "Blk 1 Lot 3, Malinaw St."
	},
	{
		id: 102,
		purokId: 1,
		householdLeaderName: "Santos, Maria Lopez",
		address: "Blk 2 Lot 7, Malinaw St."
	},
	{
		id: 103,
		purokId: 2,
		householdLeaderName: "Garcia, Jose Mendoza",
		address: "Lot 12, Sampaguita Ave."
	},
	{
		id: 104,
		purokId: 2,
		householdLeaderName: "Torres, Ana Reyes",
		address: "Lot 4, Sampaguita Ave."
	},
	{
		id: 105,
		purokId: 3,
		householdLeaderName: "Flores, Pedro Diaz",
		address: "Blk 5 Lot 1, Kalayaan Rd."
	},
	{
		id: 106,
		purokId: 3,
		householdLeaderName: "Ramos, Lucia Gomez",
		address: "Blk 5 Lot 9, Kalayaan Rd."
	},
	{
		id: 107,
		purokId: 4,
		householdLeaderName: "Cruz, Miguel Santos",
		address: "Lot 21, Mabuhay St."
	},
	{
		id: 108,
		purokId: 4,
		householdLeaderName: "Dela Peña, Rosa Luna",
		address: "Lot 8, Mabuhay St."
	},
	{
		id: 109,
		purokId: 5,
		householdLeaderName: "Navarro, Juan Ortiz",
		address: "Blk 3 Lot 2, Pag-asa Ext."
	},
	{
		id: 110,
		purokId: 5,
		householdLeaderName: "Villanueva, Carmen Solis",
		address: "Blk 4 Lot 6, Pag-asa Ext."
	}
];
var members = [
	{
		id: 1,
		householdId: 101,
		fullName: "Reyes, Antonio Cruz",
		pn: "0001-A",
		age: 68,
		religion: "Roman Catholic",
		civilStatus: "Married",
		isSC: true,
		isPWD: false,
		isIP: false,
		remarks: "Household leader"
	},
	{
		id: 2,
		householdId: 101,
		fullName: "Reyes, Beatriz Luna",
		pn: "0001-B",
		age: 65,
		religion: "Roman Catholic",
		civilStatus: "Married",
		isSC: true,
		isPWD: false,
		isIP: false,
		remarks: ""
	},
	{
		id: 3,
		householdId: 101,
		fullName: "Reyes, Carlo Cruz",
		pn: "0002-A",
		age: 34,
		religion: "Roman Catholic",
		civilStatus: "Single",
		isSC: false,
		isPWD: false,
		isIP: false,
		remarks: "Works in Manila"
	},
	{
		id: 4,
		householdId: 102,
		fullName: "Santos, Maria Lopez",
		pn: "0003-A",
		age: 45,
		religion: "Iglesia ni Cristo",
		civilStatus: "Widowed",
		isSC: false,
		isPWD: false,
		isIP: false,
		remarks: "Household leader"
	},
	{
		id: 5,
		householdId: 102,
		fullName: "Santos, Kevin Lopez",
		pn: "0004-A",
		age: 19,
		religion: "Iglesia ni Cristo",
		civilStatus: "Single",
		isSC: false,
		isPWD: false,
		isIP: false,
		remarks: "Student"
	},
	{
		id: 6,
		householdId: 103,
		fullName: "Garcia, Jose Mendoza",
		pn: "0005-A",
		age: 52,
		religion: "Roman Catholic",
		civilStatus: "Married",
		isSC: false,
		isPWD: true,
		isIP: false,
		remarks: "Household leader; mobility aid"
	},
	{
		id: 7,
		householdId: 103,
		fullName: "Garcia, Norma Diaz",
		pn: "0005-B",
		age: 49,
		religion: "Roman Catholic",
		civilStatus: "Married",
		isSC: false,
		isPWD: false,
		isIP: false,
		remarks: ""
	},
	{
		id: 8,
		householdId: 103,
		fullName: "Garcia, Liza Mendoza",
		pn: "0006-A",
		age: 22,
		religion: "Roman Catholic",
		civilStatus: "Single",
		isSC: false,
		isPWD: false,
		isIP: false,
		remarks: "Newly registered voter"
	},
	{
		id: 9,
		householdId: 104,
		fullName: "Torres, Ana Reyes",
		pn: "0007-A",
		age: 71,
		religion: "Born Again Christian",
		civilStatus: "Widowed",
		isSC: true,
		isPWD: true,
		isIP: false,
		remarks: "Household leader; bedridden spouse cared for"
	},
	{
		id: 10,
		householdId: 104,
		fullName: "Torres, Paolo Reyes",
		pn: "0008-A",
		age: 28,
		religion: "Born Again Christian",
		civilStatus: "Single",
		isSC: false,
		isPWD: false,
		isIP: true,
		remarks: "Aeta community"
	},
	{
		id: 11,
		householdId: 105,
		fullName: "Flores, Pedro Diaz",
		pn: "0009-A",
		age: 61,
		religion: "Roman Catholic",
		civilStatus: "Married",
		isSC: true,
		isPWD: false,
		isIP: false,
		remarks: "Household leader"
	},
	{
		id: 12,
		householdId: 105,
		fullName: "Flores, Elena Cruz",
		pn: "0009-B",
		age: 58,
		religion: "Roman Catholic",
		civilStatus: "Married",
		isSC: false,
		isPWD: false,
		isIP: false,
		remarks: ""
	},
	{
		id: 13,
		householdId: 105,
		fullName: "Flores, Miguel Diaz",
		pn: "0010-A",
		age: 26,
		religion: "Roman Catholic",
		civilStatus: "Single",
		isSC: false,
		isPWD: false,
		isIP: false,
		remarks: ""
	},
	{
		id: 14,
		householdId: 106,
		fullName: "Ramos, Lucia Gomez",
		pn: "0011-A",
		age: 39,
		religion: "Roman Catholic",
		civilStatus: "Separated",
		isSC: false,
		isPWD: false,
		isIP: true,
		remarks: "Household leader; Manobo tribe"
	},
	{
		id: 15,
		householdId: 106,
		fullName: "Ramos, Nina Gomez",
		pn: "0012-A",
		age: 16,
		religion: "Roman Catholic",
		civilStatus: "Single",
		isSC: false,
		isPWD: false,
		isIP: true,
		remarks: "Minor"
	},
	{
		id: 16,
		householdId: 107,
		fullName: "Cruz, Miguel Santos",
		pn: "0013-A",
		age: 47,
		religion: "Roman Catholic",
		civilStatus: "Married",
		isSC: false,
		isPWD: false,
		isIP: false,
		remarks: "Household leader"
	},
	{
		id: 17,
		householdId: 107,
		fullName: "Cruz, Teresa Ramos",
		pn: "0013-B",
		age: 44,
		religion: "Roman Catholic",
		civilStatus: "Married",
		isSC: false,
		isPWD: false,
		isIP: false,
		remarks: ""
	},
	{
		id: 18,
		householdId: 107,
		fullName: "Cruz, Daniel Santos",
		pn: "0014-A",
		age: 21,
		religion: "Roman Catholic",
		civilStatus: "Single",
		isSC: false,
		isPWD: false,
		isIP: false,
		remarks: "OFW applicant"
	},
	{
		id: 19,
		householdId: 108,
		fullName: "Dela Peña, Rosa Luna",
		pn: "0015-A",
		age: 73,
		religion: "Roman Catholic",
		civilStatus: "Widowed",
		isSC: true,
		isPWD: true,
		isIP: false,
		remarks: "Household leader; wheelchair user"
	},
	{
		id: 20,
		householdId: 109,
		fullName: "Navarro, Juan Ortiz",
		pn: "0016-A",
		age: 55,
		religion: "Seventh-day Adventist",
		civilStatus: "Married",
		isSC: false,
		isPWD: false,
		isIP: false,
		remarks: "Household leader"
	},
	{
		id: 21,
		householdId: 109,
		fullName: "Navarro, Sofia Reyes",
		pn: "0016-B",
		age: 51,
		religion: "Seventh-day Adventist",
		civilStatus: "Married",
		isSC: false,
		isPWD: false,
		isIP: false,
		remarks: ""
	},
	{
		id: 22,
		householdId: 110,
		fullName: "Villanueva, Carmen Solis",
		pn: "0017-A",
		age: 66,
		religion: "Roman Catholic",
		civilStatus: "Widowed",
		isSC: true,
		isPWD: false,
		isIP: false,
		remarks: "Household leader"
	},
	{
		id: 23,
		householdId: 110,
		fullName: "Villanueva, Marco Solis",
		pn: "0018-A",
		age: 30,
		religion: "Roman Catholic",
		civilStatus: "Single",
		isSC: false,
		isPWD: true,
		isIP: false,
		remarks: "Visual impairment"
	},
	{
		id: 24,
		householdId: 110,
		fullName: "Villanueva, Ana Solis",
		pn: "0018-B",
		age: 27,
		religion: "Roman Catholic",
		civilStatus: "Single",
		isSC: false,
		isPWD: false,
		isIP: false,
		remarks: ""
	}
];
function sectorBadges(m) {
	const badges = [];
	if (m.isSC) badges.push({
		label: "SC",
		className: "bg-blue-100   text-blue-800   ring-blue-600/20"
	});
	if (m.isPWD) badges.push({
		label: "PWD",
		className: "bg-green-100  text-green-800  ring-green-600/20"
	});
	if (m.isIP) badges.push({
		label: "IP",
		className: "bg-orange-100 text-orange-800 ring-orange-600/20"
	});
	return badges;
}
var nextId = 9e3;
var uid = () => ++nextId;
var inputCls = "w-full rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-500 focus:ring-2 focus:ring-slate-200";
function Index() {
	const [membersData, setMembersData] = (0, import_react.useState)(members);
	const [householdsData, setHouseholdsData] = (0, import_react.useState)(households);
	const [puroksData, setPuroksData] = (0, import_react.useState)(puroks);
	const barangaysData = barangays;
	const [activeTab, setActiveTab] = (0, import_react.useState)("dashboard");
	const [query, setQuery] = (0, import_react.useState)("");
	const [barangayFilter, setBarangayFilter] = (0, import_react.useState)("all");
	const [purokFilter, setPurokFilter] = (0, import_react.useState)("all");
	const [sectorFilter, setSectorFilter] = (0, import_react.useState)("all");
	const [selected, setSelected] = (0, import_react.useState)(null);
	const [modal, setModal] = (0, import_react.useState)(null);
	const [leaderSession, setLeaderSession] = (0, import_react.useState)(null);
	const isAdmin = leaderSession?.type === "admin";
	const isHouseholdLeader = leaderSession?.type === "household";
	const isPurokLeader = leaderSession?.type === "purok";
	const householdById = (0, import_react.useMemo)(() => new Map(householdsData.map((h) => [h.id, h])), [householdsData]);
	const purokById = (0, import_react.useMemo)(() => new Map(puroksData.map((p) => [p.id, p])), [puroksData]);
	const barangayById = (0, import_react.useMemo)(() => new Map(barangaysData.map((b) => [b.id, b])), [barangaysData]);
	const visiblePuroks = (0, import_react.useMemo)(() => barangayFilter === "all" ? puroksData : puroksData.filter((p) => p.barangayId === Number(barangayFilter)), [barangayFilter, puroksData]);
	const filtered = (0, import_react.useMemo)(() => {
		const q = query.trim().toLowerCase();
		return membersData.filter((m) => {
			const household = householdById.get(m.householdId);
			if (!household) return false;
			const purok = purokById.get(household.purokId);
			if (!purok) return false;
			if (barangayFilter !== "all" && purok.barangayId !== Number(barangayFilter)) return false;
			if (purokFilter !== "all" && household.purokId !== Number(purokFilter)) return false;
			if (sectorFilter === "SC" && !m.isSC) return false;
			if (sectorFilter === "PWD" && !m.isPWD) return false;
			if (sectorFilter === "IP" && !m.isIP) return false;
			if (q && !m.fullName.toLowerCase().includes(q) && !m.pn.toLowerCase().includes(q)) return false;
			if (leaderSession) {
				if (leaderSession.type === "household" && m.householdId !== leaderSession.id) return false;
				if (leaderSession.type === "purok" && household.purokId !== leaderSession.id) return false;
			}
			return true;
		});
	}, [
		query,
		barangayFilter,
		purokFilter,
		sectorFilter,
		membersData,
		householdById,
		purokById,
		leaderSession
	]);
	const leaderMembers = (0, import_react.useMemo)(() => {
		if (!leaderSession) return [];
		if (leaderSession.type === "admin") return membersData;
		if (leaderSession.type === "household") return membersData.filter((m) => m.householdId === leaderSession.id);
		const purokHouseholds = householdsData.filter((h) => h.purokId === leaderSession.id).map((h) => h.id);
		return membersData.filter((m) => purokHouseholds.includes(m.householdId));
	}, [
		leaderSession,
		membersData,
		householdsData
	]);
	const saveMember = (data, id) => {
		const household = householdById.get(data.householdId);
		const canAddToOwnHousehold = isHouseholdLeader && id === void 0 && data.householdId === leaderSession.id;
		const canAddToOwnPurok = isPurokLeader && id === void 0 && household?.purokId === leaderSession.id;
		if (!isAdmin && !canAddToOwnHousehold && !canAddToOwnPurok) return;
		if (id !== void 0) {
			setMembersData((prev) => prev.map((m) => m.id === id ? {
				...data,
				id
			} : m));
			if (selected?.id === id) setSelected({
				...data,
				id
			});
		} else setMembersData((prev) => [...prev, {
			...data,
			id: uid()
		}]);
		setModal(null);
	};
	const deleteMember = (id) => {
		if (!isAdmin) return;
		setMembersData((prev) => prev.filter((m) => m.id !== id));
		if (selected?.id === id) setSelected(null);
		setModal(null);
	};
	const saveHousehold = (data, id) => {
		if (!isAdmin) return;
		if (id !== void 0) setHouseholdsData((prev) => prev.map((h) => h.id === id ? {
			...data,
			id
		} : h));
		else setHouseholdsData((prev) => [...prev, {
			...data,
			id: uid()
		}]);
		setModal(null);
	};
	const deleteHousehold = (id) => {
		if (!isAdmin) return;
		setHouseholdsData((prev) => prev.filter((h) => h.id !== id));
		setModal(null);
	};
	const savePurok = (data, id) => {
		if (!isAdmin) return;
		if (id !== void 0) setPuroksData((prev) => prev.map((p) => p.id === id ? {
			...data,
			id
		} : p));
		else setPuroksData((prev) => [...prev, {
			...data,
			id: uid()
		}]);
		setModal(null);
	};
	const deletePurok = (id) => {
		if (!isAdmin) return;
		setPuroksData((prev) => prev.filter((p) => p.id !== id));
		setModal(null);
	};
	const leaderLabel = (0, import_react.useMemo)(() => {
		if (!leaderSession) return "";
		if (leaderSession.type === "admin") return "System Admin";
		if (leaderSession.type === "household") {
			const h = householdById.get(leaderSession.id);
			return h ? h.householdLeaderName : "Household Leader";
		}
		const p = purokById.get(leaderSession.id);
		return p ? p.purokLeaderName : "Purok Leader";
	}, [
		leaderSession,
		householdById,
		purokById
	]);
	const leaderRoleLabel = leaderSession ? leaderSession.type === "admin" ? "Administrator" : leaderSession.type === "household" ? "Household Leader" : "Purok Leader" : "";
	const leaderScopeLabel = (0, import_react.useMemo)(() => {
		if (!leaderSession) return "";
		if (leaderSession.type === "admin") return "All Access";
		if (leaderSession.type === "household") {
			const h = householdById.get(leaderSession.id);
			return h ? h.address : "";
		}
		const p = purokById.get(leaderSession.id);
		return p ? p.name : "";
	}, [
		leaderSession,
		householdById,
		purokById
	]);
	const navItems = [...isAdmin ? [
		{
			id: "dashboard",
			label: "Overview",
			icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LayoutDashboard, { className: "h-4 w-4" })
		},
		{
			id: "members",
			label: "Members",
			icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Users, { className: "h-4 w-4" })
		},
		{
			id: "puroks",
			label: "Puroks",
			icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(MapPin, { className: "h-4 w-4" })
		},
		{
			id: "users",
			label: "Users",
			icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(UserCheck, { className: "h-4 w-4" })
		}
	] : [{
		id: "my-dashboard",
		label: "My Dashboard",
		icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(UserCheck, { className: "h-4 w-4" })
	}]];
	const tabTitles = {
		"my-dashboard": {
			title: "My Dashboard",
			subtitle: `Signed in as ${leaderRoleLabel} · ${leaderScopeLabel}`
		},
		dashboard: {
			title: "Overview",
			subtitle: "Resident and household records across all puroks"
		},
		members: {
			title: "Members",
			subtitle: "Manage residents, households and purok leaders"
		},
		puroks: {
			title: "Puroks",
			subtitle: "All puroks grouped by barangay"
		},
		users: {
			title: "Users",
			subtitle: "Manage household and purok leaders"
		}
	};
	if (!leaderSession) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoginGate, {
		puroksData,
		householdsData,
		onSignIn: (session) => {
			setLeaderSession(session);
			setActiveTab(session.type === "admin" ? "dashboard" : "my-dashboard");
		}
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex min-h-screen bg-slate-100 text-slate-900",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("aside", {
				className: "hidden w-60 shrink-0 flex-col border-r border-slate-200 bg-white md:flex",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex items-center gap-2 border-b border-slate-200 px-5 py-4",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "flex h-8 w-8 items-center justify-center rounded-md bg-slate-900 text-white",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(House, { className: "h-4 w-4" })
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-sm font-semibold leading-tight",
							children: "Barangay RMS"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-[11px] text-slate-500",
							children: "Resident Management"
						})] })]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("nav", {
						className: "flex-1 space-y-1 p-3 text-sm",
						children: [navItems.map((item) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
							id: `nav-${item.id}`,
							onClick: () => setActiveTab(item.id),
							className: `flex w-full items-center gap-2 rounded-md px-3 py-2 font-medium text-left transition-colors ${activeTab === item.id ? "bg-slate-900 text-white" : "text-slate-600 hover:bg-slate-100"}`,
							children: [item.icon, item.label]
						}, item.id)), (isHouseholdLeader || isPurokLeader) && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
							onClick: () => {
								if (leaderSession?.type === "household") {
									setModal({
										kind: "household-add-member",
										householdId: leaderSession.id
									});
									return;
								}
								if (leaderSession?.type === "purok") setModal({ kind: "purok-add-member" });
							},
							className: "flex w-full items-center gap-2 rounded-md bg-slate-900 px-3 py-2 font-medium text-left text-white transition-colors hover:bg-slate-700",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Plus, { className: "h-4 w-4" }), " Add Member"]
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "border-t border-slate-200 p-3",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex items-center gap-2 rounded-lg bg-slate-50 px-3 py-2",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-slate-900 text-white text-[11px] font-bold",
									children: leaderLabel.charAt(0)
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "min-w-0 flex-1",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "truncate text-xs font-semibold text-slate-800",
										children: leaderLabel
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "text-[10px] text-slate-500",
										children: leaderRoleLabel
									})]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
									onClick: () => setLeaderSession(null),
									title: "Sign out",
									className: "rounded p-1 text-slate-400 hover:bg-slate-200 hover:text-red-600 transition-colors",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LogOut, { className: "h-3.5 w-3.5" })
								})
							]
						})
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("main", {
				className: "flex-1 overflow-x-hidden",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", {
					className: "border-b border-slate-200 bg-white px-6 py-4",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
						className: "text-lg font-semibold",
						children: tabTitles[activeTab].title
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-sm text-slate-500",
						children: tabTitles[activeTab].subtitle
					})]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "space-y-6 p-6",
					children: [
						isAdmin && activeTab === "dashboard" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatCard, {
									icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Landmark, { className: "h-5 w-5 text-amber-600" }),
									label: "Total Barangays",
									value: barangaysData.length
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatCard, {
									icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(MapPin, { className: "h-5 w-5 text-indigo-600" }),
									label: "Total Puroks",
									value: puroksData.length,
									onClick: () => setActiveTab("puroks")
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatCard, {
									icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(House, { className: "h-5 w-5 text-emerald-600" }),
									label: "Total Households",
									value: householdsData.length
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatCard, {
									icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Users, { className: "h-5 w-5 text-sky-600" }),
									label: "Total Members",
									value: membersData.length,
									onClick: () => setActiveTab("members")
								})
							]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "grid grid-cols-1 gap-4 md:grid-cols-2",
							children: barangaysData.map((b) => {
								const bPuroks = puroksData.filter((p) => p.barangayId === b.id);
								const bHouseholds = householdsData.filter((h) => bPuroks.some((p) => p.id === h.purokId));
								const bMembers = membersData.filter((m) => bHouseholds.some((h) => h.id === m.householdId));
								return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "rounded-lg border border-slate-200 bg-white p-5 shadow-sm",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "mb-3",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
											className: "font-semibold",
											children: b.name
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
											className: "text-xs text-slate-500",
											children: ["Captain: ", b.barangayCaptainName]
										})]
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
										className: "grid grid-cols-3 gap-3 text-center",
										children: [
											["Puroks", bPuroks.length],
											["Households", bHouseholds.length],
											["Members", bMembers.length]
										].map(([label, val]) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "rounded-md bg-slate-50 py-2",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
												className: "text-xl font-bold",
												children: val
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
												className: "text-[11px] text-slate-500",
												children: label
											})]
										}, String(label)))
									})]
								}, b.id);
							})
						})] }),
						isAdmin && activeTab === "members" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
							isAdmin && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex flex-wrap gap-2",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ActionBtn, {
										icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Plus, { className: "h-3.5 w-3.5" }),
										label: "Add Member",
										onClick: () => setModal({ kind: "add-member" })
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ActionBtn, {
										icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Plus, { className: "h-3.5 w-3.5" }),
										label: "Add Household Leader",
										onClick: () => setModal({ kind: "add-household" }),
										color: "indigo"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ActionBtn, {
										icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Plus, { className: "h-3.5 w-3.5" }),
										label: "Add Purok Leader",
										onClick: () => setModal({ kind: "add-purok" }),
										color: "emerald"
									})
								]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex flex-col gap-3 rounded-lg border border-slate-200 bg-white p-4 shadow-sm sm:flex-row sm:items-center",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "relative flex-1",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Search, { className: "pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
											value: query,
											onChange: (e) => setQuery(e.target.value),
											placeholder: "Search by name or precinct number...",
											className: "w-full rounded-md border border-slate-300 py-2 pl-9 pr-3 text-sm outline-none focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
										})]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("select", {
										value: barangayFilter,
										onChange: (e) => {
											setBarangayFilter(e.target.value);
											setPurokFilter("all");
										},
										className: "rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-500",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
											value: "all",
											children: "All Barangays"
										}), barangaysData.map((b) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
											value: b.id,
											children: b.name
										}, b.id))]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("select", {
										value: purokFilter,
										onChange: (e) => setPurokFilter(e.target.value),
										className: "rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-500",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
											value: "all",
											children: "All Puroks"
										}), visiblePuroks.map((p) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
											value: p.id,
											children: p.name
										}, p.id))]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("select", {
										value: sectorFilter,
										onChange: (e) => setSectorFilter(e.target.value),
										className: "rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-500",
										children: [
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
												value: "all",
												children: "All Sectors"
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
												value: "SC",
												children: "Senior Citizen (SC)"
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
												value: "PWD",
												children: "PWD"
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
												value: "IP",
												children: "Indigenous (IP)"
											})
										]
									})
								]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "overflow-x-auto",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("table", {
										className: "w-full text-left text-sm",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("thead", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("tr", {
											className: "border-b border-slate-200 bg-slate-50 text-xs uppercase tracking-wide text-slate-500",
											children: [
												"Name",
												"PN",
												"Barangay",
												"Purok",
												"Household Leader",
												"Age",
												"Status",
												"Sectors",
												"Remarks",
												""
											].map((h, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
												className: "px-4 py-2.5 font-semibold",
												children: h
											}, i))
										}) }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tbody", { children: [filtered.map((m) => {
											const household = householdById.get(m.householdId);
											const purok = household ? purokById.get(household.purokId) : void 0;
											const barangay = purok ? barangayById.get(purok.barangayId) : void 0;
											return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", {
												className: "border-b border-slate-100 last:border-0 hover:bg-slate-50",
												children: [
													/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
														className: "whitespace-nowrap px-4 py-2 font-medium cursor-pointer",
														onClick: () => setSelected(m),
														children: m.fullName
													}),
													/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
														className: "whitespace-nowrap px-4 py-2 text-slate-600",
														children: m.pn
													}),
													/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
														className: "whitespace-nowrap px-4 py-2 text-slate-600",
														children: barangay?.name.replace("Barangay ", "") ?? "—"
													}),
													/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
														className: "whitespace-nowrap px-4 py-2 text-slate-600",
														children: purok?.name.split(" - ")[0] ?? "—"
													}),
													/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
														className: "whitespace-nowrap px-4 py-2 text-slate-600",
														children: household?.householdLeaderName ?? "—"
													}),
													/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
														className: "px-4 py-2 text-slate-600",
														children: m.age
													}),
													/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
														className: "px-4 py-2 text-slate-600",
														children: m.civilStatus
													}),
													/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
														className: "px-4 py-2",
														children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
															className: "flex gap-1",
															children: [sectorBadges(m).length === 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
																className: "text-xs text-slate-300",
																children: "—"
															}), sectorBadges(m).map((b) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
																className: `inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-semibold ring-1 ring-inset ${b.className}`,
																children: b.label
															}, b.label))]
														})
													}),
													/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
														className: "max-w-[180px] truncate px-4 py-2 text-slate-500",
														children: m.remarks || /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
															className: "text-slate-300",
															children: "—"
														})
													}),
													/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
														className: "px-4 py-2",
														children: isAdmin && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
															className: "flex items-center gap-1",
															children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
																onClick: () => setModal({
																	kind: "edit-member",
																	data: m
																}),
																className: "rounded p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700",
																title: "Edit",
																children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Pencil, { className: "h-3.5 w-3.5" })
															}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
																onClick: () => {
																	if (confirm(`Delete ${m.fullName}?`)) deleteMember(m.id);
																},
																className: "rounded p-1 text-slate-400 hover:bg-red-50 hover:text-red-600",
																title: "Delete",
																children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Trash2, { className: "h-3.5 w-3.5" })
															})]
														})
													})
												]
											}, m.id);
										}), filtered.length === 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("tr", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
											colSpan: 10,
											className: "px-4 py-10 text-center text-sm text-slate-400",
											children: "No members match the current filters."
										}) })] })]
									})
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "border-t border-slate-200 bg-slate-50 px-4 py-2 text-xs text-slate-500",
									children: [
										"Showing ",
										filtered.length,
										" of ",
										membersData.length,
										" members"
									]
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "mb-2 flex items-center justify-between",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
									className: "text-sm font-semibold text-slate-700",
									children: "Household Leaders"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
									onClick: () => setModal({ kind: "add-household" }),
									className: "flex items-center gap-1 rounded-md bg-indigo-50 px-3 py-1.5 text-xs font-medium text-indigo-700 hover:bg-indigo-100 transition-colors",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Plus, { className: "h-3.5 w-3.5" }), " Add Household"]
								})]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "overflow-x-auto",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("table", {
										className: "w-full text-left text-sm",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("thead", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("tr", {
											className: "border-b border-slate-200 bg-slate-50 text-xs uppercase tracking-wide text-slate-500",
											children: [
												"Household Leader",
												"Address",
												"Purok",
												"Members",
												""
											].map((h, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
												className: "px-4 py-2.5 font-semibold",
												children: h
											}, i))
										}) }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("tbody", { children: householdsData.map((h) => {
											const purok = purokById.get(h.purokId);
											const hMembers = membersData.filter((m) => m.householdId === h.id);
											return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", {
												className: "border-b border-slate-100 last:border-0 hover:bg-slate-50",
												children: [
													/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
														className: "whitespace-nowrap px-4 py-2 font-medium",
														children: h.householdLeaderName
													}),
													/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
														className: "px-4 py-2 text-slate-600",
														children: h.address
													}),
													/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
														className: "whitespace-nowrap px-4 py-2 text-slate-600",
														children: purok?.name.split(" - ")[0] ?? "—"
													}),
													/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
														className: "px-4 py-2 text-slate-600",
														children: hMembers.length
													}),
													/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
														className: "px-4 py-2",
														children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
															className: "flex items-center gap-1",
															children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
																onClick: () => setModal({
																	kind: "edit-household",
																	data: h
																}),
																className: "rounded p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700",
																children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Pencil, { className: "h-3.5 w-3.5" })
															}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
																onClick: () => {
																	if (confirm(`Delete household?`)) deleteHousehold(h.id);
																},
																className: "rounded p-1 text-slate-400 hover:bg-red-50 hover:text-red-600",
																children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Trash2, { className: "h-3.5 w-3.5" })
															})]
														})
													})
												]
											}, h.id);
										}) })]
									})
								})
							})] }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "mb-2 flex items-center justify-between",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
									className: "text-sm font-semibold text-slate-700",
									children: "Purok Leaders"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
									onClick: () => setModal({ kind: "add-purok" }),
									className: "flex items-center gap-1 rounded-md bg-emerald-50 px-3 py-1.5 text-xs font-medium text-emerald-700 hover:bg-emerald-100 transition-colors",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Plus, { className: "h-3.5 w-3.5" }), " Add Purok"]
								})]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "overflow-x-auto",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("table", {
										className: "w-full text-left text-sm",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("thead", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("tr", {
											className: "border-b border-slate-200 bg-slate-50 text-xs uppercase tracking-wide text-slate-500",
											children: [
												"Purok Name",
												"Purok Leader",
												"Barangay",
												"Households",
												"Members",
												""
											].map((h, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
												className: "px-4 py-2.5 font-semibold",
												children: h
											}, i))
										}) }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("tbody", { children: puroksData.map((p) => {
											const barangay = barangayById.get(p.barangayId);
											const pHouses = householdsData.filter((h) => h.purokId === p.id);
											const pMembers = membersData.filter((m) => pHouses.some((h) => h.id === m.householdId));
											return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", {
												className: "border-b border-slate-100 last:border-0 hover:bg-slate-50",
												children: [
													/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
														className: "whitespace-nowrap px-4 py-2 font-medium",
														children: p.name
													}),
													/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
														className: "whitespace-nowrap px-4 py-2 text-slate-600",
														children: p.purokLeaderName
													}),
													/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
														className: "whitespace-nowrap px-4 py-2 text-slate-600",
														children: barangay?.name.replace("Barangay ", "") ?? "—"
													}),
													/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
														className: "px-4 py-2 text-slate-600",
														children: pHouses.length
													}),
													/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
														className: "px-4 py-2 text-slate-600",
														children: pMembers.length
													}),
													/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
														className: "px-4 py-2",
														children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
															className: "flex items-center gap-1",
															children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
																onClick: () => setModal({
																	kind: "edit-purok",
																	data: p
																}),
																className: "rounded p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700",
																children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Pencil, { className: "h-3.5 w-3.5" })
															}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
																onClick: () => {
																	if (confirm(`Delete purok "${p.name}"?`)) deletePurok(p.id);
																},
																className: "rounded p-1 text-slate-400 hover:bg-red-50 hover:text-red-600",
																children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Trash2, { className: "h-3.5 w-3.5" })
															})]
														})
													})
												]
											}, p.id);
										}) })]
									})
								})
							})] })
						] }),
						isAdmin && activeTab === "puroks" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "space-y-6",
							children: barangaysData.map((b) => {
								const bPuroks = puroksData.filter((p) => p.barangayId === b.id);
								return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "mb-3 flex items-center gap-2",
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
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3",
									children: bPuroks.map((p) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PurokCard, {
										purok: p,
										householdsData,
										membersData,
										onEdit: () => setModal({
											kind: "edit-purok",
											data: p
										}),
										onViewMembers: () => {
											setPurokFilter(String(p.id));
											setBarangayFilter(String(b.id));
											setActiveTab("members");
										}
									}, p.id))
								})] }, b.id);
							})
						}),
						isAdmin && activeTab === "users" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "space-y-6",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex justify-end gap-2",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ActionBtn, {
									icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Plus, { className: "h-4 w-4" }),
									label: "Add Purok Leader",
									onClick: () => setModal({ kind: "add-purok" }),
									color: "indigo"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ActionBtn, {
									icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Plus, { className: "h-4 w-4" }),
									label: "Add Household Leader",
									onClick: () => setModal({ kind: "add-household" }),
									color: "emerald"
								})]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("table", {
									className: "w-full text-left text-sm text-slate-600",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("thead", {
										className: "bg-slate-50 text-xs uppercase text-slate-500 border-b border-slate-200",
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", { children: [
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
												className: "px-4 py-3",
												children: "Name"
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
												className: "px-4 py-3",
												children: "Role"
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
												className: "px-4 py-3",
												children: "Assignment"
											})
										] })
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("tbody", {
										className: "divide-y divide-slate-100",
										children: [...puroksData.map((p) => ({
											key: `p-${p.id}`,
											name: p.purokLeaderName,
											role: "Purok Leader",
											assignment: p.name
										})), ...householdsData.map((h) => ({
											key: `h-${h.id}`,
											name: h.householdLeaderName,
											role: "Household Leader",
											assignment: h.address
										}))].sort((a, b) => a.name.localeCompare(b.name)).map((u) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", {
											className: "hover:bg-slate-50",
											children: [
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
													className: "whitespace-nowrap px-4 py-3 font-medium text-slate-900",
													children: u.name
												}),
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
													className: "whitespace-nowrap px-4 py-3",
													children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
														className: `inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-bold ${u.role === "Purok Leader" ? "bg-indigo-50 text-indigo-700" : "bg-emerald-50 text-emerald-700"}`,
														children: u.role
													})
												}),
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
													className: "whitespace-nowrap px-4 py-3",
													children: u.assignment
												})
											]
										}, u.key))
									})]
								})
							})]
						}),
						!isAdmin && activeTab === "my-dashboard" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "space-y-6",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "flex items-center justify-between rounded-xl border border-emerald-200 bg-emerald-50 px-6 py-4",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "flex items-center gap-3",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
											className: "flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-600 text-white",
											children: leaderSession.type === "household" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(House, { className: "h-5 w-5" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(MapPin, { className: "h-5 w-5" })
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
											className: "font-semibold text-emerald-900",
											children: leaderLabel
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
											className: "text-xs text-emerald-700",
											children: [
												leaderRoleLabel,
												" · ",
												leaderScopeLabel
											]
										})] })]
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
										onClick: () => setLeaderSession(null),
										className: "flex items-center gap-1.5 rounded-md border border-emerald-300 px-3 py-1.5 text-xs font-medium text-emerald-800 hover:bg-emerald-100 transition-colors",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(LogOut, { className: "h-3.5 w-3.5" }), " Sign Out"]
									})]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "grid grid-cols-2 gap-4 sm:grid-cols-4",
									children: [leaderSession.type === "purok" && (() => {
										const pHouses = householdsData.filter((h) => h.purokId === leaderSession.id);
										return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatCard, {
												icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(House, { className: "h-5 w-5 text-indigo-600" }),
												label: "Households",
												value: pHouses.length
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatCard, {
												icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Users, { className: "h-5 w-5 text-sky-600" }),
												label: "Total Members",
												value: leaderMembers.length
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatCard, {
												icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Flag, { className: "h-5 w-5 text-blue-600" }),
												label: "Senior Citizens",
												value: leaderMembers.filter((m) => m.isSC).length
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatCard, {
												icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Accessibility, { className: "h-5 w-5 text-green-600" }),
												label: "PWD",
												value: leaderMembers.filter((m) => m.isPWD).length
											})
										] });
									})(), leaderSession.type === "household" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatCard, {
											icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Users, { className: "h-5 w-5 text-sky-600" }),
											label: "Total Members",
											value: leaderMembers.length
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatCard, {
											icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Flag, { className: "h-5 w-5 text-blue-600" }),
											label: "Senior Citizens",
											value: leaderMembers.filter((m) => m.isSC).length
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatCard, {
											icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Accessibility, { className: "h-5 w-5 text-green-600" }),
											label: "PWD",
											value: leaderMembers.filter((m) => m.isPWD).length
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatCard, {
											icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Users, { className: "h-5 w-5 text-orange-500" }),
											label: "Indigenous (IP)",
											value: leaderMembers.filter((m) => m.isIP).length
										})
									] })]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h2", {
									className: "text-sm font-semibold text-slate-700",
									children: [
										"Members (",
										leaderMembers.length,
										")"
									]
								}),
								leaderSession.type === "purok" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "space-y-4",
									children: [householdsData.filter((h) => h.purokId === leaderSession.id).map((h) => {
										const hMembers = membersData.filter((m) => m.householdId === h.id);
										return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
												className: "flex items-center justify-between border-b border-slate-100 bg-slate-50 px-4 py-2.5",
												children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
													className: "text-sm font-semibold",
													children: h.householdLeaderName
												}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
													className: "ml-2 text-xs text-slate-500",
													children: h.address
												})] })
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LeaderMemberTable, { members: hMembers })]
										}, h.id);
									}), householdsData.filter((h) => h.purokId === leaderSession.id).length === 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "py-8 text-center text-sm text-slate-400",
										children: "No households found in this purok."
									})]
								}),
								leaderSession.type === "household" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LeaderMemberTable, { members: leaderMembers })
								})
							]
						})
					]
				})]
			}),
			selected && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(MemberPanel, {
				member: selected,
				householdById,
				purokById,
				barangayById,
				onClose: () => setSelected(null),
				canManage: isAdmin,
				onEdit: () => setModal({
					kind: "edit-member",
					data: selected
				}),
				onDelete: () => {
					if (confirm(`Delete ${selected.fullName}?`)) deleteMember(selected.id);
				}
			}),
			modal?.kind === "add-member" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(MemberModal, {
				householdsData,
				onSave: (d) => saveMember(d),
				onClose: () => setModal(null)
			}),
			modal?.kind === "household-add-member" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(MemberModal, {
				householdsData,
				defaultHouseholdId: modal.householdId,
				onSave: (d) => saveMember(d),
				onClose: () => setModal(null)
			}),
			modal?.kind === "purok-add-member" && leaderSession.type === "purok" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(MemberModal, {
				householdsData: householdsData.filter((h) => h.purokId === leaderSession.id),
				onSave: (d) => saveMember(d),
				onClose: () => setModal(null)
			}),
			modal?.kind === "edit-member" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(MemberModal, {
				initial: modal.data,
				householdsData,
				onSave: (d) => saveMember(d, modal.data.id),
				onClose: () => setModal(null)
			}),
			modal?.kind === "add-household" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(HouseholdModal, {
				puroksData,
				onSave: (d) => saveHousehold(d),
				onClose: () => setModal(null)
			}),
			modal?.kind === "edit-household" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(HouseholdModal, {
				initial: modal.data,
				puroksData,
				onSave: (d) => saveHousehold(d, modal.data.id),
				onClose: () => setModal(null)
			}),
			modal?.kind === "add-purok" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PurokModal, {
				barangaysData,
				onSave: (d) => savePurok(d),
				onClose: () => setModal(null)
			}),
			modal?.kind === "edit-purok" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PurokModal, {
				initial: modal.data,
				barangaysData,
				onSave: (d) => savePurok(d, modal.data.id),
				onClose: () => setModal(null)
			})
		]
	});
}
function LeaderMemberTable({ members }) {
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
					"Civil Status",
					"Sectors",
					"Remarks"
				].map((h, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
					className: "px-4 py-2.5 font-semibold",
					children: h
				}, i))
			}) }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("tbody", { children: members.map((m) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", {
				className: "border-b border-slate-100 last:border-0 hover:bg-slate-50",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
						className: "whitespace-nowrap px-4 py-2 font-medium",
						children: m.fullName
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
						className: "whitespace-nowrap px-4 py-2 text-slate-600",
						children: m.pn
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
						className: "px-4 py-2 text-slate-600",
						children: m.age
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
						className: "px-4 py-2 text-slate-600",
						children: m.civilStatus
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
						className: "px-4 py-2",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex gap-1",
							children: [sectorBadges(m).length === 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "text-xs text-slate-300",
								children: "—"
							}), sectorBadges(m).map((b) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: `inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-semibold ring-1 ring-inset ${b.className}`,
								children: b.label
							}, b.label))]
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
						className: "max-w-[160px] truncate px-4 py-2 text-slate-500",
						children: m.remarks || /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "text-slate-300",
							children: "—"
						})
					})
				]
			}, m.id)) })]
		})
	});
}
function ActionBtn({ icon, label, onClick, color = "slate" }) {
	const cls = {
		slate: "bg-slate-900 text-white hover:bg-slate-700",
		indigo: "bg-indigo-600 text-white hover:bg-indigo-700",
		emerald: "bg-emerald-600 text-white hover:bg-emerald-700"
	}[color];
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
		onClick,
		className: `flex items-center gap-1.5 rounded-md px-3 py-2 text-xs font-semibold transition-colors ${cls}`,
		children: [icon, label]
	});
}
function ModalShell({ title, onClose, children }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "fixed inset-0 z-50 flex items-center justify-center p-4",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "absolute inset-0 bg-slate-900/40",
			onClick: onClose
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "relative z-10 w-full max-w-lg rounded-xl bg-white shadow-2xl",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex items-center justify-between border-b border-slate-200 px-6 py-4",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
					className: "text-base font-semibold",
					children: title
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					onClick: onClose,
					className: "rounded-md p-1 text-slate-400 hover:bg-slate-100",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(X, { className: "h-5 w-5" })
				})]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "max-h-[75vh] overflow-y-auto px-6 py-5",
				children
			})]
		})]
	});
}
function Field({ label, children }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
		className: "mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-500",
		children: label
	}), children] });
}
function MemberModal({ initial, householdsData, onSave, onClose, defaultHouseholdId }) {
	const [form, setForm] = (0, import_react.useState)({
		fullName: initial?.fullName ?? "",
		pn: initial?.pn ?? "",
		householdId: initial?.householdId ?? defaultHouseholdId ?? householdsData[0]?.id ?? 0,
		age: initial?.age ?? 30,
		religion: initial?.religion ?? "",
		civilStatus: initial?.civilStatus ?? "Single",
		isSC: initial?.isSC ?? false,
		isPWD: initial?.isPWD ?? false,
		isIP: initial?.isIP ?? false,
		remarks: initial?.remarks ?? ""
	});
	const set = (k, v) => setForm((f) => ({
		...f,
		[k]: v
	}));
	const handleSubmit = (e) => {
		e.preventDefault();
		if (!form.fullName.trim() || !form.pn.trim()) return;
		onSave({
			...form,
			householdId: Number(form.householdId),
			age: Number(form.age)
		});
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ModalShell, {
		title: initial ? "Edit Member" : "Add Member",
		onClose,
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
			onSubmit: handleSubmit,
			className: "space-y-4",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "grid grid-cols-2 gap-4",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
						label: "Full Name",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
							className: inputCls,
							value: form.fullName,
							onChange: (e) => set("fullName", e.target.value),
							placeholder: "Last, First Middle",
							required: true
						})
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
						label: "Precinct No.",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
							className: inputCls,
							value: form.pn,
							onChange: (e) => set("pn", e.target.value),
							placeholder: "e.g. 0001-A",
							required: true
						})
					})]
				}),
				!defaultHouseholdId && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
					label: "Household",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("select", {
						className: inputCls,
						value: form.householdId,
						onChange: (e) => set("householdId", e.target.value),
						children: householdsData.map((h) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("option", {
							value: h.id,
							children: [
								h.householdLeaderName,
								" — ",
								h.address
							]
						}, h.id))
					})
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "grid grid-cols-2 gap-4",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
						label: "Age",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
							type: "number",
							min: 0,
							max: 150,
							className: inputCls,
							value: form.age,
							onChange: (e) => set("age", e.target.value)
						})
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
						label: "Civil Status",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("select", {
							className: inputCls,
							value: form.civilStatus,
							onChange: (e) => set("civilStatus", e.target.value),
							children: [
								"Single",
								"Married",
								"Widowed",
								"Separated"
							].map((s) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", { children: s }, s))
						})
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
					label: "Religion",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
						className: inputCls,
						value: form.religion,
						onChange: (e) => set("religion", e.target.value),
						placeholder: "e.g. Roman Catholic"
					})
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "flex gap-6",
					children: [
						["isSC", "Senior Citizen (SC)"],
						["isPWD", "PWD"],
						["isIP", "Indigenous Person (IP)"]
					].map(([key, lbl]) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
						className: "flex items-center gap-2 cursor-pointer text-sm",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
							type: "checkbox",
							checked: form[key],
							onChange: (e) => set(key, e.target.checked),
							className: "h-4 w-4 rounded border-slate-300"
						}), lbl]
					}, key))
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
					label: "Remarks",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("textarea", {
						className: inputCls,
						rows: 2,
						value: form.remarks,
						onChange: (e) => set("remarks", e.target.value)
					})
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex justify-end gap-2 pt-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						onClick: onClose,
						className: "rounded-md border border-slate-300 px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50",
						children: "Cancel"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "submit",
						className: "rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-700",
						children: initial ? "Save Changes" : "Add Member"
					})]
				})
			]
		})
	});
}
function HouseholdModal({ initial, puroksData, onSave, onClose }) {
	const [form, setForm] = (0, import_react.useState)({
		householdLeaderName: initial?.householdLeaderName ?? "",
		address: initial?.address ?? "",
		purokId: initial?.purokId ?? puroksData[0]?.id ?? 0
	});
	const set = (k, v) => setForm((f) => ({
		...f,
		[k]: v
	}));
	const handleSubmit = (e) => {
		e.preventDefault();
		if (!form.householdLeaderName.trim()) return;
		onSave({
			...form,
			purokId: Number(form.purokId)
		});
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ModalShell, {
		title: initial ? "Edit Household Leader" : "Add Household Leader",
		onClose,
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
			onSubmit: handleSubmit,
			className: "space-y-4",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
					label: "Household Leader Name",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
						className: inputCls,
						value: form.householdLeaderName,
						onChange: (e) => set("householdLeaderName", e.target.value),
						placeholder: "Last, First Middle",
						required: true
					})
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
					label: "Address",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
						className: inputCls,
						value: form.address,
						onChange: (e) => set("address", e.target.value),
						placeholder: "e.g. Blk 1 Lot 2, Street Name"
					})
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
					label: "Purok",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("select", {
						className: inputCls,
						value: form.purokId,
						onChange: (e) => set("purokId", e.target.value),
						children: puroksData.map((p) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
							value: p.id,
							children: p.name
						}, p.id))
					})
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex justify-end gap-2 pt-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						onClick: onClose,
						className: "rounded-md border border-slate-300 px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50",
						children: "Cancel"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "submit",
						className: "rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700",
						children: initial ? "Save Changes" : "Add Household"
					})]
				})
			]
		})
	});
}
function PurokModal({ initial, barangaysData, onSave, onClose }) {
	const [form, setForm] = (0, import_react.useState)({
		name: initial?.name ?? "",
		purokLeaderName: initial?.purokLeaderName ?? "",
		barangayId: initial?.barangayId ?? barangaysData[0]?.id ?? 0
	});
	const set = (k, v) => setForm((f) => ({
		...f,
		[k]: v
	}));
	const handleSubmit = (e) => {
		e.preventDefault();
		if (!form.name.trim() || !form.purokLeaderName.trim()) return;
		onSave({
			...form,
			barangayId: Number(form.barangayId)
		});
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ModalShell, {
		title: initial ? "Edit Purok Leader" : "Add Purok Leader",
		onClose,
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
			onSubmit: handleSubmit,
			className: "space-y-4",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
					label: "Purok Name",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
						className: inputCls,
						value: form.name,
						onChange: (e) => set("name", e.target.value),
						placeholder: "e.g. Purok 6 - Mapayapa",
						required: true
					})
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
					label: "Purok Leader Name",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
						className: inputCls,
						value: form.purokLeaderName,
						onChange: (e) => set("purokLeaderName", e.target.value),
						placeholder: "Last, First Middle",
						required: true
					})
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
					label: "Barangay",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("select", {
						className: inputCls,
						value: form.barangayId,
						onChange: (e) => set("barangayId", e.target.value),
						children: barangaysData.map((b) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
							value: b.id,
							children: b.name
						}, b.id))
					})
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex justify-end gap-2 pt-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						onClick: onClose,
						className: "rounded-md border border-slate-300 px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50",
						children: "Cancel"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "submit",
						className: "rounded-md bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700",
						children: initial ? "Save Changes" : "Add Purok"
					})]
				})
			]
		})
	});
}
function PurokCard({ purok, householdsData, membersData, onEdit, onViewMembers }) {
	const purokHouseholds = householdsData.filter((h) => h.purokId === purok.id);
	const purokMembers = membersData.filter((m) => purokHouseholds.some((h) => h.id === m.householdId));
	const scCount = purokMembers.filter((m) => m.isSC).length;
	const pwdCount = purokMembers.filter((m) => m.isPWD).length;
	const ipCount = purokMembers.filter((m) => m.isIP).length;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "rounded-lg border border-slate-200 bg-white p-5 shadow-sm",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mb-4 flex items-start justify-between",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "font-semibold",
					children: purok.name
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
					className: "text-xs text-slate-500",
					children: ["Leader: ", purok.purokLeaderName]
				})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					onClick: onEdit,
					className: "rounded p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Pencil, { className: "h-3.5 w-3.5" })
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mb-4 grid grid-cols-2 gap-2 text-center",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "rounded-md bg-slate-50 py-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-lg font-bold",
						children: purokHouseholds.length
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-[11px] text-slate-500",
						children: "Households"
					})]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "rounded-md bg-slate-50 py-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-lg font-bold",
						children: purokMembers.length
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-[11px] text-slate-500",
						children: "Members"
					})]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mb-4 flex flex-wrap gap-1.5",
				children: [
					scCount > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
						className: "inline-flex items-center rounded-full bg-blue-100   px-2 py-0.5 text-[11px] font-semibold text-blue-800   ring-1 ring-inset ring-blue-600/20",
						children: ["SC: ", scCount]
					}),
					pwdCount > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
						className: "inline-flex items-center rounded-full bg-green-100  px-2 py-0.5 text-[11px] font-semibold text-green-800  ring-1 ring-inset ring-green-600/20",
						children: ["PWD: ", pwdCount]
					}),
					ipCount > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
						className: "inline-flex items-center rounded-full bg-orange-100 px-2 py-0.5 text-[11px] font-semibold text-orange-800 ring-1 ring-inset ring-orange-600/20",
						children: ["IP: ", ipCount]
					}),
					scCount === 0 && pwdCount === 0 && ipCount === 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "text-xs text-slate-300",
						children: "No sector tags"
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
				onClick: onViewMembers,
				className: "w-full rounded-md border border-slate-200 py-1.5 text-xs font-medium text-slate-600 transition-colors hover:bg-slate-50",
				children: "View Members →"
			})
		]
	});
}
function StatCard({ icon, label, value, onClick }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		onClick,
		className: `flex items-center gap-4 rounded-lg border border-slate-200 bg-white p-5 shadow-sm transition-all ${onClick ? "cursor-pointer hover:border-slate-300 hover:shadow-md" : ""}`,
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "flex h-11 w-11 items-center justify-center rounded-lg bg-slate-100",
			children: icon
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "text-2xl font-bold leading-none",
			children: value
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "mt-1 text-sm text-slate-500",
			children: label
		})] })]
	});
}
function MemberPanel({ member, householdById, purokById, barangayById, canManage, onClose, onEdit, onDelete }) {
	const household = householdById.get(member.householdId);
	const purok = household ? purokById.get(household.purokId) : void 0;
	const barangay = purok ? barangayById.get(purok.barangayId) : void 0;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "fixed inset-0 z-50",
		role: "dialog",
		"aria-modal": "true",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "absolute inset-0 bg-slate-900/40",
			onClick: onClose
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "absolute right-0 top-0 flex h-full w-full max-w-md flex-col bg-white shadow-xl",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex items-start justify-between border-b border-slate-200 px-6 py-4",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
					className: "text-base font-semibold",
					children: member.fullName
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
					className: "text-sm text-slate-500",
					children: ["Precinct No. ", member.pn]
				})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-center gap-1",
					children: [canManage && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
						onClick: onEdit,
						className: "flex items-center gap-1 rounded-md border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-50",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Pencil, { className: "h-3.5 w-3.5" }), " Edit"]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
						onClick: onDelete,
						className: "flex items-center gap-1 rounded-md border border-red-200 px-3 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Trash2, { className: "h-3.5 w-3.5" }), " Delete"]
					})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						onClick: onClose,
						"aria-label": "Close",
						className: "ml-1 rounded-md p-1 text-slate-400 hover:bg-slate-100",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(X, { className: "h-5 w-5" })
					})]
				})]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex-1 space-y-6 overflow-y-auto px-6 py-5",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex flex-wrap gap-2",
						children: [
							sectorBadges(member).length === 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "text-sm text-slate-400",
								children: "No special sector tags"
							}),
							member.isSC && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
								className: "inline-flex items-center gap-1 rounded-full bg-blue-100   px-2.5 py-1 text-xs font-semibold text-blue-800   ring-1 ring-inset ring-blue-600/20",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Flag, { className: "h-3 w-3" }), " Senior Citizen"]
							}),
							member.isPWD && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
								className: "inline-flex items-center gap-1 rounded-full bg-green-100  px-2.5 py-1 text-xs font-semibold text-green-800  ring-1 ring-inset ring-green-600/20",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Accessibility, { className: "h-3 w-3" }), " PWD"]
							}),
							member.isIP && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
								className: "inline-flex items-center gap-1 rounded-full bg-orange-100 px-2.5 py-1 text-xs font-semibold text-orange-800 ring-1 ring-inset ring-orange-600/20",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Users, { className: "h-3 w-3" }), " Indigenous Person"]
							})
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Section, {
						title: "Personal Information",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Row, {
								label: "Age",
								value: String(member.age)
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Row, {
								label: "Civil Status",
								value: member.civilStatus
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Row, {
								label: "Religion",
								value: member.religion
							})
						]
					}),
					household && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Section, {
						title: "Household",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Row, {
							label: "Household Leader",
							value: household.householdLeaderName
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Row, {
							label: "Address",
							value: household.address
						})]
					}),
					purok && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Section, {
						title: "Purok",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Row, {
							label: "Purok",
							value: purok.name
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Row, {
							label: "Purok Leader",
							value: purok.purokLeaderName
						})]
					}),
					barangay && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Section, {
						title: "Barangay",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Row, {
							label: "Barangay",
							value: barangay.name
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Row, {
							label: "Barangay Captain",
							value: barangay.barangayCaptainName
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Section, {
						title: "Remarks",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "px-3 py-2 text-sm text-slate-600",
							children: member.remarks || "No remarks on record."
						})
					})
				]
			})]
		})]
	});
}
function Section({ title, children }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
		className: "mb-2 text-xs font-semibold uppercase tracking-wide text-slate-400",
		children: title
	}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "divide-y divide-slate-100 rounded-md border border-slate-200",
		children
	})] });
}
function Row({ label, value }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex justify-between gap-4 px-3 py-2 text-sm",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
			className: "text-slate-500",
			children: label
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
			className: "text-right font-medium",
			children: value
		})]
	});
}
function LoginGate({ puroksData, householdsData, onSignIn }) {
	const [role, setRole] = (0, import_react.useState)("household");
	const [selectedId, setSelectedId] = (0, import_react.useState)(0);
	const options = (0, import_react.useMemo)(() => {
		if (role === "purok") return puroksData.map((p) => ({
			id: p.id,
			label: `${p.name} — ${p.purokLeaderName}`
		}));
		if (role === "household") return householdsData.map((h) => ({
			id: h.id,
			label: `${h.householdLeaderName}`
		}));
		return [];
	}, [
		role,
		puroksData,
		householdsData
	]);
	const handleSubmit = (e) => {
		e.preventDefault();
		if (role === "admin") {
			onSignIn({ type: "admin" });
			return;
		}
		const id = selectedId || options[0]?.id;
		if (!id) return;
		onSignIn({
			type: role,
			id
		});
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-4",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "pointer-events-none absolute inset-0 overflow-hidden opacity-10",
			children: Array.from({ length: 20 }).map((_, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "absolute rounded-full border border-white",
				style: {
					width: `${60 + i * 40}px`,
					height: `${60 + i * 40}px`,
					top: "50%",
					left: "50%",
					transform: "translate(-50%, -50%)"
				}
			}, i))
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "relative w-full max-w-md",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "overflow-hidden rounded-2xl bg-white shadow-2xl",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "bg-slate-900 px-8 py-6 text-white",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-white/10 ring-1 ring-white/20",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(House, { className: "h-6 w-6" })
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
							className: "text-xl font-bold tracking-tight",
							children: "Barangay RMS"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-1 text-sm text-slate-400",
							children: "Resident Management System"
						})
					]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
					onSubmit: handleSubmit,
					className: "space-y-5 p-8",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mb-1 text-lg font-semibold text-slate-800",
							children: "Sign in"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-sm text-slate-500",
							children: "Select your role to access the system"
						})] }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
							className: "mb-2 block text-xs font-semibold uppercase tracking-wide text-slate-500",
							children: "Your Role"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "grid grid-cols-3 gap-3",
							children: [
								[
									"admin",
									"Admin",
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(UserCheck, { className: "h-5 w-5" }, "a")
								],
								[
									"purok",
									"Purok Ldr",
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(MapPin, { className: "h-5 w-5" }, "p")
								],
								[
									"household",
									"House Ldr",
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(House, { className: "h-5 w-5" }, "h")
								]
							].map(([type, lbl, icon]) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
								type: "button",
								onClick: () => {
									setRole(type);
									setSelectedId(0);
								},
								className: `flex flex-col items-center justify-center gap-2 rounded-xl border-2 p-3 text-xs font-medium transition-all ${role === type ? "border-slate-900 bg-slate-900 text-white shadow-lg scale-[1.02]" : "border-slate-200 text-slate-600 hover:border-slate-400 hover:bg-slate-50"}`,
								children: [icon, /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "text-center",
									children: lbl
								})]
							}, type))
						})] }),
						role !== "admin" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
							className: "mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-500",
							children: role === "household" ? "Select Your Household" : "Select Your Purok"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("select", {
							value: selectedId || options[0]?.id || 0,
							onChange: (e) => setSelectedId(Number(e.target.value)),
							className: "w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-800 outline-none transition focus:border-slate-600 focus:ring-2 focus:ring-slate-200",
							children: options.map((o) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
								value: o.id,
								children: o.label
							}, o.id))
						})] }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
							type: "submit",
							className: "flex w-full items-center justify-center gap-2 rounded-xl bg-slate-900 py-3 text-sm font-semibold text-white shadow-md transition-all hover:bg-slate-700 hover:shadow-lg active:scale-[0.98]",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(LogIn, { className: "h-4 w-4" }), "Sign In"]
						})
					]
				})]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-4 text-center text-xs text-slate-500",
				children: "Barangay Resident Management System · Powered by Purok"
			})]
		})]
	});
}
//#endregion
export { Index as component };
