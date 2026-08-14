/** @file `POST /api/logout` — clears the session cookie. */

import { clearAuthCookie } from "@/lib/auth";
import { json, serverError } from "@/lib/api";

/**
 * Logs the user out by returning an already-expired cookie.
 * Deliberately requires no auth check and is idempotent — calling it while
 * signed out still succeeds, so a client with a stale session can always
 * recover to a clean state.
 * @returns {Promise<import("next/server").NextResponse>} 200 with a `Set-Cookie`
 *   that clears `prepTalkToken`; 500 only if serialization itself fails.
 */
export async function POST() {
  try {
    const serialized = clearAuthCookie();

    return json({ success: true, message: "Logged out" }, 200, {
      headers: { "Set-Cookie": serialized },
    });
  } catch (error) {
    console.error("Logout failed:", error);
    return serverError("Logout failed");
  }
}
