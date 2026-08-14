/** @file `GET /api/user` — who am I. Used by client components to render role-specific UI. */

import { getAuthPayloadFromRequest } from "@/lib/auth";
import { json } from "@/lib/api";

/**
 * Returns the signed-in user's email and role.
 * Only those two fields are echoed — the token id stays server-side since no
 * client screen needs it. Every failure answers 401, never 500, because "who am
 * I" has no meaningful server-error case from the caller's point of view.
 * @param {import("next/server").NextRequest} req - Request carrying the auth cookie.
 * @returns {Promise<import("next/server").NextResponse>} 200 with `{ email, role }`,
 *   or 401 when there is no valid session.
 */
export async function GET(req) {
  try {
    const payload = await getAuthPayloadFromRequest(req);

    if (!payload) {
      return json({ message: "No token found" }, 401);
    }

    return json({ email: payload.email, role: payload.role });
  } catch {
    // getAuthPayloadFromRequest already swallows verification errors, so this
    // only fires if the cookie jar itself is unreadable — still a 401 to the caller.
    return json({ message: "Invalid token" }, 401);
  }
}
