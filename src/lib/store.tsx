import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  type ReactNode,
} from "react";
import type { Barangay, Purok, Household, Member, User, Team } from "./types";
import type { DataSet } from "./excel";
import {
  hashPassword,
  createSession,
  getSession,
  clearSession,
  type Session,
} from "./auth";
import { supabase } from "./supabase";
import { fetchAllRows } from "./fetch-all-rows";

export interface AppState {
  barangays: Barangay[];
  puroks: Purok[];
  households: Household[];
  members: Member[];
  users: User[];
  teams: Team[];
  pendingDuplicates: PendingDuplicate[];
  session: Session | null;
  sessionChecked: boolean;
  initialized: boolean;
  loading: boolean;
  loadError: string | null;
}

export interface PendingDuplicate {
  id: string;
  importedMember: Omit<Member, "id">;
  existingMemberId: number;
}

export interface ImportResult {
  importedMembers: number;
  duplicateMembers: number;
}

export interface LoginResponse {
  success: boolean;
  session: Session | null;
  error?: string;
  accountLocked?: boolean;
  lockedUntil?: string | null;
}

interface StoreContextValue {
  state: AppState;
  login: (
    username: string,
    password: string,
    captchaToken?: string,
  ) => Promise<LoginResponse>;
  logout: () => void;

  // API Methods
  addMember: (data: Omit<Member, "id">) => Promise<void>;
  updateMember: (
    id: number,
    data: Partial<Omit<Member, "id">>,
  ) => Promise<void>;
  deleteMember: (id: number) => Promise<void>;

  addTeam: (data: Omit<Team, "id">) => Promise<void>;
  updateTeam: (
    id: number,
    data: Partial<Omit<Team, "id">>,
  ) => Promise<void>;
  deleteTeam: (id: number) => Promise<void>;

  addHousehold: (data: Omit<Household, "id">) => Promise<void>;
  updateHousehold: (
    id: number,
    data: Partial<Omit<Household, "id">>,
  ) => Promise<void>;
  deleteHousehold: (id: number) => Promise<void>;
  saveHouseholdWithUser: (
    householdData: Omit<Household, "id">,
    userAccount?: { username: string; password?: string },
    existingHouseholdId?: number,
  ) => Promise<void>;

  addPurok: (data: Omit<Purok, "id">) => Promise<void>;
  updatePurok: (id: number, data: Partial<Omit<Purok, "id">>) => Promise<void>;
  deletePurok: (id: number) => Promise<void>;
  savePurokWithUser: (
    purokData: Omit<Purok, "id">,
    userAccount?: { username: string; password?: string },
    existingPurokId?: number,
  ) => Promise<void>;

  addUser: (data: Omit<User, "id">) => Promise<void>;
  deleteUser: (id: number) => Promise<void>;

  refreshData: () => Promise<void>;
  assignLeaderPurok: (purokId: number) => Promise<void>;
  bulkImport: (data: DataSet) => Promise<ImportResult>;
  approveDuplicate: (id: string) => Promise<void>;
  dismissDuplicate: (id: string) => void;
  approveAllDuplicates: () => Promise<void>;
  dismissAllDuplicates: () => void;
}

const StoreContext = createContext<StoreContextValue | null>(null);
const PENDING_DUPLICATES_KEY = "brms_pending_duplicates";

function loadPendingDuplicates(): PendingDuplicate[] {
  if (typeof window === "undefined") return [];
  try {
    const saved = localStorage.getItem(PENDING_DUPLICATES_KEY);
    return saved ? JSON.parse(saved) : [];
  } catch {
    return [];
  }
}

