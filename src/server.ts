import "./lib/error-capture";

import { consumeLastCapturedError } from "./lib/error-capture";
import { renderErrorPage } from "./lib/error-page";

type ServerEntry = {
  fetch: (request: Request, env: unknown, ctx: unknown) => Promise<Response> | Response;
};

let serverEntryPromise: Promise<ServerEntry> | undefined;

async function getServerEntry(): Promise<ServerEntry> {
  if (!serverEntryPromise) {
    serverEntryPromise = import("@tanstack/react-start/server-entry").then(
      (m) => (m.default ?? m) as ServerEntry,
    );
  }
  return serverEntryPromise;
}

// h3 swallows in-handler throws into a normal 500 Response with body
// {"unhandled":true,"message":"HTTPError"} — try/catch alone never fires for those.
async function normalizeCatastrophicSsrResponse(response: Response): Promise<Response> {
  if (response.status < 500) return response;
  const contentType = response.headers.get("content-type") ?? "";
  if (!contentType.includes("application/json")) return response;

  const body = await response.clone().text();
  if (!isH3SwallowedErrorBody(body)) return response;

  console.error(consumeLastCapturedError() ?? new Error(`h3 swallowed SSR error: ${body}`));
  return new Response(renderErrorPage(), {
    status: 500,
    headers: { "content-type": "text/html; charset=utf-8" },
  });
}

function isH3SwallowedErrorBody(body: string): boolean {
  try {
    const payload = JSON.parse(body) as { unhandled?: unknown; message?: unknown };
    return payload.unhandled === true && payload.message === "HTTPError";
  } catch {
    return false;
  }
}

import { handleSecureLogin } from "./lib/server-security";
import { supabase } from "./lib/supabase";

export default {
  async fetch(request: Request, env: unknown, ctx: unknown) {
    const url = new URL(request.url);

    // ─────────────────────────────────────────────────────────────
    // POST /api/login — Rate-limited authentication & reCAPTCHA API
    // ─────────────────────────────────────────────────────────────
    if (url.pathname === "/api/login" && request.method === "POST") {
      try {
        const body = (await request.json()) as {
          username?: string;
          password?: string;
          captchaToken?: string;
        };

        const clientIp =
          request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
          request.headers.get("cf-connecting-ip") ||
          request.headers.get("x-real-ip") ||
          "127.0.0.1";

        const result = await handleSecureLogin({
          username: body.username || "",
          password: body.password || "",
          captchaToken: body.captchaToken || "",
          clientIp,
        });

        return new Response(JSON.stringify(result), {
          status: result.status,
          headers: { "Content-Type": "application/json" },
        });
      } catch (err) {
        console.error("Error in /api/login endpoint:", err);
        return new Response(
          JSON.stringify({
            success: false,
            error: "An unexpected server error occurred.",
          }),
          {
            status: 500,
            headers: { "Content-Type": "application/json" },
          },
        );
      }
    }

    // ─────────────────────────────────────────────────────────────
    // POST /api/security/unlock — Admin Unlock Account API
    // ─────────────────────────────────────────────────────────────
    if (url.pathname === "/api/security/unlock" && request.method === "POST") {
      try {
        const { userId } = (await request.json()) as { userId: number };
        if (!userId) {
          return new Response(
            JSON.stringify({ success: false, error: "Missing userId." }),
            { status: 400, headers: { "Content-Type": "application/json" } },
          );
        }

        await supabase
          .from("users")
          .update({
            failed_login_attempts: 0,
            account_locked_until: null,
          })
          .eq("id", userId);

        return new Response(JSON.stringify({ success: true }), {
          status: 200,
          headers: { "Content-Type": "application/json" },
        });
      } catch (err) {
        console.error("Error in /api/security/unlock:", err);
        return new Response(
          JSON.stringify({ success: false, error: "Failed to unlock account." }),
          { status: 500, headers: { "Content-Type": "application/json" } },
        );
      }
    }

    try {
      const handler = await getServerEntry();
      const response = await handler.fetch(request, env, ctx);
      return await normalizeCatastrophicSsrResponse(response);
    } catch (error) {
      console.error(error);
      return new Response(renderErrorPage(), {
        status: 500,
        headers: { "content-type": "text/html; charset=utf-8" },
      });
    }
  },
};
