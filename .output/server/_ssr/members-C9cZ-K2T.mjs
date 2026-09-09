import { o as __toESM } from "../_runtime.mjs";
import { n as require_jsx_runtime, r as require_react } from "../_libs/react+tanstack__react-query.mjs";
import { r as useStore } from "./store-D6_VlWDf.mjs";
import { A as Accessibility, O as ChevronDown, f as Plus, n as Users, o as Trash2, p as Pencil, t as X, u as Search, x as Flag } from "../_libs/lucide-react.mjs";
import { i as inputCls, n as FormActions, r as ModalShell, t as Field } from "./modal-shell-m_E5fOLw.mjs";
import { n as memberFullName, t as MemberFormModal } from "./member-form-modal-BmtZKKRt.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/members-C9cZ-K2T.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function AdvancedFilter({ query, onQueryChange, allLastNames, selectedLastNames, onSelectedLastNamesChange, sectorFilter, onSectorFilterChange, purokOptions, purokFilter, onPurokFilterChange, barangayOptions, barangayFilter, onBarangayFilterChange }) {
	const hasActiveFilters = query || selectedLastNames.length > 0 || sectorFilter !== "all" || purokFilter !== "all" || barangayFilter !== "all";
	const clearAll = () => {
		onQueryChange("");
		onSelectedLastNamesChange([]);
		onSectorFilterChange("all");
		onPurokFilterChange("all");
		onBarangayFilterChange("all");
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "relative",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Search, { className: "pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
					value: query,
					onChange: (e) => onQueryChange(e.target.value),
					placeholder: "Search by name, precinct, or multi-keyword (space separated)…",
					className: "w-full rounded-lg border border-slate-300 bg-white py-2.5 pl-9 pr-3 text-sm outline-none transition focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex flex-wrap items-center gap-2",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(MultiSelectDropdown, {
						label: "Last Name",
						options: allLastNames,
						selected: selectedLastNames,
						onChange: onSelectedLastNamesChange
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("select", {
						value: barangayFilter,
						onChange: (e) => {
							onBarangayFilterChange(e.target.value);
							onPurokFilterChange("all");
						},
						className: "rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none transition focus:border-slate-500",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
							value: "all",
							children: "All Barangays"
						}), barangayOptions.map((b) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
							value: b.id,
							children: b.label
						}, b.id))]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("select", {
						value: purokFilter,
						onChange: (e) => onPurokFilterChange(e.target.value),
						className: "rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none transition focus:border-slate-500",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
							value: "all",
							children: "All Puroks"
						}), purokOptions.map((p) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
							value: p.id,
							children: p.label
						}, p.id))]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("select", {
						value: sectorFilter,
						onChange: (e) => onSectorFilterChange(e.target.value),
						className: "rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none transition focus:border-slate-500",
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
					}),
					hasActiveFilters && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
						onClick: clearAll,
						className: "flex items-center gap-1 rounded-lg border border-red-200 px-3 py-2 text-xs font-medium text-red-600 transition-colors hover:bg-red-50",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(X, { className: "h-3 w-3" }), " Clear All"]
					})
				]
			}),
			selectedLastNames.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex flex-wrap gap-1.5",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "text-xs text-slate-500 leading-6",
					children: "Filtered by:"
				}), selectedLastNames.map((name) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
					className: "inline-flex items-center gap-1 rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-700",
					children: [name, /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						onClick: () => onSelectedLastNamesChange(selectedLastNames.filter((n) => n !== name)),
						className: "rounded-full p-0.5 hover:bg-slate-200",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(X, { className: "h-2.5 w-2.5" })
					})]
				}, name))]
			})
		]
	});
}
function MultiSelectDropdown({ label, options, selected, onChange }) {
	const [open, setOpen] = (0, import_react.useState)(false);
	const [search, setSearch] = (0, import_react.useState)("");
	const filtered = (0, import_react.useMemo)(() => {
		const q = search.toLowerCase();
		return q ? options.filter((o) => o.toLowerCase().includes(q)) : options;
	}, [options, search]);
	const toggle = (name) => {
		onChange(selected.includes(name) ? selected.filter((n) => n !== name) : [...selected, name]);
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "relative",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
			type: "button",
			onClick: () => setOpen(!open),
			className: `flex items-center gap-1.5 rounded-lg border px-3 py-2 text-sm transition-colors ${selected.length > 0 ? "border-slate-500 bg-slate-50 font-medium text-slate-800" : "border-slate-300 text-slate-600 hover:border-slate-400"}`,
			children: [
				label,
				" ",
				selected.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "rounded-full bg-slate-800 px-1.5 py-0.5 text-[10px] font-bold text-white",
					children: selected.length
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChevronDown, { className: `h-3.5 w-3.5 transition-transform ${open ? "rotate-180" : ""}` })
			]
		}), open && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "fixed inset-0 z-40",
			onClick: () => setOpen(false)
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "absolute left-0 top-full z-50 mt-1 w-64 rounded-xl border border-slate-200 bg-white shadow-lg",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "border-b border-slate-100 p-2",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
						value: search,
						onChange: (e) => setSearch(e.target.value),
						placeholder: "Search names…",
						className: "w-full rounded-md border border-slate-200 px-2.5 py-1.5 text-xs outline-none focus:border-slate-400",
						autoFocus: true
					})
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "max-h-48 overflow-y-auto p-1",
					children: [filtered.length === 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "px-3 py-2 text-xs text-slate-400",
						children: "No matches"
					}), filtered.map((name) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
						className: "flex items-center gap-2 rounded-md px-2.5 py-1.5 text-sm cursor-pointer hover:bg-slate-50",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
							type: "checkbox",
							checked: selected.includes(name),
							onChange: () => toggle(name),
							className: "h-3.5 w-3.5 rounded border-slate-300 accent-slate-800"
						}), name]
					}, name))]
				}),
				selected.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "border-t border-slate-100 p-2",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						onClick: () => onChange([]),
						className: "w-full rounded-md py-1 text-xs font-medium text-red-600 hover:bg-red-50",
						children: "Clear selection"
					})
				})
			]
		})] })]
	});
}
function sectorBadges$1(m) {
	const badges = [];
	if (m.sc) badges.push({
		label: "SC",
		fullLabel: "Senior Citizen",
		icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Flag, { className: "h-3 w-3" }),
		className: "bg-blue-100 text-blue-800 ring-blue-600/20"
	});
	if (m.pwd) badges.push({
		label: "PWD",
		fullLabel: "PWD",
		icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Accessibility, { className: "h-3 w-3" }),
		className: "bg-green-100 text-green-800 ring-green-600/20"
	});
	if (m.ip) badges.push({
		label: "IP",
		fullLabel: "Indigenous Person",
		icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Users, { className: "h-3 w-3" }),
		className: "bg-orange-100 text-orange-800 ring-orange-600/20"
	});
	return badges;
}
function DetailRow({ label, value }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex justify-between gap-4 px-3 py-2.5 text-sm",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
			className: "text-slate-500",
			children: label
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
			className: "text-right font-medium text-slate-800",
			children: value || "—"
		})]
	});
}
function DetailSection({ title, children }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
		className: "mb-2 text-xs font-semibold uppercase tracking-wide text-slate-400",
		children: title
	}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "divide-y divide-slate-100 rounded-lg border border-slate-200",
		children
	})] });
}
function MemberDetailPanel({ member, householdById, purokById, barangayById, canManage, onClose, onEdit, onDelete }) {
	const household = householdById.get(member.householdId);
	const purok = household ? purokById.get(household.purokId) : void 0;
	const barangay = purok ? barangayById.get(purok.barangayId) : void 0;
	const fullName = memberFullName(member);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "fixed inset-0 z-50",
		role: "dialog",
		"aria-modal": "true",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "absolute inset-0 bg-slate-900/50 backdrop-blur-sm",
			onClick: onClose
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "absolute right-0 top-0 flex h-full w-full max-w-md flex-col bg-white shadow-2xl animate-in slide-in-from-right duration-200",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex items-start justify-between border-b border-slate-200 px-6 py-4",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
					className: "text-base font-semibold",
					children: fullName
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
					className: "text-sm text-slate-500",
					children: ["Precinct No. ", member.pn || "—"]
				})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-center gap-1",
					children: [canManage && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
						onClick: onEdit,
						className: "flex items-center gap-1 rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-600 transition-colors hover:bg-slate-50",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Pencil, { className: "h-3.5 w-3.5" }), " Edit"]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
						onClick: onDelete,
						className: "flex items-center gap-1 rounded-lg border border-red-200 px-3 py-1.5 text-xs font-medium text-red-600 transition-colors hover:bg-red-50",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Trash2, { className: "h-3.5 w-3.5" }), " Delete"]
					})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						onClick: onClose,
						"aria-label": "Close",
						className: "ml-1 rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-slate-100",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(X, { className: "h-5 w-5" })
					})]
				})]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex-1 space-y-5 overflow-y-auto px-6 py-5",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex flex-wrap gap-2",
						children: [sectorBadges$1(member).length === 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "text-sm text-slate-400",
							children: "No special sector tags"
						}), sectorBadges$1(member).map((b) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
							className: `inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset ${b.className}`,
							children: [
								b.icon,
								" ",
								b.fullLabel
							]
						}, b.label))]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DetailSection, {
						title: "Personal Information",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DetailRow, {
								label: "Last Name",
								value: member.lastName
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DetailRow, {
								label: "First Name",
								value: member.firstName
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DetailRow, {
								label: "Middle Name",
								value: member.middleName
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DetailRow, {
								label: "Age",
								value: String(member.age)
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DetailRow, {
								label: "Civil Status",
								value: member.status
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DetailRow, {
								label: "Religion",
								value: member.religion
							})
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DetailSection, {
						title: "Excel / Record Data",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DetailRow, {
								label: "Precinct",
								value: member.precinct
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DetailRow, {
								label: "No.",
								value: member.no
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DetailRow, {
								label: "PN",
								value: member.pn
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DetailRow, {
								label: "Code",
								value: member.code
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DetailRow, {
								label: "Address",
								value: member.address
							})
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DetailSection, {
						title: "Role Indicators",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DetailRow, {
								label: "Purok Leader (PI)",
								value: member.is_purok_leader_indicator ? "Yes" : "No"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DetailRow, {
								label: "Household Leader (HL)",
								value: member.is_household_leader ? "Yes" : "No"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DetailRow, {
								label: "Household Member (HM)",
								value: member.is_household_member ? "Yes" : "No"
							})
						]
					}),
					household && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DetailSection, {
						title: "Household",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DetailRow, {
							label: "Household Leader",
							value: household.householdLeaderName
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DetailRow, {
							label: "Address",
							value: household.address
						})]
					}),
					purok && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DetailSection, {
						title: "Purok",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DetailRow, {
							label: "Purok",
							value: purok.name
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DetailRow, {
							label: "Purok Leader",
							value: purok.purokLeaderName
						})]
					}),
					barangay && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DetailSection, {
						title: "Barangay",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DetailRow, {
							label: "Barangay",
							value: barangay.name
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DetailRow, {
							label: "Barangay Captain",
							value: barangay.barangayCaptainName
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DetailSection, {
						title: "Remarks",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "px-3 py-3 text-sm text-slate-600",
							children: member.remarks || "No remarks on record."
						})
					})
				]
			})]
		})]
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
		title: initial ? "Edit Household" : "Add Household",
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
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(FormActions, {
					onClose,
					submitLabel: initial ? "Save Changes" : "Add Household",
					submitColor: "bg-indigo-600 hover:bg-indigo-700"
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
		title: initial ? "Edit Purok" : "Add Purok",
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
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(FormActions, {
					onClose,
					submitLabel: initial ? "Save Changes" : "Add Purok",
					submitColor: "bg-emerald-600 hover:bg-emerald-700"
				})
			]
		})
	});
}
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
function MembersPage() {
	const store = useStore();
	const { state } = store;
	const session = state.session;
	const isAdmin = session.role === "Admin";
	const isPurokLeader = session.role === "Purok Leader";
	const [query, setQuery] = (0, import_react.useState)("");
	const [selectedLastNames, setSelectedLastNames] = (0, import_react.useState)([]);
	const [barangayFilter, setBarangayFilter] = (0, import_react.useState)("all");
	const [purokFilter, setPurokFilter] = (0, import_react.useState)("all");
	const [sectorFilter, setSectorFilter] = (0, import_react.useState)("all");
	const [sortKey, setSortKey] = (0, import_react.useState)("name");
	const [sortDir, setSortDir] = (0, import_react.useState)("asc");
	const [page, setPage] = (0, import_react.useState)(0);
	const [perPage, setPerPage] = (0, import_react.useState)(25);
	const [selected, setSelected] = (0, import_react.useState)(null);
	const [modal, setModal] = (0, import_react.useState)(null);
	const householdById = (0, import_react.useMemo)(() => new Map(state.households.map((h) => [h.id, h])), [state.households]);
	const purokById = (0, import_react.useMemo)(() => new Map(state.puroks.map((p) => [p.id, p])), [state.puroks]);
	const barangayById = (0, import_react.useMemo)(() => new Map(state.barangays.map((b) => [b.id, b])), [state.barangays]);
	const allLastNames = (0, import_react.useMemo)(() => {
		return [...new Set(state.members.map((m) => m.lastName).filter(Boolean))].sort();
	}, [state.members]);
	const visiblePuroks = (0, import_react.useMemo)(() => barangayFilter === "all" ? state.puroks : state.puroks.filter((p) => p.barangayId === Number(barangayFilter)), [barangayFilter, state.puroks]);
	const scopedMembers = (0, import_react.useMemo)(() => {
		if (isAdmin) return state.members;
		if (isPurokLeader) {
			const purokHH = new Set(state.households.filter((h) => h.purokId === session.linkedEntityId).map((h) => h.id));
			return state.members.filter((m) => purokHH.has(m.householdId));
		}
		return state.members.filter((m) => m.householdId === session.linkedEntityId);
	}, [
		state.members,
		state.households,
		isAdmin,
		isPurokLeader,
		session.linkedEntityId
	]);
	const filtered = (0, import_react.useMemo)(() => {
		const keywords = query.trim().toLowerCase().split(/\s+/).filter(Boolean);
		return scopedMembers.filter((m) => {
			const household = householdById.get(m.householdId);
			if (!household) return false;
			const purok = purokById.get(household.purokId);
			if (!purok) return false;
			if (barangayFilter !== "all" && purok.barangayId !== Number(barangayFilter)) return false;
			if (purokFilter !== "all" && household.purokId !== Number(purokFilter)) return false;
			if (sectorFilter === "SC" && !m.sc) return false;
			if (sectorFilter === "PWD" && !m.pwd) return false;
			if (sectorFilter === "IP" && !m.ip) return false;
			if (selectedLastNames.length > 0 && !selectedLastNames.includes(m.lastName)) return false;
			if (keywords.length > 0) {
				const text = `${memberFullName(m)} ${m.pn} ${m.precinct} ${m.address}`.toLowerCase();
				if (!keywords.every((kw) => text.includes(kw))) return false;
			}
			return true;
		});
	}, [
		scopedMembers,
		query,
		barangayFilter,
		purokFilter,
		sectorFilter,
		selectedLastNames,
		householdById,
		purokById
	]);
	const sorted = (0, import_react.useMemo)(() => {
		const arr = [...filtered];
		const dir = sortDir === "asc" ? 1 : -1;
		arr.sort((a, b) => {
			let cmp = 0;
			switch (sortKey) {
				case "name":
					cmp = memberFullName(a).localeCompare(memberFullName(b));
					break;
				case "pn":
					cmp = a.pn.localeCompare(b.pn);
					break;
				case "age":
					cmp = a.age - b.age;
					break;
				case "status":
					cmp = a.status.localeCompare(b.status);
					break;
				case "purok": {
					const pa = purokById.get(householdById.get(a.householdId)?.purokId ?? 0)?.name ?? "";
					const pb = purokById.get(householdById.get(b.householdId)?.purokId ?? 0)?.name ?? "";
					cmp = pa.localeCompare(pb);
					break;
				}
				case "household": {
					const ha = householdById.get(a.householdId)?.householdLeaderName ?? "";
					const hb = householdById.get(b.householdId)?.householdLeaderName ?? "";
					cmp = ha.localeCompare(hb);
					break;
				}
			}
			return cmp * dir;
		});
		return arr;
	}, [
		filtered,
		sortKey,
		sortDir,
		householdById,
		purokById
	]);
	const totalPages = Math.max(1, Math.ceil(sorted.length / perPage));
	const paginated = sorted.slice(page * perPage, (page + 1) * perPage);
	const toggleSort = (key) => {
		if (sortKey === key) setSortDir((d) => d === "asc" ? "desc" : "asc");
		else {
			setSortKey(key);
			setSortDir("asc");
		}
		setPage(0);
	};
	const sortIcon = (key) => sortKey === key ? sortDir === "asc" ? " ↑" : " ↓" : "";
	const saveMember = (data, id) => {
		if (id !== void 0) {
			store.updateMember(id, data);
			if (selected?.id === id) setSelected({
				...data,
				id
			});
		} else store.addMember(data);
		setModal(null);
	};
	const deleteMember = (id) => {
		store.deleteMember(id);
		if (selected?.id === id) setSelected(null);
	};
	const scopedHouseholds = (0, import_react.useMemo)(() => {
		if (isAdmin) return state.households;
		if (isPurokLeader) return state.households.filter((h) => h.purokId === session.linkedEntityId);
		return state.households.filter((h) => h.id === session.linkedEntityId);
	}, [
		state.households,
		isAdmin,
		isPurokLeader,
		session.linkedEntityId
	]);
	const rowBorderColor = (m) => {
		if (m.sc) return "border-l-blue-400";
		if (m.pwd) return "border-l-green-400";
		if (m.ip) return "border-l-orange-400";
		return "border-l-transparent";
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", {
			className: "border-b border-slate-200 bg-white px-6 py-4",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
				className: "text-lg font-semibold",
				children: "Members"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-sm text-slate-500",
				children: isAdmin ? "Manage residents, households and purok leaders" : `Members in your ${isPurokLeader ? "purok" : "household"}`
			})]
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "space-y-4 p-6",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex flex-wrap gap-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
						onClick: () => setModal({ kind: "add-member" }),
						className: "flex items-center gap-1.5 rounded-lg bg-slate-900 px-3 py-2 text-xs font-semibold text-white transition-colors hover:bg-slate-700",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Plus, { className: "h-3.5 w-3.5" }), " Add Member"]
					}), isAdmin && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
						onClick: () => setModal({ kind: "add-household" }),
						className: "flex items-center gap-1.5 rounded-lg bg-indigo-600 px-3 py-2 text-xs font-semibold text-white transition-colors hover:bg-indigo-700",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Plus, { className: "h-3.5 w-3.5" }), " Add Household"]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
						onClick: () => setModal({ kind: "add-purok" }),
						className: "flex items-center gap-1.5 rounded-lg bg-emerald-600 px-3 py-2 text-xs font-semibold text-white transition-colors hover:bg-emerald-700",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Plus, { className: "h-3.5 w-3.5" }), " Add Purok"]
					})] })]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AdvancedFilter, {
					query,
					onQueryChange: (v) => {
						setQuery(v);
						setPage(0);
					},
					allLastNames,
					selectedLastNames,
					onSelectedLastNamesChange: (v) => {
						setSelectedLastNames(v);
						setPage(0);
					},
					sectorFilter,
					onSectorFilterChange: (v) => {
						setSectorFilter(v);
						setPage(0);
					},
					purokOptions: visiblePuroks.map((p) => ({
						id: p.id,
						label: p.name
					})),
					purokFilter,
					onPurokFilterChange: (v) => {
						setPurokFilter(v);
						setPage(0);
					},
					barangayOptions: state.barangays.map((b) => ({
						id: b.id,
						label: b.name
					})),
					barangayFilter,
					onBarangayFilterChange: (v) => {
						setBarangayFilter(v);
						setPurokFilter("all");
						setPage(0);
					}
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "overflow-x-auto",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("table", {
							className: "w-full text-left text-sm",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("thead", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", {
								className: "border-b border-slate-200 bg-slate-50 text-xs uppercase tracking-wide text-slate-500",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("th", {
										className: "px-4 py-2.5 font-semibold cursor-pointer select-none hover:text-slate-700",
										onClick: () => toggleSort("name"),
										children: ["Name", sortIcon("name")]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("th", {
										className: "px-4 py-2.5 font-semibold cursor-pointer select-none hover:text-slate-700",
										onClick: () => toggleSort("pn"),
										children: ["PN", sortIcon("pn")]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("th", {
										className: "px-4 py-2.5 font-semibold cursor-pointer select-none hover:text-slate-700",
										onClick: () => toggleSort("purok"),
										children: ["Purok", sortIcon("purok")]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("th", {
										className: "px-4 py-2.5 font-semibold cursor-pointer select-none hover:text-slate-700",
										onClick: () => toggleSort("household"),
										children: ["Household", sortIcon("household")]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("th", {
										className: "px-4 py-2.5 font-semibold cursor-pointer select-none hover:text-slate-700",
										onClick: () => toggleSort("age"),
										children: ["Age", sortIcon("age")]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("th", {
										className: "px-4 py-2.5 font-semibold cursor-pointer select-none hover:text-slate-700",
										onClick: () => toggleSort("status"),
										children: ["Status", sortIcon("status")]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
										className: "px-4 py-2.5 font-semibold",
										children: "Sectors"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
										className: "px-4 py-2.5 font-semibold",
										children: "Remarks"
									}),
									(isAdmin || isPurokLeader) && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", { className: "px-4 py-2.5 font-semibold" })
								]
							}) }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tbody", { children: [paginated.map((m) => {
								const household = householdById.get(m.householdId);
								const purok = household ? purokById.get(household.purokId) : void 0;
								const badges = sectorBadges(m);
								return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", {
									className: `border-b border-slate-100 border-l-3 last:border-b-0 transition-colors hover:bg-slate-50 ${rowBorderColor(m)}`,
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
											className: "whitespace-nowrap px-4 py-2.5 font-medium cursor-pointer hover:text-indigo-600",
											onClick: () => setSelected(m),
											children: memberFullName(m)
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
											className: "whitespace-nowrap px-4 py-2.5 text-slate-600",
											children: m.pn || "—"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
											className: "whitespace-nowrap px-4 py-2.5 text-slate-600",
											children: purok?.name.split(" - ")[0] ?? "—"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
											className: "whitespace-nowrap px-4 py-2.5 text-slate-600",
											children: household?.householdLeaderName ?? "—"
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
										}),
										(isAdmin || isPurokLeader) && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
											className: "px-4 py-2.5",
											children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
												className: "flex items-center gap-1",
												children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
													onClick: () => setModal({
														kind: "edit-member",
														data: m
													}),
													className: "rounded-md p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700",
													title: "Edit",
													children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Pencil, { className: "h-3.5 w-3.5" })
												}), isAdmin && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
													onClick: () => {
														if (confirm(`Delete ${memberFullName(m)}?`)) deleteMember(m.id);
													},
													className: "rounded-md p-1 text-slate-400 hover:bg-red-50 hover:text-red-600",
													title: "Delete",
													children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Trash2, { className: "h-3.5 w-3.5" })
												})]
											})
										})
									]
								}, m.id);
							}), paginated.length === 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("tr", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
								colSpan: 9,
								className: "px-4 py-12 text-center text-sm text-slate-400",
								children: "No members match the current filters."
							}) })] })]
						})
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex items-center justify-between border-t border-slate-200 bg-slate-50 px-4 py-2.5",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
							className: "text-xs text-slate-500",
							children: [
								"Showing ",
								paginated.length,
								" of ",
								sorted.length,
								" members (page ",
								page + 1,
								"/",
								totalPages,
								")"
							]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex items-center gap-2",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("select", {
									value: perPage,
									onChange: (e) => {
										setPerPage(Number(e.target.value));
										setPage(0);
									},
									className: "rounded-md border border-slate-300 px-2 py-1 text-xs",
									children: [
										25,
										50,
										100
									].map((n) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("option", {
										value: n,
										children: [n, "/page"]
									}, n))
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
									disabled: page === 0,
									onClick: () => setPage((p) => p - 1),
									className: "rounded-md border border-slate-300 px-2.5 py-1 text-xs font-medium disabled:opacity-40 hover:bg-white",
									children: "Prev"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
									disabled: page >= totalPages - 1,
									onClick: () => setPage((p) => p + 1),
									className: "rounded-md border border-slate-300 px-2.5 py-1 text-xs font-medium disabled:opacity-40 hover:bg-white",
									children: "Next"
								})
							]
						})]
					})]
				}),
				isAdmin && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mb-2 flex items-center justify-between",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
						className: "text-sm font-semibold text-slate-700",
						children: "Household Leaders"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
						onClick: () => setModal({ kind: "add-household" }),
						className: "flex items-center gap-1 rounded-lg bg-indigo-50 px-3 py-1.5 text-xs font-medium text-indigo-700 hover:bg-indigo-100 transition-colors",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Plus, { className: "h-3.5 w-3.5" }), " Add Household"]
					})]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm",
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
							}) }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("tbody", { children: state.households.map((h) => {
								const purok = purokById.get(h.purokId);
								const hMembers = state.members.filter((m) => m.householdId === h.id);
								return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", {
									className: "border-b border-slate-100 last:border-0 hover:bg-slate-50",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
											className: "whitespace-nowrap px-4 py-2.5 font-medium",
											children: h.householdLeaderName
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
											className: "px-4 py-2.5 text-slate-600",
											children: h.address
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
											className: "whitespace-nowrap px-4 py-2.5 text-slate-600",
											children: purok?.name.split(" - ")[0] ?? "—"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
											className: "px-4 py-2.5 text-slate-600",
											children: hMembers.length
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
											className: "px-4 py-2.5",
											children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
												className: "flex items-center gap-1",
												children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
													onClick: () => setModal({
														kind: "edit-household",
														data: h
													}),
													className: "rounded-md p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700",
													children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Pencil, { className: "h-3.5 w-3.5" })
												}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
													onClick: () => {
														if (confirm("Delete household?")) store.deleteHousehold(h.id);
													},
													className: "rounded-md p-1 text-slate-400 hover:bg-red-50 hover:text-red-600",
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
				isAdmin && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mb-2 flex items-center justify-between",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
						className: "text-sm font-semibold text-slate-700",
						children: "Purok Leaders"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
						onClick: () => setModal({ kind: "add-purok" }),
						className: "flex items-center gap-1 rounded-lg bg-emerald-50 px-3 py-1.5 text-xs font-medium text-emerald-700 hover:bg-emerald-100 transition-colors",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Plus, { className: "h-3.5 w-3.5" }), " Add Purok"]
					})]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "overflow-x-auto",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("table", {
							className: "w-full text-left text-sm",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("thead", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("tr", {
								className: "border-b border-slate-200 bg-slate-50 text-xs uppercase tracking-wide text-slate-500",
								children: [
									"Purok Name",
									"Leader",
									"Barangay",
									"Households",
									"Members",
									""
								].map((h, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
									className: "px-4 py-2.5 font-semibold",
									children: h
								}, i))
							}) }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("tbody", { children: state.puroks.map((p) => {
								const barangay = barangayById.get(p.barangayId);
								const pHouses = state.households.filter((h) => h.purokId === p.id);
								const pMembers = state.members.filter((m) => pHouses.some((h) => h.id === m.householdId));
								return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", {
									className: "border-b border-slate-100 last:border-0 hover:bg-slate-50",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
											className: "whitespace-nowrap px-4 py-2.5 font-medium",
											children: p.name
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
											className: "whitespace-nowrap px-4 py-2.5 text-slate-600",
											children: p.purokLeaderName
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
											className: "whitespace-nowrap px-4 py-2.5 text-slate-600",
											children: barangay?.name.replace("Barangay ", "") ?? "—"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
											className: "px-4 py-2.5 text-slate-600",
											children: pHouses.length
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
											className: "px-4 py-2.5 text-slate-600",
											children: pMembers.length
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
											className: "px-4 py-2.5",
											children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
												className: "flex items-center gap-1",
												children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
													onClick: () => setModal({
														kind: "edit-purok",
														data: p
													}),
													className: "rounded-md p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700",
													children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Pencil, { className: "h-3.5 w-3.5" })
												}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
													onClick: () => {
														if (confirm(`Delete "${p.name}"?`)) store.deletePurok(p.id);
													},
													className: "rounded-md p-1 text-slate-400 hover:bg-red-50 hover:text-red-600",
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
			]
		}),
		selected && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(MemberDetailPanel, {
			member: selected,
			householdById,
			purokById,
			barangayById,
			canManage: isAdmin || isPurokLeader,
			onClose: () => setSelected(null),
			onEdit: () => setModal({
				kind: "edit-member",
				data: selected
			}),
			onDelete: () => {
				if (confirm(`Delete ${memberFullName(selected)}?`)) {
					deleteMember(selected.id);
					setSelected(null);
				}
			}
		}),
		modal?.kind === "add-member" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(MemberFormModal, {
			householdsData: scopedHouseholds,
			onSave: (d) => saveMember(d),
			onClose: () => setModal(null)
		}),
		modal?.kind === "edit-member" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(MemberFormModal, {
			initial: modal.data,
			householdsData: state.households,
			onSave: (d) => saveMember(d, modal.data.id),
			onClose: () => setModal(null)
		}),
		modal?.kind === "add-household" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(HouseholdModal, {
			puroksData: state.puroks,
			onSave: (d) => {
				store.addHousehold(d);
				setModal(null);
			},
			onClose: () => setModal(null)
		}),
		modal?.kind === "edit-household" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(HouseholdModal, {
			initial: modal.data,
			puroksData: state.puroks,
			onSave: (d) => {
				store.updateHousehold(modal.data.id, d);
				setModal(null);
			},
			onClose: () => setModal(null)
		}),
		modal?.kind === "add-purok" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PurokModal, {
			barangaysData: state.barangays,
			onSave: (d) => {
				store.addPurok(d);
				setModal(null);
			},
			onClose: () => setModal(null)
		}),
		modal?.kind === "edit-purok" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PurokModal, {
			initial: modal.data,
			barangaysData: state.barangays,
			onSave: (d) => {
				store.updatePurok(modal.data.id, d);
				setModal(null);
			},
			onClose: () => setModal(null)
		})
	] });
}
//#endregion
export { MembersPage as component };
