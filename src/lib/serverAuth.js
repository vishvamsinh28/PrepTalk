/**
 * @file Session lookup for server components, which have no request object and
 * must read Next's async `cookies()` store. Route handlers use
 * `getAuthPayloadFromRequest` in `@/lib/auth` instead.
 */

import { cookies } from "next/headers";
import { verifyAuthToken } from "@/lib/token";

/** Must stay in sync with `AUTH_COOKIE_NAME` in `@/lib/auth`. */
const AUTH_COOKIE_NAME = "prepTalkToken";

/**
 * Returns the signed-in user's claims inside a server component.
 * Reading cookies opts the route into dynamic rendering, so don't call this
 * from a page meant to be statically generated.
 *
 * @returns {Promise<import("@/lib/token").AuthTokenPayload|null>} Claims, or
 *   `null` when there's no valid session cookie.
 */
export async function getCurrentUser() {
  const cookieStore = await cookies();
  const token = cookieStore.get(AUTH_COOKIE_NAME)?.value;

  try {
    return await verifyAuthToken(token);
  } catch {
    // A malformed or expired cookie is treated exactly like no cookie.
    return null;
  }
}
