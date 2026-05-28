import { getAblyRestClient } from "@/lib/ably";
import { getAuthPayloadFromRequest } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import { json } from "@/lib/api";
import { findSessionForUser } from "@/lib/sessionAccess";

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
        [`chat:${sessionId}`]: ["publish", "subscribe", "presence"],
        [`video:${sessionId}`]: ["publish", "subscribe", "presence"],
        [`workspace:${sessionId}`]: ["publish", "subscribe"],
      }),
    });

    return json(tokenRequest);
  } catch (error) {
    console.error("Ably token error:", error);
    return json({ message: "Unable to create Ably token", error: error.message }, 500);
  }
}
