import { o as __toESM } from "../_runtime.mjs";
import { n as require_jsx_runtime, r as require_react } from "../_libs/react+tanstack__react-query.mjs";
import { n as hashPassword, r as useStore } from "./store-D6_VlWDf.mjs";
import { _ as useNavigate } from "../_libs/@tanstack/react-router+[...].mjs";
import { f as Plus, o as Trash2 } from "../_libs/lucide-react.mjs";
import { i as inputCls, n as FormActions, r as ModalShell, t as Field } from "./modal-shell-m_E5fOLw.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/users-wQsqA72Z.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function UserModal({ puroksData, householdsData, onSave, onClose, restrictRole }) {
	const [form, setForm] = (0, import_react.useState)({
		username: "",
		password: "",
		displayName: "",
		role: restrictRole ?? "Household Leader",
		linkedEntityId: ""
	});
	const [saving, setSaving] = (0, import_react.useState)(false);
	const set = (k, v) => setForm((f) => ({
		...f,
		[k]: v
	}));
	const entityOptions = form.role === "Purok Leader" ? puroksData.map((p) => ({
		id: p.id,
		label: p.name
	})) : form.role === "Household Leader" ? householdsData.map((h) => ({
		id: h.id,
		label: `${h.householdLeaderName} — ${h.address}`
	})) : [];
	const handleSubmit = async (e) => {
		e.preventDefault();
		if (!form.username.trim() || !form.password.trim()) return;
		setSaving(true);
		try {
			const hash = await hashPassword(form.password);
			onSave({
				username: form.username.trim(),
				password_hash: hash,
				role: form.role,
				linked_entity_id: form.role === "Admin" ? null : (Number(form.linkedEntityId) || entityOptions[0]?.id) ?? null,
				displayName: form.displayName.trim() || form.username.trim()
			});
		} finally {
			setSaving(false);
		}
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ModalShell, {
		title: "Create User Account",
		onClose,
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
			onSubmit: handleSubmit,
			className: "space-y-4",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
					label: "Display Name",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
						className: inputCls,
						value: form.displayName,
						onChange: (e) => set("displayName", e.target.value),
						placeholder: "e.g. Juan Dela Cruz",
						required: true
					})
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "grid grid-cols-2 gap-3",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
						label: "Username",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
							className: inputCls,
							value: form.username,
							onChange: (e) => set("username", e.target.value),
							placeholder: "e.g. juan.delacruz",
							required: true
						})
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
						label: "Password",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
							type: "password",
							className: inputCls,
							value: form.password,
							onChange: (e) => set("password", e.target.value),
							placeholder: "••••••••",
							required: true
						})
					})]
				}),
				!restrictRole && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
					label: "Role",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("select", {
						className: "w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none transition-colors focus:border-slate-500 focus:ring-2 focus:ring-slate-200",
						value: form.role,
						onChange: (e) => set("role", e.target.value),
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", { children: "Admin" }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", { children: "Purok Leader" }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", { children: "Household Leader" })
						]
					})
				}),
				form.role !== "Admin" && entityOptions.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
					label: form.role === "Purok Leader" ? "Assign to Purok" : "Assign to Household",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("select", {
						className: "w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none transition-colors focus:border-slate-500 focus:ring-2 focus:ring-slate-200",
						value: form.linkedEntityId || entityOptions[0]?.id,
						onChange: (e) => set("linkedEntityId", e.target.value),
						children: entityOptions.map((o) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
							value: o.id,
							children: o.label
						}, o.id))
					})
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(FormActions, {
					onClose,
					submitLabel: saving ? "Creating…" : "Create Account",
					submitColor: "bg-slate-900 hover:bg-slate-700"
				})
			]
		})
	});
}
function UsersPage() {
	const store = useStore();
	const { state } = store;
	const navigate = useNavigate();
	const [showModal, setShowModal] = (0, import_react.useState)(false);
	(0, import_react.useEffect)(() => {
		if (state.session?.role !== "Admin") navigate({ to: "/my-dashboard" });
	}, [state.session, navigate]);
	const { users, puroks, households } = state;
	const getAssignment = (user) => {
		if (user.role === "Admin") return "Full system access";
		if (user.role === "Purok Leader") {
			const p = puroks.find((pk) => pk.id === user.linked_entity_id);
			return p ? p.name : "Unassigned";
		}
		const h = households.find((hh) => hh.id === user.linked_entity_id);
		return h ? `${h.householdLeaderName} — ${h.address}` : "Unassigned";
	};
	const roleBadgeCls = (role) => {
		switch (role) {
			case "Admin": return "bg-slate-800 text-white";
			case "Purok Leader": return "bg-indigo-50 text-indigo-700";
			case "Household Leader": return "bg-emerald-50 text-emerald-700";
			default: return "bg-slate-100 text-slate-600";
		}
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", {
			className: "border-b border-slate-200 bg-white px-6 py-4",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
				className: "text-lg font-semibold",
				children: "Users"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-sm text-slate-500",
				children: "Manage user accounts and role assignments"
			})]
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "space-y-6 p-6",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "flex justify-end",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
						onClick: () => setShowModal(true),
						className: "flex items-center gap-1.5 rounded-lg bg-slate-900 px-4 py-2 text-xs font-semibold text-white transition-colors hover:bg-slate-700",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Plus, { className: "h-4 w-4" }), " Create User"]
					})
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("table", {
						className: "w-full text-left text-sm text-slate-600",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("thead", {
							className: "border-b border-slate-200 bg-slate-50 text-xs uppercase text-slate-500",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", { children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
									className: "px-4 py-3 font-semibold",
									children: "Display Name"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
									className: "px-4 py-3 font-semibold",
									children: "Username"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
									className: "px-4 py-3 font-semibold",
									children: "Role"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
									className: "px-4 py-3 font-semibold",
									children: "Assignment"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", { className: "px-4 py-3 font-semibold" })
							] })
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("tbody", {
							className: "divide-y divide-slate-100",
							children: users.sort((a, b) => a.displayName.localeCompare(b.displayName)).map((u) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", {
								className: "hover:bg-slate-50 transition-colors",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
										className: "whitespace-nowrap px-4 py-3 font-medium text-slate-900",
										children: u.displayName
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
										className: "whitespace-nowrap px-4 py-3 font-mono text-xs text-slate-500",
										children: u.username
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
										className: "whitespace-nowrap px-4 py-3",
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: `inline-flex items-center rounded-full px-2.5 py-0.5 text-[10px] font-bold ${roleBadgeCls(u.role)}`,
											children: u.role
										})
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
										className: "whitespace-nowrap px-4 py-3 text-slate-600 max-w-[250px] truncate",
										children: getAssignment(u)
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
										className: "px-4 py-3",
										children: u.id !== state.session?.userId && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
											onClick: () => {
												if (confirm(`Delete user "${u.username}"?`)) store.deleteUser(u.id);
											},
											className: "rounded-md p-1.5 text-slate-400 transition-colors hover:bg-red-50 hover:text-red-600",
											title: "Delete user",
											children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Trash2, { className: "h-3.5 w-3.5" })
										})
									})
								]
							}, u.id))
						})]
					})
				}),
				users.length === 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "py-8 text-center text-sm text-slate-400",
					children: "No user accounts."
				})
			]
		}),
		showModal && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(UserModal, {
			puroksData: puroks,
			householdsData: households,
			onSave: (data) => {
				store.addUser(data);
				setShowModal(false);
			},
			onClose: () => setShowModal(false)
		})
	] });
}
//#endregion
export { UsersPage as component };
