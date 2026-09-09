import { o as __toESM } from "../_runtime.mjs";
import { n as require_jsx_runtime, r as require_react } from "../_libs/react+tanstack__react-query.mjs";
import { r as useStore } from "./store-D6_VlWDf.mjs";
import { _ as useNavigate } from "../_libs/@tanstack/react-router+[...].mjs";
import { A as Accessibility, b as House, k as Activity, m as MapPin, n as Users, s as Target, x as Flag, y as Landmark } from "../_libs/lucide-react.mjs";
import { t as StatCard } from "./stat-card-Bf1ozPwh.mjs";
import { a as Bar, c as ResponsiveContainer, i as XAxis, l as Tooltip, n as BarChart, o as Pie, r as YAxis, s as Cell, t as PieChart, u as Legend } from "../_libs/recharts+[...].mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/dashboard-DKPrhHpW.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function PrecinctTally() {
	const { state: { members } } = useStore();
	const [targetVotes, setTargetVotes] = (0, import_react.useState)(1836);
	const stats = (0, import_react.useMemo)(() => {
		const tally = {};
		let grandPL = 0;
		let grandHL = 0;
		let grandHM = 0;
		let grandTotal = 0;
		let grandRawCount = 0;
		members.forEach((m) => {
			const pn = m.pn?.trim() || "Unassigned";
			if (!tally[pn]) tally[pn] = {
				pl: 0,
				hl: 0,
				hm: 0,
				total: 0,
				rawCount: 0
			};
			const pl = m.is_purok_leader_indicator ? 1 : 0;
			const hl = m.is_household_leader ? 1 : 0;
			const hm = m.is_household_member ? 1 : 0;
			tally[pn].pl += pl;
			tally[pn].hl += hl;
			tally[pn].hm += hm;
			tally[pn].total += pl + hl + hm;
			tally[pn].rawCount += 1;
			grandPL += pl;
			grandHL += hl;
			grandHM += hm;
			grandTotal += pl + hl + hm;
			grandRawCount += 1;
		});
		return {
			tally,
			sortedPrecincts: Object.keys(tally).sort((a, b) => a.localeCompare(b, void 0, { numeric: true })),
			grandPL,
			grandHL,
			grandHM,
			grandTotal,
			grandRawCount
		};
	}, [members]);
	const tallyDiff = stats.grandTotal - targetVotes;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "mt-8 rounded-xl bg-white p-6 shadow-sm border border-slate-200",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "mb-6 flex items-center gap-3 border-b border-slate-100 pb-4",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Users, { className: "h-5 w-5" })
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
				className: "text-lg font-bold text-slate-800",
				children: "Precinct Tally & Analytics Dashboard"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-sm text-slate-500",
				children: "Pivot table aggregation by precinct and target tracking."
			})] })]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "grid grid-cols-1 gap-6 lg:grid-cols-12",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "lg:col-span-6 overflow-x-auto rounded-lg border border-slate-300 shadow-sm",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("table", {
						className: "w-full text-left text-sm text-slate-700",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("thead", {
								className: "bg-slate-100 text-xs font-semibold uppercase tracking-wider text-slate-600",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", { children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
										className: "border-b border-r border-slate-300 px-4 py-3",
										children: "Row Labels"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
										className: "border-b border-r border-slate-300 px-4 py-3 text-right",
										children: "Count of PL"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
										className: "border-b border-r border-slate-300 px-4 py-3 text-right",
										children: "Count of HL"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
										className: "border-b border-r border-slate-300 px-4 py-3 text-right",
										children: "Count of HM"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
										className: "border-b border-slate-300 px-4 py-3 text-right text-indigo-700",
										children: "TOTAL"
									})
								] })
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("tbody", {
								className: "divide-y divide-slate-200 bg-white",
								children: stats.sortedPrecincts.map((pn, idx) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", {
									className: idx % 2 === 0 ? "bg-white" : "bg-slate-50",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
											className: "border-r border-slate-300 px-4 py-2 font-medium",
											children: pn
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
											className: "border-r border-slate-300 px-4 py-2 text-right",
											children: stats.tally[pn].pl
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
											className: "border-r border-slate-300 px-4 py-2 text-right",
											children: stats.tally[pn].hl
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
											className: "border-r border-slate-300 px-4 py-2 text-right",
											children: stats.tally[pn].hm
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
											className: "px-4 py-2 text-right font-semibold text-indigo-700",
											children: stats.tally[pn].total
										})
									]
								}, pn))
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("tfoot", {
								className: "bg-blue-100 text-sm font-bold text-slate-800",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", { children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
										className: "border-t border-r border-slate-300 px-4 py-3",
										children: "Grand Total"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
										className: "border-t border-r border-slate-300 px-4 py-3 text-right",
										children: stats.grandPL
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
										className: "border-t border-r border-slate-300 px-4 py-3 text-right",
										children: stats.grandHL
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
										className: "border-t border-r border-slate-300 px-4 py-3 text-right",
										children: stats.grandHM
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
										className: "border-t border-slate-300 px-4 py-3 text-right text-indigo-800",
										children: stats.grandTotal
									})
								] })
							})
						]
					})
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "lg:col-span-3 overflow-x-auto rounded-lg border border-slate-300 shadow-sm",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("table", {
						className: "w-full text-left text-sm text-slate-700",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("thead", {
								className: "bg-slate-100 text-xs font-semibold uppercase tracking-wider text-slate-600",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
									className: "border-b border-r border-slate-300 px-4 py-3",
									children: "Row Labels"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
									className: "border-b border-slate-300 px-4 py-3 text-right",
									children: "Count of Precinct"
								})] })
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("tbody", {
								className: "divide-y divide-slate-200 bg-white",
								children: stats.sortedPrecincts.map((pn, idx) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", {
									className: idx % 2 === 0 ? "bg-white" : "bg-slate-50",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
										className: "border-r border-slate-300 px-4 py-2 font-medium",
										children: pn
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
										className: "px-4 py-2 text-right",
										children: stats.tally[pn].rawCount
									})]
								}, pn))
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("tfoot", {
								className: "bg-blue-100 text-sm font-bold text-slate-800",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
									className: "border-t border-r border-slate-300 px-4 py-3",
									children: "Grand Total"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
									className: "border-t border-slate-300 px-4 py-3 text-right",
									children: stats.grandRawCount
								})] })
							})
						]
					})
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex flex-col gap-4 lg:col-span-3",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex flex-col overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex items-center gap-2 bg-slate-50 px-4 py-3 border-b border-slate-100",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Target, { className: "h-4 w-4 text-slate-500" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
								className: "text-xs font-bold uppercase tracking-wider text-slate-600",
								children: "Target Votes"
							})]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "p-4",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
								type: "number",
								value: targetVotes,
								onChange: (e) => setTargetVotes(Number(e.target.value)),
								className: "w-full rounded-lg border border-slate-300 bg-slate-50 px-4 py-3 text-center text-3xl font-black text-slate-800 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
							})
						})]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex flex-col overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex items-center gap-2 bg-slate-50 px-4 py-3 border-b border-slate-100",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Activity, { className: "h-4 w-4 text-slate-500" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
								className: "text-xs font-bold uppercase tracking-wider text-slate-600",
								children: "Tally Difference"
							})]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "p-4 text-center",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: `text-4xl font-black tracking-tight ${tallyDiff < 0 ? "text-red-600" : "text-emerald-600"}`,
								children: [tallyDiff > 0 ? "+" : "", tallyDiff.toLocaleString()]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "mt-2 text-xs font-medium text-slate-500",
								children: tallyDiff < 0 ? "Below Target" : "Above Target"
							})]
						})]
					})]
				})
			]
		})]
	});
}
var CHART_COLORS = [
	"hsl(220, 70%, 55%)",
	"hsl(160, 60%, 45%)",
	"hsl(30, 80%, 55%)",
	"hsl(280, 60%, 55%)",
	"hsl(350, 70%, 55%)",
	"hsl(190, 60%, 50%)"
];
function DashboardPage() {
	const { state } = useStore();
	const navigate = useNavigate();
	(0, import_react.useEffect)(() => {
		if (state.session?.role !== "Admin") navigate({ to: "/my-dashboard" });
	}, [state.session, navigate]);
	const { barangays, puroks, households, members } = state;
	const scCount = members.filter((m) => m.sc).length;
	const pwdCount = members.filter((m) => m.pwd).length;
	const ipCount = members.filter((m) => m.ip).length;
	const membersPerPurok = (0, import_react.useMemo)(() => {
		const hhByPurok = /* @__PURE__ */ new Map();
		for (const h of households) {
			if (!hhByPurok.has(h.purokId)) hhByPurok.set(h.purokId, /* @__PURE__ */ new Set());
			hhByPurok.get(h.purokId).add(h.id);
		}
		return puroks.map((p) => {
			const hhIds = hhByPurok.get(p.id) ?? /* @__PURE__ */ new Set();
			const count = members.filter((m) => hhIds.has(m.householdId)).length;
			return {
				name: p.name.split(" - ")[0],
				count
			};
		});
	}, [
		puroks,
		households,
		members
	]);
	const sectorData = (0, import_react.useMemo)(() => [
		{
			name: "Senior Citizen",
			value: scCount,
			color: "hsl(220, 70%, 55%)"
		},
		{
			name: "PWD",
			value: pwdCount,
			color: "hsl(160, 60%, 45%)"
		},
		{
			name: "Indigenous",
			value: ipCount,
			color: "hsl(30, 80%, 55%)"
		}
	].filter((d) => d.value > 0), [
		scCount,
		pwdCount,
		ipCount
	]);
	const ageData = (0, import_react.useMemo)(() => {
		const buckets = [
			{
				range: "0–17",
				min: 0,
				max: 17,
				count: 0
			},
			{
				range: "18–30",
				min: 18,
				max: 30,
				count: 0
			},
			{
				range: "31–45",
				min: 31,
				max: 45,
				count: 0
			},
			{
				range: "46–60",
				min: 46,
				max: 60,
				count: 0
			},
			{
				range: "61+",
				min: 61,
				max: 999,
				count: 0
			}
		];
		for (const m of members) {
			const bucket = buckets.find((b) => m.age >= b.min && m.age <= b.max);
			if (bucket) bucket.count++;
		}
		return buckets.map((b) => ({
			name: b.range,
			count: b.count
		}));
	}, [members]);
	const barangaySummaries = (0, import_react.useMemo)(() => barangays.map((b) => {
		const bPuroks = puroks.filter((p) => p.barangayId === b.id);
		const bHouseholds = households.filter((h) => bPuroks.some((p) => p.id === h.purokId));
		const bMembers = members.filter((m) => bHouseholds.some((h) => h.id === m.householdId));
		return {
			...b,
			purokCount: bPuroks.length,
			householdCount: bHouseholds.length,
			memberCount: bMembers.length
		};
	}), [
		barangays,
		puroks,
		households,
		members
	]);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", {
		className: "border-b border-slate-200 bg-white px-6 py-4",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
			className: "text-lg font-semibold",
			children: "Overview"
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "text-sm text-slate-500",
			children: "Resident and household records across all puroks"
		})]
	}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-6 p-6",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "grid grid-cols-2 gap-4 lg:grid-cols-4 xl:grid-cols-7",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatCard, {
						icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Landmark, { className: "h-5 w-5 text-amber-600" }),
						label: "Barangays",
						value: barangays.length,
						accent: "hsl(40, 80%, 50%)"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatCard, {
						icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(MapPin, { className: "h-5 w-5 text-indigo-600" }),
						label: "Puroks",
						value: puroks.length,
						accent: "hsl(240, 60%, 55%)",
						onClick: () => void navigate({ to: "/puroks" })
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatCard, {
						icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(House, { className: "h-5 w-5 text-emerald-600" }),
						label: "Households",
						value: households.length,
						accent: "hsl(160, 60%, 45%)"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatCard, {
						icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Users, { className: "h-5 w-5 text-sky-600" }),
						label: "Members",
						value: members.length,
						accent: "hsl(200, 70%, 50%)",
						onClick: () => void navigate({ to: "/members" })
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatCard, {
						icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Flag, { className: "h-5 w-5 text-blue-600" }),
						label: "Senior Citizens",
						value: scCount,
						accent: "hsl(220, 70%, 55%)"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatCard, {
						icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Accessibility, { className: "h-5 w-5 text-green-600" }),
						label: "PWD",
						value: pwdCount,
						accent: "hsl(160, 60%, 45%)"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatCard, {
						icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Users, { className: "h-5 w-5 text-orange-600" }),
						label: "Indigenous",
						value: ipCount,
						accent: "hsl(30, 80%, 55%)"
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "grid grid-cols-1 gap-6 lg:grid-cols-2",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "rounded-xl border border-slate-200 bg-white p-5 shadow-sm",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
							className: "mb-4 text-sm font-semibold text-slate-700",
							children: "Members per Purok"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "h-64",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ResponsiveContainer, {
								width: "100%",
								height: "100%",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(BarChart, {
									data: membersPerPurok,
									margin: {
										top: 5,
										right: 10,
										left: -10,
										bottom: 5
									},
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(XAxis, {
											dataKey: "name",
											tick: { fontSize: 11 }
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(YAxis, { tick: { fontSize: 11 } }),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Tooltip, { contentStyle: {
											borderRadius: "8px",
											fontSize: "12px"
										} }),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Bar, {
											dataKey: "count",
											fill: "hsl(220, 70%, 55%)",
											radius: [
												4,
												4,
												0,
												0
											]
										})
									]
								})
							})
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "rounded-xl border border-slate-200 bg-white p-5 shadow-sm",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
							className: "mb-4 text-sm font-semibold text-slate-700",
							children: "Sector Distribution"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "h-64",
							children: sectorData.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "flex h-full items-center justify-center text-sm text-slate-400",
								children: "No sector data"
							}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ResponsiveContainer, {
								width: "100%",
								height: "100%",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(PieChart, { children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Pie, {
										data: sectorData,
										cx: "50%",
										cy: "50%",
										innerRadius: 50,
										outerRadius: 85,
										paddingAngle: 4,
										dataKey: "value",
										label: ({ name, value }) => `${name}: ${value}`,
										children: sectorData.map((entry, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Cell, { fill: entry.color || CHART_COLORS[i % CHART_COLORS.length] }, entry.name))
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Legend, {
										iconType: "circle",
										wrapperStyle: { fontSize: "12px" }
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Tooltip, { contentStyle: {
										borderRadius: "8px",
										fontSize: "12px"
									} })
								] })
							})
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "rounded-xl border border-slate-200 bg-white p-5 shadow-sm",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
							className: "mb-4 text-sm font-semibold text-slate-700",
							children: "Age Distribution"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "h-64",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ResponsiveContainer, {
								width: "100%",
								height: "100%",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(BarChart, {
									data: ageData,
									margin: {
										top: 5,
										right: 10,
										left: -10,
										bottom: 5
									},
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(XAxis, {
											dataKey: "name",
											tick: { fontSize: 11 }
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(YAxis, { tick: { fontSize: 11 } }),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Tooltip, { contentStyle: {
											borderRadius: "8px",
											fontSize: "12px"
										} }),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Bar, {
											dataKey: "count",
											fill: "hsl(280, 60%, 55%)",
											radius: [
												4,
												4,
												0,
												0
											]
										})
									]
								})
							})
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "space-y-4",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
							className: "text-sm font-semibold text-slate-700",
							children: "Barangay Summary"
						}), barangaySummaries.map((b) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "rounded-xl border border-slate-200 bg-white p-5 shadow-sm",
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
									["Puroks", b.purokCount],
									["Households", b.householdCount],
									["Members", b.memberCount]
								].map(([label, val]) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "rounded-lg bg-slate-50 py-2.5",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "text-xl font-bold",
										children: val
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "text-[11px] text-slate-500",
										children: label
									})]
								}, label))
							})]
						}, b.id))]
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PrecinctTally, {})
		]
	})] });
}
//#endregion
export { DashboardPage as component };
