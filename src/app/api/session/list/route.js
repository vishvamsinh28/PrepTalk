import { connectDB } from "@/lib/db";
import Session from "@/models/Session";
import { json } from "@/lib/api";
import { getAuthPayloadFromRequest } from "@/lib/auth";

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
    return json({ message: "Failed to fetch sessions", error: error.message }, 500);
  }
}