export function duplicateKey(
  member: Pick<
    Member,
    "lastName" | "firstName" | "middleName" | "pn" | "no" | "address"
  >,
): string {
  const normalize = (value: string) =>
    value.trim().toLocaleLowerCase().replace(/\s+/g, " ");
  const name = [member.lastName, member.firstName, member.middleName]
    .map(normalize)
    .join("|");
  const identifier =
    normalize(member.pn) || normalize(member.no) || normalize(member.address);
  return `${name}|${identifier}`;
}

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
    teams: [],
    pendingDuplicates: [],
    session: null,
    sessionChecked: false,
    initialized: false,
    loading: false,
    loadError: null,
  });

  // Hydrate session and pendingDuplicates on client mount to avoid SSR hydration mismatch
  useEffect(() => {
    const session = getSession();
    const pendingDuplicates = loadPendingDuplicates();
    setState((prev) => ({
      ...prev,
      session,
      pendingDuplicates,
      sessionChecked: true,
    }));
  }, []);

  const refreshData = useCallback(async () => {
    setState((prev) => ({ ...prev, loading: true, loadError: null }));
    try {
      const [b, p, h, m, u, t] = await Promise.all([
        fetchAllRows<Barangay>((from, to) =>
          supabase.from("barangays").select("*", from === 0 ? { count: "exact" } : {}).order("id").range(from, to),
        ),
        fetchAllRows<Purok>((from, to) =>
          supabase.from("puroks").select("*", from === 0 ? { count: "exact" } : {}).order("id").range(from, to),
        ),
        fetchAllRows<Household>((from, to) =>
          supabase.from("households").select("*", from === 0 ? { count: "exact" } : {}).order("id").range(from, to),
        ),
        fetchAllRows<Member>((from, to) =>
          supabase.from("members").select("*", from === 0 ? { count: "exact" } : {}).order("id").range(from, to),
        ),
        fetchAllRows<User>((from, to) =>
          supabase.from("users").select("*", from === 0 ? { count: "exact" } : {}).order("id").range(from, to),
        ),
        // Older databases may not have the optional teams table yet.
        fetchAllRows<Team>((from, to) =>
          supabase.from("teams").select("*", from === 0 ? { count: "exact" } : {}).order("id").range(from, to),
        ).catch(() => {
          console.warn("Teams could not be loaded — skipping optional team data.");
          return [] as Team[];
        }),
      ]);

      const savedSession = getSession();
      const currentUser = savedSession
        ? u.find((user) =>
            user.id === savedSession.userId && user.username === savedSession.username,
          )
        : undefined;
      const session = currentUser ? createSession(currentUser) : savedSession;

      setState((prev) => ({
        ...prev,
        barangays: b,
        puroks: p,
        households: h,
        members: m,
        users: u,
        teams: t,
        session,
        initialized: true,
        loading: false,
        loadError: null,
      }));
    } catch (err) {
      console.error("Failed to load data from Supabase", err);
      setState((prev) => ({
        ...prev,
        loading: false,
        loadError: "Could not load your records. Check your connection and try again.",
      }));
    }
  }, []);

  useEffect(() => {
    void refreshData();
  }, [refreshData]);

  const login = useCallback(
    async (
      username: string,
      password: string,
      captchaToken: string = "",
    ): Promise<LoginResponse> => {
      try {
        const res = await fetch("/api/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ username, password, captchaToken }),
        });

        const data = (await res.json()) as {
          success?: boolean;
          user?: User;
          error?: string;
          accountLocked?: boolean;
          lockedUntil?: string | null;
        };

        if (data.success && data.user) {
          const session = createSession(data.user);
          setState((prev) => ({ ...prev, session }));
          return { success: true, session };
        }

        return {
          success: false,
          session: null,
          error: data.error || "Invalid username or password.",
          accountLocked: Boolean(data.accountLocked),
          lockedUntil: data.lockedUntil || null,
        };
      } catch (err) {
        console.error("Login fetch error:", err);
        return {
          success: false,
          session: null,
          error: "Unable to connect to login server. Please try again.",
        };
      }
    },
    [],
  );

  const logout = useCallback(() => {
    clearSession();
    setState((prev) => ({ ...prev, session: null }));
  }, []);

  const assignLeaderPurok = async (purokId: number) => {
    const session = state.session;
    if (!session || session.role !== "Purok Leader") {
      throw new Error("Sign in as a Purok Leader to claim members.");
    }
    const { data: user, error } = await supabase
      .from("users")
      .update({ linked_entity_id: purokId })
      .eq("id", session.userId)
      .eq("username", session.username)
      .eq("role", "Purok Leader")
      .select()
      .single();
    if (error || !user) {
      throw new Error("Could not link your purok. Sign in again with your current account and retry.");
    }
    const updatedSession = createSession(user);
    setState((prev) => ({
      ...prev,
      session: updatedSession,
      users: prev.users.map((item) => item.id === user.id ? user : item),
    }));
  };

  // CRUD Implementations
  const addMember = async (data: Omit<Member, "id">) => {
    const precinctVal = data.precinct || data.pn || "";
    // Normalize team field: DB uses snake_case team_id; drop camelCase teamId
    const { teamId: _teamId, ...rest } = data as typeof data & { teamId?: number | null };
    const payload = {
      ...rest,
      precinct: precinctVal,
      pn: precinctVal,
      team_id: rest.team_id ?? _teamId ?? null,
    };
    const { data: inserted, error } = await supabase.from("members").insert([payload]).select().single();
    if (error) throw new Error(`Could not add member: ${error.message}`);
    if (inserted) {
      setState(prev => ({ ...prev, members: [...prev.members, inserted] }));
    }
  };
  const updateMember = async (
    id: number,
    data: Partial<Omit<Member, "id">>,
  ) => {
    // Normalize team field: DB uses snake_case team_id; drop camelCase teamId
    const { teamId: _teamId, ...rest } = data as typeof data & { teamId?: number | null };
    const patch: Record<string, unknown> = { ...rest };
    if (rest.precinct !== undefined || rest.pn !== undefined) {
      const precinctVal = rest.precinct ?? rest.pn ?? "";
      patch["precinct"] = precinctVal;
      patch["pn"] = precinctVal;
    }
    // If teamId was supplied (camelCase), map it to team_id
    if (_teamId !== undefined) {
      patch["team_id"] = _teamId;
    }
    const { data: updated, error } = await supabase.from("members").update(patch).eq("id", id).select().single();
    if (error) throw new Error(`Could not save member: ${error.message}`);
    if (updated) {
      setState(prev => ({ ...prev, members: prev.members.map(m => m.id === id ? updated : m) }));
    }
  };
  const deleteMember = async (id: number) => {
    const { error } = await supabase.from("members").delete().eq("id", id);
    if (!error) {
      setState(prev => ({ ...prev, members: prev.members.filter(m => m.id !== id) }));
    }
  };

  const addTeam = async (data: Omit<Team, "id">) => {
    const { data: inserted, error } = await supabase.from("teams").insert([data]).select().single();
    if (!error && inserted) setState(prev => ({ ...prev, teams: [...prev.teams, inserted] }));
  };
  const updateTeam = async (
    id: number,
    data: Partial<Omit<Team, "id">>,
  ) => {
    const { data: updated, error } = await supabase.from("teams").update(data).eq("id", id).select().single();
    if (!error && updated) setState(prev => ({ ...prev, teams: prev.teams.map(t => t.id === id ? updated : t) }));
  };
  const deleteTeam = async (id: number) => {
    const { error } = await supabase.from("teams").delete().eq("id", id);
    if (!error) setState(prev => ({ ...prev, teams: prev.teams.filter(t => t.id !== id) }));
  };

  const addHousehold = async (data: Omit<Household, "id">) => {
    const { barangayId, ...rest } = data;
    const { data: inserted, error } = await supabase.from("households").insert([rest]).select().single();
    if (!error && inserted) setState(prev => ({ ...prev, households: [...prev.households, inserted] }));
  };
  const updateHousehold = async (
    id: number,
    data: Partial<Omit<Household, "id">>,
  ) => {
    const { barangayId, ...rest } = data;
    const { data: updated, error } = await supabase
      .from("households")
      .update(rest)
      .eq("id", id)
      .select().single();
    if (!error && updated) setState(prev => ({ ...prev, households: prev.households.map(h => h.id === id ? updated : h) }));
  };
  const deleteHousehold = async (id: number) => {
    const { error } = await supabase.from("households").delete().eq("id", id);
    if (!error) setState(prev => ({ ...prev, households: prev.households.filter(h => h.id !== id) }));
  };

  const addPurok = async (data: Omit<Purok, "id">) => {
    const { data: inserted, error } = await supabase.from("puroks").insert([data]).select().single();
    if (!error && inserted) setState(prev => ({ ...prev, puroks: [...prev.puroks, inserted] }));
  };
  const updatePurok = async (id: number, data: Partial<Omit<Purok, "id">>) => {
    const { data: updated, error } = await supabase.from("puroks").update(data).eq("id", id).select().single();
    if (!error && updated) setState(prev => ({ ...prev, puroks: prev.puroks.map(p => p.id === id ? updated : p) }));
  };
  const deletePurok = async (id: number) => {
    const { error } = await supabase.from("puroks").delete().eq("id", id);
    if (!error) setState(prev => ({ ...prev, puroks: prev.puroks.filter(p => p.id !== id) }));
  };

  const addUser = async (data: Omit<User, "id">) => {
    const { data: inserted, error } = await supabase.from("users").insert([data]).select().single();
    if (!error && inserted) setState(prev => ({ ...prev, users: [...prev.users, inserted] }));
  };
  const deleteUser = async (id: number) => {
    const { error } = await supabase.from("users").delete().eq("id", id);
    if (!error) setState(prev => ({ ...prev, users: prev.users.filter(u => u.id !== id) }));
  };
  const saveHouseholdWithUser = async (
    householdData: Omit<Household, "id">,
    userAccount?: { username: string; password?: string },
    existingHouseholdId?: number,
  ) => {
    let targetHouseholdId = existingHouseholdId;
    if (existingHouseholdId) {
      const { error } = await supabase
        .from("households")
        .update(householdData)
        .eq("id", existingHouseholdId);
      if (error) throw new Error(`Failed to update household: ${error.message}`);
    } else {
      const { data: inserted, error } = await supabase
        .from("households")
        .insert([householdData])
        .select()
        .single();
      if (error || !inserted) {
        throw new Error(
          `Failed to create household: ${error?.message || "Unknown error"}`,
        );
      }
      targetHouseholdId = inserted.id;
    }

    if (targetHouseholdId && userAccount && userAccount.username.trim()) {
      const cleanUsername = userAccount.username.trim();
      const existingUser = state.users.find(
        (u) =>
          (u.role === "Household Leader" &&
            u.linked_entity_id === targetHouseholdId) ||
          u.username.toLowerCase() === cleanUsername.toLowerCase(),
      );

      if (existingUser) {
        const updatePayload: Record<string, unknown> = {
          username: cleanUsername,
          displayName: householdData.householdLeaderName,
          linked_entity_id: targetHouseholdId,
          role: "Household Leader",
        };
        if (userAccount.password && userAccount.password.trim()) {
          updatePayload["password_hash"] = await hashPassword(
            userAccount.password.trim(),
          );
          updatePayload["failed_login_attempts"] = 0;
          updatePayload["account_locked_until"] = null;
        }
        const { error } = await supabase
          .from("users")
          .update(updatePayload)
          .eq("id", existingUser.id);
        if (error)
          throw new Error(`Failed to update user account: ${error.message}`);
      } else {
        const passwordToHash = userAccount.password?.trim() || "household123";
        const password_hash = await hashPassword(passwordToHash);
        const { error } = await supabase.from("users").insert([
          {
            username: cleanUsername,
            password_hash,
            role: "Household Leader" as const,
            linked_entity_id: targetHouseholdId,
            displayName: householdData.householdLeaderName,
          },
        ]);
        if (error)
          throw new Error(`Failed to create user account: ${error.message}`);
      }
    }

    await refreshData();
  };

  const savePurokWithUser = async (
    purokData: Omit<Purok, "id">,
    userAccount?: { username: string; password?: string },
    existingPurokId?: number,
  ) => {
    let targetPurokId = existingPurokId;
    if (existingPurokId) {
      const { error } = await supabase
        .from("puroks")
        .update(purokData)
        .eq("id", existingPurokId);
      if (error) throw new Error(`Failed to update purok: ${error.message}`);
    } else {
      const { data: inserted, error } = await supabase
        .from("puroks")
        .insert([purokData])
        .select()
        .single();
      if (error || !inserted) {
        throw new Error(
          `Failed to create purok: ${error?.message || "Unknown error"}`,
        );
      }
      targetPurokId = inserted.id;
    }

    if (targetPurokId && userAccount && userAccount.username.trim()) {
      const cleanUsername = userAccount.username.trim();
      const existingUser = state.users.find(
        (u) =>
          (u.role === "Purok Leader" && u.linked_entity_id === targetPurokId) ||
          u.username.toLowerCase() === cleanUsername.toLowerCase(),
      );

      if (existingUser) {
        const updatePayload: Record<string, unknown> = {
          username: cleanUsername,
          displayName: purokData.purokLeaderName,
          linked_entity_id: targetPurokId,
          role: "Purok Leader",
        };
        if (userAccount.password && userAccount.password.trim()) {
          updatePayload["password_hash"] = await hashPassword(
            userAccount.password.trim(),
          );
          updatePayload["failed_login_attempts"] = 0;
          updatePayload["account_locked_until"] = null;
        }
        const { error } = await supabase
          .from("users")
          .update(updatePayload)
          .eq("id", existingUser.id);
        if (error)
          throw new Error(`Failed to update user account: ${error.message}`);
      } else {
        const passwordToHash = userAccount.password?.trim() || "purok123";
        const password_hash = await hashPassword(passwordToHash);
        const { error } = await supabase.from("users").insert([
          {
            username: cleanUsername,
            password_hash,
            role: "Purok Leader" as const,
            linked_entity_id: targetPurokId,
            displayName: purokData.purokLeaderName,
          },
        ]);
        if (error)
          throw new Error(`Failed to create user account: ${error.message}`);
      }
    }

    await refreshData();
  };

  const savePendingDuplicates = (duplicates: PendingDuplicate[]) => {
    localStorage.setItem(PENDING_DUPLICATES_KEY, JSON.stringify(duplicates));
    setState((prev) => ({ ...prev, pendingDuplicates: duplicates }));
  };

  const bulkImport = async (data: DataSet): Promise<ImportResult> => {
    const [barangayResult, purokResult, householdResult, memberResult] =
      await Promise.all([
        fetchAllRows<Barangay>((from, to) =>
          supabase.from("barangays").select("*", from === 0 ? { count: "exact" } : {}).order("id").range(from, to),
        ),
        fetchAllRows<Purok>((from, to) =>
          supabase.from("puroks").select("*", from === 0 ? { count: "exact" } : {}).order("id").range(from, to),
        ),
        fetchAllRows<Household>((from, to) =>
          supabase.from("households").select("*", from === 0 ? { count: "exact" } : {}).order("id").range(from, to),
        ),
        fetchAllRows<Member>((from, to) =>
          supabase.from("members").select("*", from === 0 ? { count: "exact" } : {}).order("id").range(from, to),
        ),
      ]);

    const existingBarangays = barangayResult;
    const existingPuroks = purokResult;
    const existingHouseholds = householdResult;
    const existingMembers = memberResult;
    const normalize = (value: string) => value.trim().toLocaleLowerCase();

    // Insert only missing records, preserving the existing hierarchy and residents.
    const bIdMap = new Map<number, number>();
    for (const b of data.barangays) {
      const existing = existingBarangays.find(
        (item) => normalize(item.name) === normalize(b.name),
      );
      if (existing) {
        bIdMap.set(b.id, existing.id);
        continue;
      }
      const { data: inserted, error } = await supabase
        .from("barangays")
        .insert([{ name: b.name, barangayCaptainName: b.barangayCaptainName }])
        .select()
        .single();
      if (error)
        throw new Error(
          `Failed to insert barangay "${b.name}": ${error.message}`,
        );
      bIdMap.set(b.id, inserted.id);
    }

    const pIdMap = new Map<number, number>();
    for (const p of data.puroks) {
      const newBId = bIdMap.get(p.barangayId);
      if (!newBId) continue;
      const existing = existingPuroks.find(
        (item) =>
          item.barangayId === newBId &&
          normalize(item.name) === normalize(p.name),
      );
      if (existing) {
        pIdMap.set(p.id, existing.id);
        continue;
      }
      const { data: inserted, error } = await supabase
        .from("puroks")
        .insert([
          {
            barangayId: newBId,
            name: p.name,
            purokLeaderName: p.purokLeaderName,
          },
        ])
        .select()
        .single();
      if (error)
        throw new Error(`Failed to insert purok "${p.name}": ${error.message}`);
      pIdMap.set(p.id, inserted.id);
    }

    const hIdMap = new Map<number, number>();
    for (const h of data.households) {
      const newPId = pIdMap.get(h.purokId);
      if (!newPId) continue;
      const originalPurok = data.puroks.find((p) => p.id === h.purokId);
      const newBId = originalPurok ? bIdMap.get(originalPurok.barangayId) : undefined;
      const existing = existingHouseholds.find(
        (item) =>
          item.purokId === newPId &&
          normalize(item.householdLeaderName) ===
            normalize(h.householdLeaderName) &&
          normalize(item.address) === normalize(h.address),
      );
      if (existing) {
        hIdMap.set(h.id, existing.id);
        continue;
      }
      const { data: inserted, error } = await supabase
        .from("households")
        .insert([
          {
            purokId: newPId,
            ...(newBId !== undefined ? { barangayId: newBId } : {}),
            householdLeaderName: h.householdLeaderName,
            address: h.address,
          },
        ])
        .select()
        .single();
      if (error)
        throw new Error(
          `Failed to insert household "${h.householdLeaderName}": ${error.message}`,
        );
      hIdMap.set(h.id, inserted.id);
    }

    const existingByDuplicateKey = new Map(
      existingMembers.map((member) => [duplicateKey(member), member]),
    );
    const seenImportKeys = new Set<string>();
    const mappedMembers: Omit<Member, "id">[] = [];
    const duplicates: PendingDuplicate[] = [];
    for (const m of data.members) {
      const newHId = hIdMap.get(m.householdId);
      if (!newHId) continue;
      const originalHousehold = data.households.find((h) => h.id === m.householdId);
      const originalPurok = originalHousehold ? data.puroks.find((p) => p.id === originalHousehold.purokId) : null;
      const mappedBarangayId = originalPurok ? bIdMap.get(originalPurok.barangayId) : undefined;

      const mappedMember: Omit<Member, "id"> = {
        householdId: newHId,
        ...(mappedBarangayId !== undefined ? { barangayId: mappedBarangayId } : {}),
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
      };
      const key = duplicateKey(mappedMember);
      const existing = existingByDuplicateKey.get(key);
      if (existing || seenImportKeys.has(key)) {
        duplicates.push({
          id: crypto.randomUUID(),
          importedMember: mappedMember,
          existingMemberId: existing?.id ?? 0,
        });
        continue;
      }
      seenImportKeys.add(key);
      mappedMembers.push(mappedMember);
    }

    const chunkSize = 500;
    for (let i = 0; i < mappedMembers.length; i += chunkSize) {
      const chunk = mappedMembers.slice(i, i + chunkSize);
      const { error } = await supabase.from("members").insert(chunk);
      if (error)
        throw new Error(
          `Failed to insert members (batch ${Math.floor(i / chunkSize) + 1}): ${error.message}`,
        );
    }

    if (duplicates.length > 0) {
      savePendingDuplicates([...loadPendingDuplicates(), ...duplicates]);
    }
    await refreshData();
    return {
      importedMembers: mappedMembers.length,
      duplicateMembers: duplicates.length,
    };
  };

  const approveDuplicate = async (id: string) => {
    const pending = state.pendingDuplicates.find(
      (duplicate) => duplicate.id === id,
    );
    if (!pending) return;
    const { error } = await supabase
      .from("members")
      .insert([pending.importedMember]);
    if (error) throw new Error(`Could not approve member: ${error.message}`);
    savePendingDuplicates(
      state.pendingDuplicates.filter((duplicate) => duplicate.id !== id),
    );
    await refreshData();
  };

  const dismissDuplicate = (id: string) => {
    savePendingDuplicates(
      state.pendingDuplicates.filter((duplicate) => duplicate.id !== id),
    );
  };

  const approveAllDuplicates = async () => {
    let remaining = state.pendingDuplicates;
    const chunkSize = 500;
    for (
      let index = 0;
      index < state.pendingDuplicates.length;
      index += chunkSize
    ) {
      const chunk = state.pendingDuplicates.slice(index, index + chunkSize);
      const { error } = await supabase
        .from("members")
        .insert(chunk.map((duplicate) => duplicate.importedMember));
      if (error)
        throw new Error(`Could not approve duplicates: ${error.message}`);
      const approvedIds = new Set(chunk.map((duplicate) => duplicate.id));
      remaining = remaining.filter(
        (duplicate) => !approvedIds.has(duplicate.id),
      );
      savePendingDuplicates(remaining);
    }
    await refreshData();
  };

  const dismissAllDuplicates = () => {
    savePendingDuplicates([]);
  };

  const value: StoreContextValue = {
    state,
    login,
    logout,
    addMember,
    updateMember,
    deleteMember,
    addTeam,
    updateTeam,
    deleteTeam,
    addHousehold,
    updateHousehold,
    deleteHousehold,
    saveHouseholdWithUser,
    addPurok,
    updatePurok,
    deletePurok,
    savePurokWithUser,
    addUser,
    deleteUser,
    refreshData,
    assignLeaderPurok,
    bulkImport,
    approveDuplicate,
    dismissDuplicate,
    approveAllDuplicates,
    dismissAllDuplicates,
  };

  return (
    <StoreContext.Provider value={value}>{children}</StoreContext.Provider>
  );
}
