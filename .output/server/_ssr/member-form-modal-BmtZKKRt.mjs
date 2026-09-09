import { o as __toESM } from "../_runtime.mjs";
import { n as require_jsx_runtime, r as require_react } from "../_libs/react+tanstack__react-query.mjs";
import { i as inputCls, n as FormActions, r as ModalShell, t as Field } from "./modal-shell-m_E5fOLw.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/member-form-modal-BmtZKKRt.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
/** Computed full name for display */
function memberFullName(m) {
	const parts = [
		m.lastName,
		m.firstName,
		m.middleName
	].filter(Boolean);
	if (m.lastName && (m.firstName || m.middleName)) return `${m.lastName}, ${[m.firstName, m.middleName].filter(Boolean).join(" ")}`;
	return parts.join(" ") || "—";
}
function defaultForm(initial, defaultHouseholdId, householdsData) {
	return {
		lastName: initial?.lastName ?? "",
		firstName: initial?.firstName ?? "",
		middleName: initial?.middleName ?? "",
		householdId: initial?.householdId ?? defaultHouseholdId ?? householdsData?.[0]?.id ?? 0,
		precinct: initial?.precinct ?? "",
		no: initial?.no ?? "",
		pn: initial?.pn ?? "",
		address: initial?.address ?? "",
		code: initial?.code ?? "",
		is_purok_leader_indicator: initial?.is_purok_leader_indicator ?? false,
		is_household_leader: initial?.is_household_leader ?? false,
		is_household_member: initial?.is_household_member ?? true,
		age: initial?.age ?? 30,
		religion: initial?.religion ?? "",
		status: initial?.status ?? "Single",
		sc: initial?.sc ?? false,
		pwd: initial?.pwd ?? false,
		ip: initial?.ip ?? false,
		remarks: initial?.remarks ?? ""
	};
}
function MemberFormModal({ initial, householdsData, onSave, onClose, defaultHouseholdId }) {
	const [form, setForm] = (0, import_react.useState)(() => defaultForm(initial, defaultHouseholdId, householdsData));
	const set = (k, v) => setForm((f) => ({
		...f,
		[k]: v
	}));
	const handleSubmit = (e) => {
		e.preventDefault();
		if (!form.lastName.trim() && !form.firstName.trim()) return;
		onSave({
			...form,
			householdId: Number(form.householdId),
			age: Number(form.age)
		});
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ModalShell, {
		title: initial ? "Edit Member" : "Add Member",
		onClose,
		width: "max-w-xl",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
			onSubmit: handleSubmit,
			className: "space-y-4",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "grid grid-cols-3 gap-3",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
							label: "Last Name",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
								className: inputCls,
								value: form.lastName,
								onChange: (e) => set("lastName", e.target.value),
								placeholder: "e.g. Reyes",
								required: true
							})
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
							label: "First Name",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
								className: inputCls,
								value: form.firstName,
								onChange: (e) => set("firstName", e.target.value),
								placeholder: "e.g. Antonio",
								required: true
							})
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
							label: "Middle Name",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
								className: inputCls,
								value: form.middleName,
								onChange: (e) => set("middleName", e.target.value),
								placeholder: "e.g. Cruz"
							})
						})
					]
				}),
				!defaultHouseholdId && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
					label: "Household",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("select", {
						className: "w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none transition-colors focus:border-slate-500 focus:ring-2 focus:ring-slate-200",
						value: form.householdId,
						onChange: (e) => set("householdId", Number(e.target.value)),
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
					className: "grid grid-cols-4 gap-3",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
							label: "Precinct",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
								className: inputCls,
								value: form.precinct,
								onChange: (e) => set("precinct", e.target.value),
								placeholder: "001A"
							})
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
							label: "No.",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
								className: inputCls,
								value: form.no,
								onChange: (e) => set("no", e.target.value),
								placeholder: "1"
							})
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
							label: "PN (Precinct No.)",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
								className: inputCls,
								value: form.pn,
								onChange: (e) => set("pn", e.target.value),
								placeholder: "0001-A"
							})
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
							label: "Code",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
								className: inputCls,
								value: form.code,
								onChange: (e) => set("code", e.target.value)
							})
						})
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "grid grid-cols-3 gap-3",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
							label: "Age",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
								type: "number",
								min: 0,
								max: 150,
								className: inputCls,
								value: form.age,
								onChange: (e) => set("age", Number(e.target.value))
							})
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
							label: "Civil Status",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("select", {
								className: inputCls,
								value: form.status,
								onChange: (e) => set("status", e.target.value),
								children: [
									"Single",
									"Married",
									"Widowed",
									"Separated"
								].map((s) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", { children: s }, s))
							})
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
							label: "Religion",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
								className: inputCls,
								value: form.religion,
								onChange: (e) => set("religion", e.target.value),
								placeholder: "e.g. Roman Catholic"
							})
						})
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
					label: "Address",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
						className: inputCls,
						value: form.address,
						onChange: (e) => set("address", e.target.value),
						placeholder: "e.g. Blk 1 Lot 3, Malinaw St."
					})
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "rounded-lg border border-slate-200 bg-slate-50 p-3",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500",
						children: "Role Indicators"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "flex flex-wrap gap-4",
						children: [
							["is_purok_leader_indicator", "Purok Leader (PI)"],
							["is_household_leader", "Household Leader (HL)"],
							["is_household_member", "Household Member (HM)"]
						].map(([key, lbl]) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
							className: "flex items-center gap-2 cursor-pointer text-sm",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
								type: "checkbox",
								checked: form[key],
								onChange: (e) => set(key, e.target.checked),
								className: "h-4 w-4 rounded border-slate-300 accent-slate-900"
							}), lbl]
						}, key))
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "rounded-lg border border-slate-200 bg-slate-50 p-3",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500",
						children: "Sector Tags"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "flex flex-wrap gap-4",
						children: [
							["sc", "Senior Citizen (SC)"],
							["pwd", "Person with Disability (PWD)"],
							["ip", "Indigenous Person (IP)"]
						].map(([key, lbl]) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
							className: "flex items-center gap-2 cursor-pointer text-sm",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
								type: "checkbox",
								checked: form[key],
								onChange: (e) => set(key, e.target.checked),
								className: "h-4 w-4 rounded border-slate-300 accent-slate-900"
							}), lbl]
						}, key))
					})]
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
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(FormActions, {
					onClose,
					submitLabel: initial ? "Save Changes" : "Add Member"
				})
			]
		})
	});
}
//#endregion
export { memberFullName as n, MemberFormModal as t };
