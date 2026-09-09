import { o as __toESM } from "../_runtime.mjs";
import { n as require_jsx_runtime, r as require_react } from "../_libs/react+tanstack__react-query.mjs";
import { r as useStore } from "./store-D6_VlWDf.mjs";
import { _ as useNavigate } from "../_libs/@tanstack/react-router+[...].mjs";
import { E as CircleCheckBig, S as FileSpreadsheet, T as Download, _ as LoaderCircle, a as TriangleAlert, b as House, c as TableProperties, d as RotateCcw, i as Upload, m as MapPin, n as Users, t as X } from "../_libs/lucide-react.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/settings-PK9aWoDV.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var COLUMNS = [
	"Barangay",
	"Barangay Captain",
	"Purok",
	"Purok Leader",
	"Household Leader",
	"Address",
	"Last Name",
	"First Name",
	"Middle Name",
	"Precinct",
	"No",
	"PN",
	"Code",
	"PI",
	"HL",
	"HM",
	"Age",
	"Religion",
	"Status",
	"SC",
	"PWD",
	"IP",
	"Remarks"
];
function toRows(data) {
	const hh = new Map(data.households.map((h) => [h.id, h]));
	const pk = new Map(data.puroks.map((p) => [p.id, p]));
	const bg = new Map(data.barangays.map((b) => [b.id, b]));
	return data.members.map((m) => {
		const household = hh.get(m.householdId);
		const purok = household ? pk.get(household.purokId) : void 0;
		const barangay = purok ? bg.get(purok.barangayId) : void 0;
		return {
			Barangay: barangay?.name ?? "",
			"Barangay Captain": barangay?.barangayCaptainName ?? "",
			Purok: purok?.name ?? "",
			"Purok Leader": purok?.purokLeaderName ?? "",
			"Household Leader": household?.householdLeaderName ?? "",
			Address: household?.address ?? "",
			"Last Name": m.lastName,
			"First Name": m.firstName,
			"Middle Name": m.middleName,
			Precinct: m.precinct,
			No: m.no,
			PN: m.pn,
			Code: m.code,
			PI: m.is_purok_leader_indicator ? "Yes" : "No",
			HL: m.is_household_leader ? "Yes" : "No",
			HM: m.is_household_member ? "Yes" : "No",
			Age: m.age,
			Religion: m.religion,
			Status: m.status,
			SC: m.sc ? "Yes" : "No",
			PWD: m.pwd ? "Yes" : "No",
			IP: m.ip ? "Yes" : "No",
			Remarks: m.remarks
		};
	});
}
async function exportToExcel(data, filename = "residents.xlsx") {
	const XLSX = await import("../_libs/xlsx.mjs").then((n) => n.t);
	const rows = toRows(data);
	const sheet = XLSX.utils.json_to_sheet(rows, { header: [...COLUMNS] });
	sheet["!cols"] = COLUMNS.map((c) => ({ wch: Math.max(12, Math.min(30, c.length + 6)) }));
	const book = XLSX.utils.book_new();
	XLSX.utils.book_append_sheet(book, sheet, "Residents");
	XLSX.writeFile(book, filename);
}
async function downloadTemplate() {
	const XLSX = await import("../_libs/xlsx.mjs").then((n) => n.t);
	const sheet = XLSX.utils.json_to_sheet([{
		Barangay: "Barangay San Isidro",
		"Barangay Captain": "Hon. Ricardo Mendoza",
		Purok: "Purok 1 - Malinaw",
		"Purok Leader": "Rodrigo Alvarez",
		"Household Leader": "Reyes, Antonio Cruz",
		Address: "Blk 1 Lot 3, Malinaw St.",
		"Last Name": "Reyes",
		"First Name": "Antonio",
		"Middle Name": "Cruz",
		Precinct: "001A",
		No: "1",
		PN: "0001-A",
		Code: "",
		PI: "No",
		HL: "Yes",
		HM: "Yes",
		Age: 68,
		Religion: "Roman Catholic",
		Status: "Married",
		SC: "Yes",
		PWD: "No",
		IP: "No",
		Remarks: "Household leader"
	}], { header: [...COLUMNS] });
	sheet["!cols"] = COLUMNS.map((c) => ({ wch: Math.max(12, c.length + 6) }));
	const book = XLSX.utils.book_new();
	XLSX.utils.book_append_sheet(book, sheet, "Residents");
	XLSX.writeFile(book, "residents-template.xlsx");
}
var yes = (v) => [
	"yes",
	"y",
	"true",
	"1",
	"oo"
].includes(String(v ?? "").trim().toLowerCase());
var civil = (v) => {
	const s = String(v ?? "").trim().toLowerCase();
	if (s.startsWith("mar")) return "Married";
	if (s.startsWith("wid")) return "Widowed";
	if (s.startsWith("sep")) return "Separated";
	return "Single";
};
/**
* Detect whether a row set uses old-format columns (Full Name, Civil Status)
* or new-format columns (Last Name, First Name, Middle Name, Status).
*/
function detectFormat(headers) {
	const headerSet = new Set(headers.map((h) => h.trim()));
	if (headerSet.has("Last Name") || headerSet.has("First Name")) return "new";
	if (headerSet.has("Full Name")) return "old";
	return "new";
}
/**
* Parse a "Last, First Middle" full name string into parts.
*/
function parseFullName(fullName) {
	const commaIdx = fullName.indexOf(",");
	if (commaIdx === -1) {
		const parts = fullName.trim().split(/\s+/);
		return {
			lastName: parts[0] ?? "",
			firstName: parts[1] ?? "",
			middleName: parts.slice(2).join(" ")
		};
	}
	const lastName = fullName.substring(0, commaIdx).trim();
	const rest = fullName.substring(commaIdx + 1).trim().split(/\s+/);
	return {
		lastName,
		firstName: rest[0] ?? "",
		middleName: rest.slice(1).join(" ")
	};
}
async function importFromExcel(file) {
	const XLSX = await import("../_libs/xlsx.mjs").then((n) => n.t);
	const book = XLSX.read(await file.arrayBuffer(), { type: "array" });
	const first = book.SheetNames[0];
	if (!first) throw new Error("The file has no sheets.");
	const rows = XLSX.utils.sheet_to_json(book.Sheets[first], { defval: "" });
	if (rows.length === 0) throw new Error("No rows found in the first sheet.");
	const sampleRow = rows[0];
	const format = detectFormat(Object.keys(sampleRow));
	const barangays = [];
	const puroks = [];
	const households = [];
	const members = [];
	const bgIdx = /* @__PURE__ */ new Map();
	const pkIdx = /* @__PURE__ */ new Map();
	const hhIdx = /* @__PURE__ */ new Map();
	const get = (r, key) => String(r[key] ?? "").trim();
	rows.forEach((r, i) => {
		let lastName, firstName, middleName;
		if (format === "old") {
			const fullName = get(r, "Full Name");
			if (!fullName) return;
			const parsed = parseFullName(fullName);
			lastName = parsed.lastName;
			firstName = parsed.firstName;
			middleName = parsed.middleName;
		} else {
			lastName = get(r, "Last Name") || get(r, "Last");
			firstName = get(r, "First Name") || get(r, "First");
			middleName = get(r, "Middle Name") || get(r, "Middle");
			if (!lastName && !firstName) return;
		}
		const bName = get(r, "Barangay") || "Unassigned Barangay";
		let bId = bgIdx.get(bName.toLowerCase());
		if (!bId) {
			bId = barangays.length + 1;
			bgIdx.set(bName.toLowerCase(), bId);
			barangays.push({
				id: bId,
				name: bName,
				barangayCaptainName: get(r, "Barangay Captain") || "—"
			});
		}
		const pName = get(r, "Purok") || "Unassigned Purok";
		const pKey = `${bId}|${pName.toLowerCase()}`;
		let pId = pkIdx.get(pKey);
		if (!pId) {
			pId = puroks.length + 1;
			pkIdx.set(pKey, pId);
			puroks.push({
				id: pId,
				barangayId: bId,
				name: pName,
				purokLeaderName: get(r, "Purok Leader") || "—"
			});
		}
		const hLeader = get(r, "Household Leader") || memberFullNameFromParts(lastName, firstName, middleName);
		const hKey = `${pId}|${hLeader.toLowerCase()}|${get(r, "Address").toLowerCase()}`;
		let hId = hhIdx.get(hKey);
		if (!hId) {
			hId = households.length + 1;
			hhIdx.set(hKey, hId);
			households.push({
				id: hId,
				purokId: pId,
				householdLeaderName: hLeader,
				address: get(r, "Address")
			});
		}
		const statusField = format === "old" ? "Civil Status" : "Status";
		members.push({
			id: i + 1,
			householdId: hId,
			lastName,
			firstName,
			middleName,
			precinct: get(r, "Precinct"),
			no: get(r, "No") || get(r, "No.") || String(i + 1),
			pn: get(r, "PN"),
			address: get(r, "Address"),
			code: get(r, "Code"),
			is_purok_leader_indicator: yes(r["PI"]),
			is_household_leader: yes(r["HL"]),
			is_household_member: r["HM"] !== void 0 ? yes(r["HM"]) : true,
			age: Number(r["Age"]) || 0,
			religion: get(r, "Religion"),
			status: civil(r[statusField]),
			sc: yes(r["SC"]),
			pwd: yes(r["PWD"]),
			ip: yes(r["IP"]),
			remarks: get(r, "Remarks")
		});
	});
	if (members.length === 0) throw new Error("No resident names found. Check the 'Last Name'/'Full Name' column.");
	return {
		barangays,
		puroks,
		households,
		members
	};
}
function memberFullNameFromParts(last, first, middle) {
	if (last && (first || middle)) return `${last}, ${[first, middle].filter(Boolean).join(" ")}`;
	return [
		last,
		first,
		middle
	].filter(Boolean).join(" ") || "—";
}
var str = (v) => String(v ?? "").trim();
var hasValue = (v) => str(v) !== "";
async function parseEntrySheet(file) {
	const XLSX = await import("../_libs/xlsx.mjs").then((n) => n.t);
	const book = XLSX.read(await file.arrayBuffer(), { type: "array" });
	const entrySheetName = book.SheetNames.find((n) => n.toUpperCase() === "ENTRY");
	if (!entrySheetName) throw new Error(`Sheet "ENTRY" not found. Available sheets: ${book.SheetNames.join(", ")}`);
	const rawRows = XLSX.utils.sheet_to_json(book.Sheets[entrySheetName], { defval: "" });
	if (rawRows.length === 0) throw new Error("The \"ENTRY\" sheet has no data rows.");
	const data = processImportedData(rawRows.map((raw) => {
		const norm = {};
		for (const [key, val] of Object.entries(raw)) norm[key.toUpperCase().trim()] = str(val);
		return {
			PN: norm["PN"] ?? "",
			SN: norm["SN"] ?? "",
			LAST: norm["LAST"] ?? "",
			FIRST: norm["FIRST"] ?? "",
			MIDDLE: norm["MIDDLE"] ?? "",
			ADDRESS: norm["ADDRESS"] ?? "",
			CODE: norm["CODE"] ?? "",
			PL: norm["PL"] ?? "",
			HL: norm["HL"] ?? "",
			HM: norm["HM"] ?? "",
			REMARKS: norm["REMARKS"] ?? ""
		};
	}));
	return {
		memberCount: data.members.length,
		householdCount: data.households.length,
		purokCount: data.puroks.length,
		barangayCount: data.barangays.length,
		data
	};
}
function processImportedData(rows) {
	const defaultBarangay = {
		id: 1,
		name: "Imported Barangay",
		barangayCaptainName: "—"
	};
	const purokMap = /* @__PURE__ */ new Map();
	let purokIdCounter = 0;
	for (const row of rows) {
		const code = str(row.CODE);
		if (!code) continue;
		if (!purokMap.has(code)) {
			purokIdCounter++;
			purokMap.set(code, {
				id: purokIdCounter,
				leaderName: "—"
			});
		}
		if (hasValue(row.PL)) {
			const fullName = [
				row.LAST,
				row.FIRST,
				row.MIDDLE
			].map(str).filter(Boolean);
			const display = fullName[0] ? `${fullName[0]}, ${fullName.slice(1).join(" ")}`.trim() : "—";
			purokMap.get(code).leaderName = display;
		}
	}
	const puroks = Array.from(purokMap.entries()).map(([code, info]) => ({
		id: info.id,
		barangayId: defaultBarangay.id,
		name: code,
		purokLeaderName: info.leaderName
	}));
	const households = [];
	const members = [];
	let householdIdCounter = 0;
	let memberIdCounter = 0;
	let currentHouseholdId = null;
	for (const row of rows) {
		const lastName = str(row.LAST);
		const firstName = str(row.FIRST);
		const middleName = str(row.MIDDLE);
		if (!lastName && !firstName) continue;
		const code = str(row.CODE);
		const purokId = (code ? purokMap.get(code) : null)?.id ?? 1;
		const isPL = hasValue(row.PL);
		const isHL = hasValue(row.HL);
		const isHM = hasValue(row.HM);
		if (isHL) {
			householdIdCounter++;
			const fullName = [
				lastName,
				firstName,
				middleName
			].filter(Boolean);
			const leaderDisplay = fullName[0] ? `${fullName[0]}, ${fullName.slice(1).join(" ")}`.trim() : "—";
			households.push({
				id: householdIdCounter,
				purokId,
				householdLeaderName: leaderDisplay,
				address: str(row.ADDRESS)
			});
			currentHouseholdId = householdIdCounter;
		}
		if (currentHouseholdId === null) {
			householdIdCounter++;
			households.push({
				id: householdIdCounter,
				purokId,
				householdLeaderName: "Unassigned",
				address: str(row.ADDRESS) || "—"
			});
			currentHouseholdId = householdIdCounter;
		}
		memberIdCounter++;
		members.push({
			id: memberIdCounter,
			householdId: currentHouseholdId,
			lastName,
			firstName,
			middleName,
			precinct: str(row.PN),
			no: str(row.SN),
			pn: str(row.PN),
			address: str(row.ADDRESS),
			code,
			is_purok_leader_indicator: isPL,
			is_household_leader: isHL,
			is_household_member: isHM,
			age: 0,
			religion: "",
			status: "Single",
			sc: false,
			pwd: false,
			ip: false,
			remarks: str(row.REMARKS)
		});
	}
	return {
		barangays: [defaultBarangay],
		puroks,
		households,
		members
	};
}
function ImportDataModal({ onClose }) {
	const store = useStore();
	const fileInputRef = (0, import_react.useRef)(null);
	const [stage, setStage] = (0, import_react.useState)("idle");
	const [fileName, setFileName] = (0, import_react.useState)("");
	const [summary, setSummary] = (0, import_react.useState)(null);
	const [errorMsg, setErrorMsg] = (0, import_react.useState)("");
	const [isDragging, setIsDragging] = (0, import_react.useState)(false);
	const processFile = (0, import_react.useCallback)(async (file) => {
		setFileName(file.name);
		setStage("parsing");
		setErrorMsg("");
		try {
			const result = await parseEntrySheet(file);
			setSummary(result);
			setStage("preview");
		} catch (err) {
			setErrorMsg(err.message || "Failed to parse file.");
			setStage("error");
		}
	}, []);
	const handleFileChange = (0, import_react.useCallback)((e) => {
		const file = e.target.files?.[0];
		if (file) processFile(file);
	}, [processFile]);
	const handleDragOver = (0, import_react.useCallback)((e) => {
		e.preventDefault();
		setIsDragging(true);
	}, []);
	const handleDragLeave = (0, import_react.useCallback)((e) => {
		e.preventDefault();
		setIsDragging(false);
	}, []);
	const handleDrop = (0, import_react.useCallback)((e) => {
		e.preventDefault();
		setIsDragging(false);
		const file = e.dataTransfer.files[0];
		if (file) processFile(file);
	}, [processFile]);
	const handleConfirmImport = (0, import_react.useCallback)(async () => {
		if (!summary) return;
		setStage("importing");
		try {
			await store.bulkImport(summary.data);
			setStage("done");
		} catch (err) {
			setErrorMsg(err.message || "Import failed.");
			setStage("error");
		}
	}, [summary, store]);
	const handleReset = (0, import_react.useCallback)(() => {
		setStage("idle");
		setFileName("");
		setSummary(null);
		setErrorMsg("");
		if (fileInputRef.current) fileInputRef.current.value = "";
	}, []);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "fixed inset-0 z-50 flex items-center justify-center p-4",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "absolute inset-0 bg-slate-900/60 backdrop-blur-sm",
			onClick: stage === "importing" ? void 0 : onClose
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "relative z-10 w-full max-w-xl rounded-2xl bg-white shadow-2xl overflow-hidden",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex items-center justify-between border-b border-slate-200 px-6 py-4",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-center gap-3",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(FileSpreadsheet, { className: "h-5 w-5" })
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
						className: "text-base font-semibold text-slate-800",
						children: "Excel Data Importer"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-xs text-slate-500",
						children: "Upload an ENTRY-sheet Excel file"
					})] })]
				}), stage !== "importing" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					onClick: onClose,
					className: "rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(X, { className: "h-4 w-4" })
				})]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "px-6 py-5",
				children: [
					stage === "idle" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						onDragOver: handleDragOver,
						onDragLeave: handleDragLeave,
						onDrop: handleDrop,
						onClick: () => fileInputRef.current?.click(),
						className: `group flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed px-6 py-12 text-center transition-all ${isDragging ? "border-indigo-500 bg-indigo-50 scale-[1.01]" : "border-slate-300 bg-slate-50 hover:border-indigo-400 hover:bg-indigo-50/50"}`,
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: `mb-4 flex h-14 w-14 items-center justify-center rounded-full transition-all ${isDragging ? "bg-indigo-100 text-indigo-600 scale-110" : "bg-slate-200 text-slate-500 group-hover:bg-indigo-100 group-hover:text-indigo-600"}`,
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Upload, { className: "h-6 w-6" })
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-sm font-semibold text-slate-700",
								children: isDragging ? "Drop your file here" : "Drag & drop your Excel file"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
								className: "mt-1 text-xs text-slate-500",
								children: ["or click to browse · Accepts ", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "font-medium",
									children: ".xlsx, .xls"
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
								className: "mt-3 rounded-md bg-white px-3 py-1.5 text-[11px] text-slate-400 border border-slate-200 shadow-sm",
								children: [
									"Expects a sheet named ",
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "font-bold text-indigo-600",
										children: "ENTRY"
									}),
									" with columns: PN, SN, LAST, FIRST, MIDDLE, ADDRESS, CODE, PL, HL, HM, REMARKS"
								]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
								ref: fileInputRef,
								type: "file",
								accept: ".xlsx,.xls",
								onChange: handleFileChange,
								className: "hidden"
							})
						]
					}),
					stage === "parsing" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex flex-col items-center justify-center py-16",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "h-10 w-10 animate-spin text-indigo-600" }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
								className: "mt-4 text-sm font-medium text-slate-700",
								children: [
									"Parsing ",
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "font-semibold text-indigo-600",
										children: fileName
									}),
									"..."
								]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "mt-1 text-xs text-slate-500",
								children: "Reading ENTRY sheet and building hierarchy"
							})
						]
					}),
					stage === "preview" && summary && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "space-y-5",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex items-center gap-2 rounded-lg bg-green-50 border border-green-200 px-4 py-2.5",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CircleCheckBig, { className: "h-4 w-4 text-green-600 flex-shrink-0" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "text-sm font-medium text-green-800",
									children: "File parsed successfully"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "text-xs text-green-600",
									children: fileName
								})] })]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "grid grid-cols-3 gap-3",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SummaryCard, {
										icon: Users,
										label: "Members",
										count: summary.memberCount,
										color: "indigo"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SummaryCard, {
										icon: House,
										label: "Households",
										count: summary.householdCount,
										color: "emerald"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SummaryCard, {
										icon: MapPin,
										label: "Puroks",
										count: summary.purokCount,
										color: "amber"
									})
								]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex items-start gap-3 rounded-lg bg-amber-50 border border-amber-200 px-4 py-3",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TriangleAlert, { className: "h-4 w-4 text-amber-600 mt-0.5 flex-shrink-0" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "text-xs font-semibold text-amber-800",
									children: "This will replace all existing data"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "text-xs text-amber-700 mt-0.5",
									children: "All current Barangays, Puroks, Households, and Members in the database will be deleted and replaced with this import."
								})] })]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex gap-3 pt-1",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
									onClick: handleReset,
									className: "flex-1 rounded-lg border border-slate-300 py-2.5 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-50",
									children: "Choose Different File"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
									onClick: () => void handleConfirmImport(),
									className: "flex-1 flex items-center justify-center gap-2 rounded-lg bg-indigo-600 py-2.5 text-sm font-semibold text-white shadow-sm transition-all hover:bg-indigo-700 hover:shadow-md active:scale-[0.98]",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Upload, { className: "h-4 w-4" }), "Confirm Import"]
								})]
							})
						]
					}),
					stage === "importing" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex flex-col items-center justify-center py-16",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "h-10 w-10 animate-spin text-indigo-600" }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "mt-4 text-sm font-medium text-slate-700",
								children: "Importing data to database..."
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
								className: "mt-1 text-xs text-slate-500",
								children: [
									"Inserting ",
									summary?.memberCount ?? 0,
									" members across ",
									summary?.purokCount ?? 0,
									" puroks"
								]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "mt-3 text-[11px] text-slate-400",
								children: "Please do not close this window"
							})
						]
					}),
					stage === "done" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex flex-col items-center justify-center py-12",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "flex h-16 w-16 items-center justify-center rounded-full bg-green-100",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CircleCheckBig, { className: "h-8 w-8 text-green-600" })
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "mt-4 text-base font-semibold text-slate-800",
								children: "Import Complete!"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
								className: "mt-1 text-sm text-slate-500",
								children: [
									"Successfully imported ",
									summary?.memberCount,
									" members, ",
									summary?.householdCount,
									" households, and ",
									summary?.purokCount,
									" puroks."
								]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								onClick: onClose,
								className: "mt-6 rounded-lg bg-indigo-600 px-6 py-2.5 text-sm font-semibold text-white shadow-sm transition-all hover:bg-indigo-700 hover:shadow-md active:scale-[0.98]",
								children: "Done"
							})
						]
					}),
					stage === "error" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex flex-col items-center justify-center py-12",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "flex h-16 w-16 items-center justify-center rounded-full bg-red-100",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TriangleAlert, { className: "h-8 w-8 text-red-600" })
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "mt-4 text-base font-semibold text-red-800",
								children: "Import Failed"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "mt-1 max-w-sm text-center text-sm text-red-600",
								children: errorMsg
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								onClick: handleReset,
								className: "mt-6 rounded-lg border border-slate-300 px-6 py-2.5 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50",
								children: "Try Again"
							})
						]
					})
				]
			})]
		})]
	});
}
function SummaryCard({ icon: Icon, label, count, color }) {
	const c = {
		indigo: {
			bg: "bg-indigo-50",
			text: "text-indigo-700",
			icon: "text-indigo-500",
			border: "border-indigo-100"
		},
		emerald: {
			bg: "bg-emerald-50",
			text: "text-emerald-700",
			icon: "text-emerald-500",
			border: "border-emerald-100"
		},
		amber: {
			bg: "bg-amber-50",
			text: "text-amber-700",
			icon: "text-amber-500",
			border: "border-amber-100"
		}
	}[color];
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: `flex flex-col items-center rounded-xl border ${c.border} ${c.bg} p-4`,
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Icon, { className: `h-5 w-5 ${c.icon}` }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: `mt-2 text-2xl font-bold ${c.text}`,
				children: count.toLocaleString()
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-[11px] font-medium text-slate-500",
				children: label
			})
		]
	});
}
function SettingsPage() {
	const store = useStore();
	const { state } = store;
	const navigate = useNavigate();
	const fileInputRef = (0, import_react.useRef)(null);
	const [importStatus, setImportStatus] = (0, import_react.useState)(null);
	const [showImportModal, setShowImportModal] = (0, import_react.useState)(false);
	(0, import_react.useEffect)(() => {
		if (state.session?.role !== "Admin") navigate({ to: "/my-dashboard" });
	}, [state.session, navigate]);
	const handleExport = () => {
		exportToExcel({
			barangays: state.barangays,
			puroks: state.puroks,
			households: state.households,
			members: state.members
		});
	};
	const [isImporting, setIsImporting] = (0, import_react.useState)(false);
	const handleImport = async (e) => {
		const file = e.target.files?.[0];
		if (!file) return;
		if (!confirm("WARNING: This will completely replace all existing resident data (Barangays, Puroks, Households, Members) in the database. Are you absolutely sure you want to proceed?")) {
			e.target.value = "";
			return;
		}
		setIsImporting(true);
		setImportStatus(null);
		try {
			const data = await importFromExcel(file);
			await store.bulkImport(data);
			setImportStatus({
				type: "success",
				message: `Successfully imported ${data.members.length} members across ${data.barangays.length} barangays.`
			});
		} catch (err) {
			console.error(err);
			setImportStatus({
				type: "error",
				message: err.message || "Failed to import file."
			});
		} finally {
			setIsImporting(false);
			if (fileInputRef.current) fileInputRef.current.value = "";
		}
	};
	const handleReset = () => {
		alert("Reset data is disabled in Supabase mode. Please run the SQL schema migration again to reset.");
	};
	const handleClearStorage = () => {
		if (confirm("This will clear ALL saved data from localStorage, including user accounts. You will be logged out. Continue?")) {
			try {
				localStorage.removeItem("brms_data");
				localStorage.removeItem("brms_session");
			} catch {}
			window.location.reload();
		}
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", {
			className: "border-b border-slate-200 bg-white px-6 py-4",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
				className: "text-lg font-semibold",
				children: "Settings"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-sm text-slate-500",
				children: "Import/export data and manage system settings"
			})]
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "space-y-6 p-6",
			children: [
				importStatus && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: `rounded-xl border px-5 py-4 text-sm ${importStatus.type === "success" ? "border-green-200 bg-green-50 text-green-800" : "border-red-200 bg-red-50 text-red-800"}`,
					children: importStatus.message
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "rounded-xl border border-slate-200 bg-white p-6 shadow-sm",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
							className: "mb-1 text-sm font-semibold text-slate-700",
							children: "Excel Import / Export"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mb-5 text-xs text-slate-500",
							children: "Import residents from an Excel file or export the current data."
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex flex-wrap gap-3",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
									className: "flex cursor-pointer items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-medium text-white shadow-sm transition-colors hover:bg-indigo-700",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Upload, { className: "h-4 w-4" }),
										" ",
										isImporting ? "Importing..." : "Import Excel",
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
											ref: fileInputRef,
											type: "file",
											accept: ".xlsx,.xls,.csv",
											onChange: handleImport,
											disabled: isImporting,
											className: "hidden"
										})
									]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
									onClick: () => setShowImportModal(true),
									className: "flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2.5 text-sm font-medium text-white shadow-sm transition-colors hover:bg-emerald-700",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableProperties, { className: "h-4 w-4" }), " Import ENTRY Sheet"]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
									onClick: handleExport,
									className: "flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Download, { className: "h-4 w-4" }), " Export Excel"]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
									onClick: () => void downloadTemplate(),
									className: "flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(FileSpreadsheet, { className: "h-4 w-4" }), " Download Template"]
								})
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "mt-4 rounded-lg bg-slate-50 p-3 text-xs text-slate-500",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "font-semibold text-slate-600 mb-1",
								children: "Supported formats:"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("ul", {
								className: "list-disc list-inside space-y-0.5",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: "New format: Last Name, First Name, Middle Name, Precinct, No, PN, Code, PI, HL, HM, Status, SC, PWD, IP" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: "Old format: Full Name, Civil Status (auto-detected)" })]
							})]
						})
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "rounded-xl border border-slate-200 bg-white p-6 shadow-sm",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
							className: "mb-1 text-sm font-semibold text-slate-700",
							children: "Current Data Summary"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mb-4 text-xs text-slate-500",
							children: "Data persisted in localStorage."
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "grid grid-cols-2 gap-3 sm:grid-cols-4",
							children: [
								["Barangays", state.barangays.length],
								["Puroks", state.puroks.length],
								["Households", state.households.length],
								["Members", state.members.length]
							].map(([label, count]) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "rounded-lg bg-slate-50 p-3 text-center",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "text-xl font-bold",
									children: count
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "text-[11px] text-slate-500",
									children: label
								})]
							}, label))
						})
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "rounded-xl border border-red-200 bg-red-50 p-6",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
							className: "mb-1 text-sm font-semibold text-red-800",
							children: "Danger Zone"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mb-4 text-xs text-red-600",
							children: "These actions are irreversible."
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex flex-wrap gap-3",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
								onClick: handleReset,
								className: "flex items-center gap-2 rounded-lg border border-red-300 bg-white px-4 py-2.5 text-sm font-medium text-red-700 transition-colors hover:bg-red-100",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(RotateCcw, { className: "h-4 w-4" }), " Reset to Seed Data"]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								onClick: handleClearStorage,
								className: "flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-red-700",
								children: "Clear All Storage"
							})]
						})
					]
				})
			]
		}),
		showImportModal && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ImportDataModal, { onClose: () => setShowImportModal(false) })
	] });
}
//#endregion
export { SettingsPage as component };
