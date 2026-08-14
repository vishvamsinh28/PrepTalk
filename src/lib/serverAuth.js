/** @file Session lookup for server components, which have no request object. Route handlers use `getAuthPayloadFromRequest` instead. */

import { cookies } from "next/headers";
import { verifyAuthToken } from "@/lib/token";

/** Must stay in sync with `AUTH_COOKIE_NAME` in `@/lib/auth`. */
const AUTH_COOKIE_NAME = "prepTalkToken";

/**
 * Returns the signed-in user's claims inside a server component.
 * Reading cookies opts the route into dynamic rendering, so don't call this
 * from a page meant to be statically generated.
 * @returns {Promise<{id: string, email: string, role: string}|null>} Claims, or null when not signed in.
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
