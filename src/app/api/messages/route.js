import { connectDB } from "@/lib/db";
import { json } from "@/lib/api";
import { getAuthPayloadFromRequest } from "@/lib/auth";
import Message from "@/models/Message";
import { findSessionForUser } from "@/lib/sessionAccess";
import { normalizeText } from "@/lib/validation";

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
    const session = await findSessionForUser(sessionId, user, searchParams.get("invite"));
    if (!session) {
      return json({ message: "Session not found" }, 404);
    }

    const messages = await Message.find({ sessionId }).sort({ createdAt: 1 });

    return json({ messages });
  } catch (error) {
    console.error("Message history error:", error);
    return json({ message: "Failed to fetch messages", error: error.message }, 500);
  }
}

export async function POST(req) {
  try {
    const user = await getAuthPayloadFromRequest(req);
    if (!user) {
      return json({ message: "Unauthorized" }, 401);
    }

    const { sessionId, message, inviteCode } = await req.json();
    const cleanMessage = normalizeText(message, 2000);
    if (!sessionId || !cleanMessage) {
      return json({ message: "sessionId and message are required" }, 400);
    }

    await connectDB();
    const session = await findSessionForUser(sessionId, user, inviteCode);
    if (!session) {
      return json({ message: "Session not found" }, 404);
    }

    const newMessage = await Message.create({
      sessionId,
      message: cleanMessage,
      sender: user.email,
    });

    return json({ message: newMessage }, 201);
  } catch (error) {
    console.error("Message save error:", error);
    return json({ message: "Failed to save message", error: error.message }, 500);
  }
}
