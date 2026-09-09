import { createContext, useContext, useEffect, useState, useCallback, type ReactNode } from "react";
import type { Barangay, Purok, Household, Member, User } from "./types";
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
    const { data: users } = await supabase.from("users").select("*");
    const userList = users || state.users;
    
    const user = userList.find((u) => u.username === username);
    if (!user) return null;

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
  };

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}
