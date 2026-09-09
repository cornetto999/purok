import { supabase } from "./supabase";
import { hashPassword } from "./auth";
import type { User, SecurityEventType, Session } from "./types";

const GOOGLE_VERIFY_URL = "https://www.google.com/recaptcha/api/siteverify";
const DEFAULT_SECRET_KEY = "6LeIxAcTAAAAAGG-vFI1TnRWxMZNFuojJ4WifJWe"; // Official Google reCAPTCHA v2 test key

// Helper to get environment variable safely across runtime environments
function getEnv(key: string): string {
  if (typeof process !== "undefined" && process.env && process.env[key]) {
    return process.env[key]!;
  }
  if (typeof import.meta !== "undefined" && (import.meta as unknown as { env: Record<string, string> }).env) {
    return (import.meta as unknown as { env: Record<string, string> }).env[key] || "";
  }
  return "";
}

/**
 * Step A: Verify Google reCAPTCHA v2 token with Google endpoint
 */
export async function verifyRecaptcha(
  token: string,
  remoteIp?: string,
): Promise<{ success: boolean; errorCodes?: string[] }> {
  if (!token || !token.trim()) {
    return { success: false, errorCodes: ["missing-input-response"] };
  }

  const secret = getEnv("RECAPTCHA_SECRET_KEY") || DEFAULT_SECRET_KEY;

  try {
    const params = new URLSearchParams();
    params.append("secret", secret);
    params.append("response", token.trim());
    if (remoteIp) {
      params.append("remoteip", remoteIp);
    }

    const res = await fetch(GOOGLE_VERIFY_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: params.toString(),
    });

    const data = (await res.json()) as {
      success: boolean;
      "error-codes"?: string[];
    };

    return {
      success: Boolean(data.success),
      errorCodes: data["error-codes"],
    };
  } catch (err) {
    console.error("Failed to verify reCAPTCHA with Google:", err);
    // On unexpected network error, return false
    return { success: false, errorCodes: ["network-error"] };
  }
}

/**
 * Log security incident to Security_Logs table
 */
export async function logSecurityEvent({
  userId = null,
  username,
  ipAddress,
  eventType,
}: {
  userId?: number | null;
  username: string;
  ipAddress: string;
  eventType: SecurityEventType;
}): Promise<void> {
  try {
    const { error } = await supabase.from("security_logs").insert([
      {
        user_id: userId,
        attempted_username: username,
        ip_address: ipAddress || "127.0.0.1",
        event_type: eventType,
      },
    ]);
    if (error) {
      console.error("Failed to insert security log into Supabase:", error);
    }
  } catch (err) {
    console.error("Exception logging security event:", err);
  }
}

export interface LoginResult {
  success: boolean;
  user?: User;
  session?: Session;
  error?: string;
  accountLocked?: boolean;
  lockedUntil?: string | null;
  status: number;
}

/**
 * Comprehensive rate-limiting authentication handler enforcing:
 * - Step A: reCAPTCHA v2 token verification (Google endpoint)
 * - Step B: Account lock verification (account_locked_until)
 * - Step C: Password check with 4-attempt threshold and 15-min lockout
 */
export async function handleSecureLogin({
  username,
  password,
  captchaToken,
  clientIp,
}: {
  username: string;
  password: string;
  captchaToken: string;
  clientIp: string;
}): Promise<LoginResult> {
  const trimmedUsername = (username || "").trim();
  const cleanIp = clientIp || "127.0.0.1";

  // ─────────────────────────────────────────────────────────────
  // Step A: Verify reCAPTCHA token using Google's verification endpoint
  // ─────────────────────────────────────────────────────────────
  const captchaResult = await verifyRecaptcha(captchaToken, cleanIp);
  if (!captchaResult.success) {
    await logSecurityEvent({
      username: trimmedUsername,
      ipAddress: cleanIp,
      eventType: "CAPTCHA_FAILED",
    });
    return {
      success: false,
      error: "CAPTCHA verification failed. Please check 'I'm not a robot' and try again.",
      status: 400,
    };
  }

  // ─────────────────────────────────────────────────────────────
  // Step B: Fetch user by username and check account lock
  // ─────────────────────────────────────────────────────────────
  const { data: users, error: fetchErr } = await supabase
    .from("users")
    .select("*")
    .eq("username", trimmedUsername)
    .limit(1);

  if (fetchErr) {
    console.error("Error fetching user from database:", fetchErr);
    return {
      success: false,
      error: "Internal authentication error.",
      status: 500,
    };
  }

  const user = (users && users[0]) as User | undefined;

  // If user exists, check if account is currently locked
  if (user && user.account_locked_until) {
    const lockedUntilDate = new Date(user.account_locked_until);
    const now = new Date();

    if (now.getTime() < lockedUntilDate.getTime()) {
      // Account is currently locked
      return {
        success: false,
        accountLocked: true,
        lockedUntil: user.account_locked_until,
        error: "Account locked due to multiple failed attempts.",
        status: 423, // 423 Locked
      };
    }
  }

  // ─────────────────────────────────────────────────────────────
  // Step C: Verify Password
  // ─────────────────────────────────────────────────────────────
  const inputHash = await hashPassword(password);

  // If user DOES NOT exist: return generic error and log FAILED_LOGIN
  if (!user) {
    await logSecurityEvent({
      userId: null,
      username: trimmedUsername,
      ipAddress: cleanIp,
      eventType: "FAILED_LOGIN",
    });
    return {
      success: false,
      error: "Invalid username or password.",
      status: 401,
    };
  }

  const isPasswordMatch = user.password_hash === inputHash;

  if (isPasswordMatch) {
    // If Password MATCHES: Reset failed_login_attempts to 0 and account_locked_until to null
    await supabase
      .from("users")
      .update({
        failed_login_attempts: 0,
        account_locked_until: null,
      })
      .eq("id", user.id);

    const session: Session = {
      userId: user.id,
      username: user.username,
      role: user.role,
      linkedEntityId: user.linked_entity_id,
      displayName: user.displayName,
    };

    return {
      success: true,
      user,
      session,
      status: 200,
    };
  }

  // If Password FAILS:
  const currentAttempts = user.failed_login_attempts || 0;
  const newAttempts = currentAttempts + 1;

  if (newAttempts >= 4) {
    // Lock account for 15 minutes
    const lockDurationMs = 15 * 60 * 1000;
    const lockedUntil = new Date(Date.now() + lockDurationMs).toISOString();

    await supabase
      .from("users")
      .update({
        failed_login_attempts: newAttempts,
        account_locked_until: lockedUntil,
      })
      .eq("id", user.id);

    // Log 'ACCOUNT_LOCKED' to Security_Logs
    await logSecurityEvent({
      userId: user.id,
      username: trimmedUsername,
      ipAddress: cleanIp,
      eventType: "ACCOUNT_LOCKED",
    });

    return {
      success: false,
      accountLocked: true,
      lockedUntil,
      error: "Account locked due to multiple failed attempts.",
      status: 423,
    };
  } else {
    // Increment failed attempts and log 'FAILED_LOGIN'
    await supabase
      .from("users")
      .update({
        failed_login_attempts: newAttempts,
      })
      .eq("id", user.id);

    await logSecurityEvent({
      userId: user.id,
      username: trimmedUsername,
      ipAddress: cleanIp,
      eventType: "FAILED_LOGIN",
    });

    return {
      success: false,
      error: "Invalid username or password.",
      status: 401,
    };
  }
}
