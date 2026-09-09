import { createContext, useContext, useEffect, useState, useCallback, type ReactNode } from "react";
import type { Barangay, Purok, Household, Member, User } from "./types";
import type { DataSet } from "./excel";
import { hashPassword, createSession, getSession, clearSession, type Session } from "./auth";
import { supabase } from "./supabase";

export interface AppState {
  barangays: Barangay[];
  puroks: Purok[];
  households: Household[];
  members: Member[];
  users: User[];
  session: Session | null;
  initialized: boolean;
}

interface StoreContextValue {
  state: AppState;
  login: (username: string, password: string) => Promise<Session | null>;
  logout: () => void;

  // API Methods
  addMember: (data: Omit<Member, "id">) => Promise<void>;
  updateMember: (id: number, data: Partial<Omit<Member, "id">>) => Promise<void>;
  deleteMember: (id: number) => Promise<void>;

  addHousehold: (data: Omit<Household, "id">) => Promise<void>;
  updateHousehold: (id: number, data: Partial<Omit<Household, "id">>) => Promise<void>;
  deleteHousehold: (id: number) => Promise<void>;

  addPurok: (data: Omit<Purok, "id">) => Promise<void>;
  updatePurok: (id: number, data: Partial<Omit<Purok, "id">>) => Promise<void>;
  deletePurok: (id: number) => Promise<void>;

  addUser: (data: Omit<User, "id">) => Promise<void>;
  deleteUser: (id: number) => Promise<void>;

  refreshData: () => Promise<void>;
  bulkImport: (data: DataSet) => Promise<void>;
}

const StoreContext = createContext<StoreContextValue | null>(null);

export function useStore(): StoreContextValue {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error("useStore must be used within StoreProvider");
  return ctx;
}

