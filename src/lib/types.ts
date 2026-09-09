export interface Barangay {
  id: number;
  name: string;
  barangayCaptainName: string;
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
  householdLeaderName: string;
  address: string;
}

export type CivilStatus = "Single" | "Married" | "Widowed" | "Separated";

export interface Member {
  id: number;
  householdId: number;

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
    };
  };
}
