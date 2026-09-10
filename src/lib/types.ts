export interface Barangay {
  id: number;
  name: string;
  barangayCaptainName: string;
}

export interface Team {
  id: number;
  barangay_id: number;
  team_name: string;
  description?: string;
}

export interface Purok {
  id: number;
  barangayId: number;
  name: string;
  purokLeaderName: string;
}

export interface Household {
  id: number;
  purokId: number;
  barangayId?: number;
  householdLeaderName: string;
  address: string;
}

export type CivilStatus = "Single" | "Married" | "Widowed" | "Separated";

export interface Member {
  id: number;
  householdId: number;
  purok_id?: number | null;
  barangayId?: number;
  teamId?: number | null;
  team_id?: number | null;

  lastName: string;
  firstName: string;
  middleName: string;

  precinct: string;
  no: string;
  pn: string;
  address: string;
  code: string;

  is_purok_leader_indicator: boolean;
  is_household_leader: boolean;
  is_household_member: boolean;

  age: number;
  religion: string;
  status: CivilStatus;

  sc: boolean;
  pwd: boolean;
  ip: boolean;

  remarks: string;
}

export type UserRole = "Admin" | "Purok Leader" | "Household Leader";

export interface User {
  id: number;
  username: string;
  password_hash: string;
  role: UserRole;
  linked_entity_id: number | null;
  displayName: string;
  failed_login_attempts?: number;
  account_locked_until?: string | null;
}

export type SecurityEventType = "FAILED_LOGIN" | "ACCOUNT_LOCKED" | "CAPTCHA_FAILED";

export interface SecurityLog {
  id: string;
  user_id: number | null;
  attempted_username: string;
  ip_address: string;
  event_type: SecurityEventType;
  created_at: string;
}

/** Computed full name for display */
export function memberFullName(m: Member): string {
  const parts = [m.lastName, m.firstName, m.middleName].filter(Boolean);
  if (m.lastName && (m.firstName || m.middleName)) {
    return `${m.lastName}, ${[m.firstName, m.middleName].filter(Boolean).join(" ")}`;
  }
  return parts.join(" ") || "—";
}

// Supabase Database Type
export interface Database {
  public: {
    Tables: {
      barangays: {
        Row: Barangay;
        Insert: Omit<Barangay, "id">;
        Update: Partial<Omit<Barangay, "id">>;
      };
      teams: {
        Row: Team;
        Insert: Omit<Team, "id">;
        Update: Partial<Omit<Team, "id">>;
      };
      puroks: {
        Row: Purok;
        Insert: Omit<Purok, "id">;
        Update: Partial<Omit<Purok, "id">>;
      };
      households: {
        Row: Household;
        Insert: Omit<Household, "id">;
        Update: Partial<Omit<Household, "id">>;
      };
      members: {
        Row: Member;
        Insert: Omit<Member, "id">;
        Update: Partial<Omit<Member, "id">>;
      };
      users: {
        Row: User;
        Insert: Omit<User, "id">;
        Update: Partial<Omit<User, "id">>;
      };
      security_logs: {
        Row: SecurityLog;
        Insert: Omit<SecurityLog, "id" | "created_at">;
        Update: Partial<Omit<SecurityLog, "id">>;
      };
    };
  };
}