export function StoreProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AppState>({
    barangays: [],
    puroks: [],
    households: [],
    members: [],
    users: [],
    session: getSession(),
    initialized: false,
  });

  const refreshData = useCallback(async () => {
    try {
      const [b, p, h, m, u] = await Promise.all([
        supabase.from("barangays").select("*"),
        supabase.from("puroks").select("*"),
        supabase.from("households").select("*"),
        supabase.from("members").select("*"),
        supabase.from("users").select("*"),
      ]);

      setState((prev) => ({
        ...prev,
        barangays: b.data || [],
        puroks: p.data || [],
        households: h.data || [],
        members: m.data || [],
        users: u.data || [],
        initialized: true,
      }));
    } catch (err) {
      console.error("Failed to load data from Supabase", err);
    }
  }, []);

  useEffect(() => {
    void refreshData();
  }, [refreshData]);

  const login = useCallback(async (username: string, password: string): Promise<Session | null> => {
    // Refresh users just in case
    const { data: users, error } = await supabase.from("users").select("*");
    if (error) console.error("Login fetch users error:", error);
    
    const userList = users || state.users;
    
    const user = userList.find((u) => u.username === username);
    if (!user) {
      console.warn("User not found:", username);
      return null;
    }

    const hash = await hashPassword(password);
    if (hash !== user.password_hash) return null;

    const session = createSession(user);
    setState((prev) => ({ ...prev, session }));
    return session;
  }, [state.users]);

  const logout = useCallback(() => {
    clearSession();
    setState((prev) => ({ ...prev, session: null }));
  }, []);

  // CRUD Implementations
  const addMember = async (data: Omit<Member, "id">) => {
    const { error } = await supabase.from("members").insert([data]);
    if (!error) await refreshData();
  };
  const updateMember = async (id: number, data: Partial<Omit<Member, "id">>) => {
    const { error } = await supabase.from("members").update(data).eq("id", id);
    if (!error) await refreshData();
  };
  const deleteMember = async (id: number) => {
    const { error } = await supabase.from("members").delete().eq("id", id);
    if (!error) await refreshData();
  };

  const addHousehold = async (data: Omit<Household, "id">) => {
    const { error } = await supabase.from("households").insert([data]);
    if (!error) await refreshData();
  };
  const updateHousehold = async (id: number, data: Partial<Omit<Household, "id">>) => {
    const { error } = await supabase.from("households").update(data).eq("id", id);
    if (!error) await refreshData();
  };
  const deleteHousehold = async (id: number) => {
    const { error } = await supabase.from("households").delete().eq("id", id);
    if (!error) await refreshData();
  };

  const addPurok = async (data: Omit<Purok, "id">) => {
    const { error } = await supabase.from("puroks").insert([data]);
    if (!error) await refreshData();
  };
  const updatePurok = async (id: number, data: Partial<Omit<Purok, "id">>) => {
    const { error } = await supabase.from("puroks").update(data).eq("id", id);
    if (!error) await refreshData();
  };
  const deletePurok = async (id: number) => {
    const { error } = await supabase.from("puroks").delete().eq("id", id);
    if (!error) await refreshData();
  };

  const addUser = async (data: Omit<User, "id">) => {
    const { error } = await supabase.from("users").insert([data]);
    if (!error) await refreshData();
  };
  const deleteUser = async (id: number) => {
    const { error } = await supabase.from("users").delete().eq("id", id);
    if (!error) await refreshData();
  };

  const bulkImport = async (data: DataSet) => {
    // 1. Delete all existing members, households, puroks, barangays (reverse order for FK safety)
    const { data: existingBarangays } = await supabase.from("barangays").select("id");
    if (existingBarangays && existingBarangays.length > 0) {
      // Delete members first, then households, puroks, barangays
      const { error: delMembers } = await supabase.from("members").delete().neq("id", 0);
      if (delMembers) console.warn("Delete members:", delMembers.message);
      const { error: delHouseholds } = await supabase.from("households").delete().neq("id", 0);
      if (delHouseholds) console.warn("Delete households:", delHouseholds.message);
      const { error: delPuroks } = await supabase.from("puroks").delete().neq("id", 0);
      if (delPuroks) console.warn("Delete puroks:", delPuroks.message);
      const { error: delBarangays } = await supabase.from("barangays").delete().neq("id", 0);
      if (delBarangays) console.warn("Delete barangays:", delBarangays.message);
    }

    // 2. Insert Barangays and map IDs
    const bIdMap = new Map<number, number>();
    for (const b of data.barangays) {
      const { data: inserted, error } = await supabase
        .from("barangays")
        .insert([{ name: b.name, barangayCaptainName: b.barangayCaptainName }])
        .select()
        .single();
      if (error) throw new Error(`Failed to insert barangay "${b.name}": ${error.message}`);
      bIdMap.set(b.id, inserted.id);
    }

    // 3. Insert Puroks and map IDs
    const pIdMap = new Map<number, number>();
    for (const p of data.puroks) {
      const newBId = bIdMap.get(p.barangayId);
      if (!newBId) continue;
      const { data: inserted, error } = await supabase
        .from("puroks")
        .insert([{ barangayId: newBId, name: p.name, purokLeaderName: p.purokLeaderName }])
        .select()
        .single();
      if (error) throw new Error(`Failed to insert purok "${p.name}": ${error.message}`);
      pIdMap.set(p.id, inserted.id);
    }

    // 4. Insert Households and map IDs
    const hIdMap = new Map<number, number>();
    for (const h of data.households) {
      const newPId = pIdMap.get(h.purokId);
      if (!newPId) continue;
      const { data: inserted, error } = await supabase
        .from("households")
        .insert([{ purokId: newPId, householdLeaderName: h.householdLeaderName, address: h.address }])
        .select()
        .single();
      if (error) throw new Error(`Failed to insert household "${h.householdLeaderName}": ${error.message}`);
      hIdMap.set(h.id, inserted.id);
    }

    // 5. Insert Members in chunks
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
        remarks: m.remarks,
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

  const value: StoreContextValue = {
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
    bulkImport,
  };

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}
