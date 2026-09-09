import { o as __toESM } from "../_runtime.mjs";
import { n as require_jsx_runtime, r as require_react } from "../_libs/react+tanstack__react-query.mjs";
import { t as createClient } from "../_libs/supabase__supabase-js.mjs";
import { t as require_node } from "../_libs/isomorphic-ws.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/store-D6_VlWDf.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var import_node = /* @__PURE__ */ __toESM(require_node());
async function hashPassword(plain) {
	const data = new TextEncoder().encode(plain);
	const hashBuffer = await crypto.subtle.digest("SHA-256", data);
	return Array.from(new Uint8Array(hashBuffer)).map((b) => b.toString(16).padStart(2, "0")).join("");
}
var SESSION_KEY = "brms_session";
function createSession(user) {
	const session = {
		userId: user.id,
		username: user.username,
		role: user.role,
		linkedEntityId: user.linked_entity_id,
		displayName: user.displayName
	};
	try {
		localStorage.setItem(SESSION_KEY, JSON.stringify(session));
	} catch {}
	return session;
}
function getSession() {
	try {
		const raw = localStorage.getItem(SESSION_KEY);
		if (!raw) return null;
		return JSON.parse(raw);
	} catch {
		return null;
	}
}
function clearSession() {
	try {
		localStorage.removeItem(SESSION_KEY);
	} catch {}
}
var supabase = createClient("https://kuvdosoxaoetqaqdkjah.supabase.co", "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt1dmRvc294YW9ldHFhcWRramFoIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4ODkzNTY5NywiZXhwIjoyMTA0NTExNjk3fQ.P44B_irxft0-RxoNMvqwCuWoLABFFRHEEkym3iykcM8", { realtime: { transport: import_node.default } });
var StoreContext = (0, import_react.createContext)(null);
function useStore() {
	const ctx = (0, import_react.useContext)(StoreContext);
	if (!ctx) throw new Error("useStore must be used within StoreProvider");
	return ctx;
}
function StoreProvider({ children }) {
	const [state, setState] = (0, import_react.useState)({
		barangays: [],
		puroks: [],
		households: [],
		members: [],
		users: [],
		session: getSession(),
		initialized: false
	});
	const refreshData = (0, import_react.useCallback)(async () => {
		try {
			const [b, p, h, m, u] = await Promise.all([
				supabase.from("barangays").select("*"),
				supabase.from("puroks").select("*"),
				supabase.from("households").select("*"),
				supabase.from("members").select("*"),
				supabase.from("users").select("*")
			]);
			setState((prev) => ({
				...prev,
				barangays: b.data || [],
				puroks: p.data || [],
				households: h.data || [],
				members: m.data || [],
				users: u.data || [],
				initialized: true
			}));
		} catch (err) {
			console.error("Failed to load data from Supabase", err);
		}
	}, []);
	(0, import_react.useEffect)(() => {
		refreshData();
	}, [refreshData]);
	const login = (0, import_react.useCallback)(async (username, password) => {
		const { data: users, error } = await supabase.from("users").select("*");
		if (error) console.error("Login fetch users error:", error);
		const user = (users || state.users).find((u) => u.username === username);
		if (!user) {
			console.warn("User not found:", username);
			return null;
		}
		if (await hashPassword(password) !== user.password_hash) return null;
		const session = createSession(user);
		setState((prev) => ({
			...prev,
			session
		}));
		return session;
	}, [state.users]);
	const logout = (0, import_react.useCallback)(() => {
		clearSession();
		setState((prev) => ({
			...prev,
			session: null
		}));
	}, []);
	const addMember = async (data) => {
		const { error } = await supabase.from("members").insert([data]);
		if (!error) await refreshData();
	};
	const updateMember = async (id, data) => {
		const { error } = await supabase.from("members").update(data).eq("id", id);
		if (!error) await refreshData();
	};
	const deleteMember = async (id) => {
		const { error } = await supabase.from("members").delete().eq("id", id);
		if (!error) await refreshData();
	};
	const addHousehold = async (data) => {
		const { error } = await supabase.from("households").insert([data]);
		if (!error) await refreshData();
	};
	const updateHousehold = async (id, data) => {
		const { error } = await supabase.from("households").update(data).eq("id", id);
		if (!error) await refreshData();
	};
	const deleteHousehold = async (id) => {
		const { error } = await supabase.from("households").delete().eq("id", id);
		if (!error) await refreshData();
	};
	const addPurok = async (data) => {
		const { error } = await supabase.from("puroks").insert([data]);
		if (!error) await refreshData();
	};
	const updatePurok = async (id, data) => {
		const { error } = await supabase.from("puroks").update(data).eq("id", id);
		if (!error) await refreshData();
	};
	const deletePurok = async (id) => {
		const { error } = await supabase.from("puroks").delete().eq("id", id);
		if (!error) await refreshData();
	};
	const addUser = async (data) => {
		const { error } = await supabase.from("users").insert([data]);
		if (!error) await refreshData();
	};
	const deleteUser = async (id) => {
		const { error } = await supabase.from("users").delete().eq("id", id);
		if (!error) await refreshData();
	};
	const bulkImport = async (data) => {
		const { data: existingBarangays } = await supabase.from("barangays").select("id");
		if (existingBarangays && existingBarangays.length > 0) {
			const { error: delMembers } = await supabase.from("members").delete().neq("id", 0);
			if (delMembers) console.warn("Delete members:", delMembers.message);
			const { error: delHouseholds } = await supabase.from("households").delete().neq("id", 0);
			if (delHouseholds) console.warn("Delete households:", delHouseholds.message);
			const { error: delPuroks } = await supabase.from("puroks").delete().neq("id", 0);
			if (delPuroks) console.warn("Delete puroks:", delPuroks.message);
			const { error: delBarangays } = await supabase.from("barangays").delete().neq("id", 0);
			if (delBarangays) console.warn("Delete barangays:", delBarangays.message);
		}
		const bIdMap = /* @__PURE__ */ new Map();
		for (const b of data.barangays) {
			const { data: inserted, error } = await supabase.from("barangays").insert([{
				name: b.name,
				barangayCaptainName: b.barangayCaptainName
			}]).select().single();
			if (error) throw new Error(`Failed to insert barangay "${b.name}": ${error.message}`);
			bIdMap.set(b.id, inserted.id);
		}
		const pIdMap = /* @__PURE__ */ new Map();
		for (const p of data.puroks) {
			const newBId = bIdMap.get(p.barangayId);
			if (!newBId) continue;
			const { data: inserted, error } = await supabase.from("puroks").insert([{
				barangayId: newBId,
				name: p.name,
				purokLeaderName: p.purokLeaderName
			}]).select().single();
			if (error) throw new Error(`Failed to insert purok "${p.name}": ${error.message}`);
			pIdMap.set(p.id, inserted.id);
		}
		const hIdMap = /* @__PURE__ */ new Map();
		for (const h of data.households) {
			const newPId = pIdMap.get(h.purokId);
			if (!newPId) continue;
			const { data: inserted, error } = await supabase.from("households").insert([{
				purokId: newPId,
				householdLeaderName: h.householdLeaderName,
				address: h.address
			}]).select().single();
			if (error) throw new Error(`Failed to insert household "${h.householdLeaderName}": ${error.message}`);
			hIdMap.set(h.id, inserted.id);
		}
		const mappedMembers = [];
		for (const m of data.members) {
			const newHId = hIdMap.get(m.householdId);
			if (!newHId) continue;
			mappedMembers.push({
				householdId: newHId,
				lastName: m.lastName,
				firstName: m.firstName,
				middleName: m.middleName,
				precinct: m.precinct,
				no: m.no,
				pn: m.pn,
				address: m.address,
				code: m.code,
				is_purok_leader_indicator: m.is_purok_leader_indicator,
				is_household_leader: m.is_household_leader,
				is_household_member: m.is_household_member,
				age: m.age,
				religion: m.religion,
				status: m.status,
				sc: m.sc,
				pwd: m.pwd,
				ip: m.ip,
				remarks: m.remarks
			});
		}
		const chunkSize = 500;
		for (let i = 0; i < mappedMembers.length; i += chunkSize) {
			const chunk = mappedMembers.slice(i, i + chunkSize);
			const { error } = await supabase.from("members").insert(chunk);
			if (error) throw new Error(`Failed to insert members (batch ${Math.floor(i / chunkSize) + 1}): ${error.message}`);
		}
		await refreshData();
	};
	const value = {
		state,
		login,
		logout,
		addMember,
		updateMember,
		deleteMember,
		addHousehold,
		updateHousehold,
		deleteHousehold,
		addPurok,
		updatePurok,
		deletePurok,
		addUser,
		deleteUser,
		refreshData,
		bulkImport
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(StoreContext.Provider, {
		value,
		children
	});
}
//#endregion
export { hashPassword as n, useStore as r, StoreProvider as t };
