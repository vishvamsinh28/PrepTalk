import { json, serverError } from "@/lib/api";
import { getAuthPayloadFromRequest } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import { findOwnedSession } from "@/lib/sessionAccess";
import Session from "@/models/Session";
import Message from "@/models/Message";
import InterviewReport from "@/models/InterviewReport";

/**
 * DELETE /api/session/:id — deletes a session with its messages and
 * reports. Auth: session owner.
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
