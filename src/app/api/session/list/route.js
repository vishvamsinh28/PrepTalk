/** @file `GET /api/session/list` — the caller's sessions, filtered by role. */

import { connectDB } from "@/lib/db";
import Session from "@/models/Session";
import { json, serverError } from "@/lib/api";
import { getAuthPayloadFromRequest } from "@/lib/auth";

/**
 * Lists sessions the caller owns (interviewer) or is invited to (interviewee).
 * The role picks the query field, so neither role can see the other's sessions
 * — there is no "all sessions" branch by design.
 * @param {import("next/server").NextRequest} req - Authenticated request.
 * @returns {Promise<import("next/server").NextResponse>} 200 with `{ sessions }`
 *   newest-first; 401 when signed out; 500 on query failure.
 */
export async function GET(req) {
  try {
    const user = await getAuthPayloadFromRequest(req);
    if (!user) {
      return json({ message: "Unauthorized" }, 401);
    }

    await connectDB();

    const query = user.role === "Interviewer"
      ? { createdBy: user.email }
      : { interviewees: user.email };
    const sessions = await Session.find(query).sort({ createdAt: -1 });

    return json({ sessions });
  } catch (error) {
    console.error(error);
    return serverError("Failed to fetch sessions");
  }
}
