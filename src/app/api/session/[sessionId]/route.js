/** @file `DELETE /api/session/:id` — removes a session and everything attached to it. */

import { json, serverError } from "@/lib/api";
import { getAuthPayloadFromRequest } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import { findOwnedSession } from "@/lib/sessionAccess";
import Session from "@/models/Session";
import Message from "@/models/Message";
import InterviewReport from "@/models/InterviewReport";

/**
 * Deletes a session along with its messages and reports.
 * The three deletes run concurrently and are not transactional — if one fails
 * the others may already have landed, leaving orphans. Acceptable here because
 * orphaned messages are unreachable once the session is gone.
 * @param {import("next/server").NextRequest} req - Authenticated request.
 * @param {{ params: Promise<{ sessionId: string }> }} props - Route params; awaited per Next 15.
 * @returns {Promise<import("next/server").NextResponse>} 200 on success; 401 signed out;
 *   403 for non-interviewers; 404 when missing or not owned; 500 otherwise.
 */
export async function DELETE(req, props) {
  try {
    const { sessionId } = await props.params;
    const user = await getAuthPayloadFromRequest(req);
    if (!user) return json({ message: "Unauthorized" }, 401);
    if (user.role !== "Interviewer") return json({ message: "Only interviewers can delete sessions" }, 403);

    await connectDB();
    const session = await findOwnedSession(sessionId, user);
    if (!session) return json({ message: "Session not found" }, 404);

    await Promise.all([
      Message.deleteMany({ sessionId }),
      InterviewReport.deleteMany({ sessionId }),
      Session.deleteOne({ _id: sessionId }),
    ]);

    return json({ message: "Session deleted" });
  } catch (error) {
    console.error("Session delete error:", error);
    return serverError("Failed to delete session");
  }
}
