import { connectDB } from "@/lib/db";
import Session from "@/models/Session";
import { json, serverError } from "@/lib/api";
import { getAuthPayloadFromRequest } from "@/lib/auth";

/**
 * GET /api/session/list — sessions the caller owns or is invited to.
 * Auth: signed in.
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
