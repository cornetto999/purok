import type { User, UserRole } from "./types";

// ── Password hashing (SHA-256 via Web Crypto) ─────────────────────────────────

export async function hashPassword(plain: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(plain);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
}

export async function verifyPassword(plain: string, hash: string): Promise<boolean> {
  const computed = await hashPassword(plain);
  return computed === hash;
}

// ── Session management ────────────────────────────────────────────────────────

const SESSION_KEY = "brms_session";

export interface Session {
  userId: number;
  username: string;
  role: UserRole;
  linkedEntityId: number | null;
  displayName: string;
}

export function createSession(user: User): Session {
  const session: Session = {
    userId: user.id,
    username: user.username,
    role: user.role,
    linkedEntityId: user.linked_entity_id,
    displayName: user.displayName,
  };
  try {
    localStorage.setItem(SESSION_KEY, JSON.stringify(session));
  } catch {
    // localStorage may be unavailable in SSR
  }
  return session;
}

export function getSession(): Session | null {
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as Session;
  } catch {
    return null;
  }
}

export function clearSession(): void {
  try {
    localStorage.removeItem(SESSION_KEY);
  } catch {
    // localStorage may be unavailable in SSR
  }
}
