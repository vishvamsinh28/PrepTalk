/** @file `GET /api/ably/token` — mints a per-session Ably token so the master key never reaches the browser. */

import { getAblyRestClient } from "@/lib/ably";
import { getAuthPayloadFromRequest } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import { json, serverError } from "@/lib/api";
import { findSessionForUser } from "@/lib/sessionAccess";

/**
 * Issues an Ably token scoped to one session's three channels.
 * Capabilities are deliberately asymmetric: `chat` gets subscribe and presence
 * but **not** publish, because messages are posted through `/api/messages` so
 * they can be persisted and validated server-side. `video` and `workspace` allow
 * publish since those are ephemeral peer-to-peer streams.
 * The token is bound to the caller's session membership, so it cannot be reused
 * against another session's channels.
 * @param {import("next/server").NextRequest} req - Query must carry `sessionId`.
 * @returns {Promise<import("next/server").NextResponse>} 200 with an Ably token
 *   request; 400 without a sessionId; 401 signed out; 404 when not a
 *   participant; 500 when Ably is unconfigured or unreachable.
 */
export async function GET(req) {
  try {
    const user = await getAuthPayloadFromRequest(req);
    if (!user) {
      return json({ message: "Unauthorized" }, 401);
    }

    const { searchParams } = new URL(req.url);
    const sessionId = searchParams.get("sessionId");
    if (!sessionId) {
      return json({ message: "sessionId is required" }, 400);
    }

    await connectDB();
    const session = await findSessionForUser(sessionId, user);
    if (!session) {
      return json({ message: "Session not found" }, 404);
    }

    const ably = getAblyRestClient();
    const tokenRequest = await ably.auth.createTokenRequest({
      clientId: user.email,
      capability: JSON.stringify({
        [`chat:${sessionId}`]: ["subscribe", "presence"],
        [`video:${sessionId}`]: ["publish", "subscribe", "presence"],
        [`workspace:${sessionId}`]: ["publish", "subscribe"],
      }),
    });

    return json(tokenRequest);
  } catch (error) {
    console.error("Ably token error:", error);
    return serverError("Unable to create Ably token");
  }
}
