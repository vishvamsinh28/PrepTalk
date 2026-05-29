import { connectDB } from "@/lib/db";
import { json, serverError } from "@/lib/api";
import { getAuthPayloadFromRequest } from "@/lib/auth";
import Message from "@/models/Message";
import { findSessionForUser } from "@/lib/sessionAccess";
import { normalizeText } from "@/lib/validation";
import { getAblyRestClient } from "@/lib/ably";

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

    const messages = await Message.find({ sessionId }).sort({ createdAt: 1 });

    return json({ messages });
  } catch (error) {
    console.error("Message history error:", error);
    return serverError("Failed to fetch messages");
  }
}

export async function POST(req) {
  try {
    const user = await getAuthPayloadFromRequest(req);
    if (!user) {
      return json({ message: "Unauthorized" }, 401);
    }

    const { sessionId, message } = await req.json();
    const cleanMessage = normalizeText(message, 2000);
    if (!sessionId || !cleanMessage) {
      return json({ message: "sessionId and message are required" }, 400);
    }

    await connectDB();
    const session = await findSessionForUser(sessionId, user);
    if (!session) {
      return json({ message: "Session not found" }, 404);
    }

    const newMessage = await Message.create({
      sessionId,
      message: cleanMessage,
      sender: user.email,
    });
    const ably = getAblyRestClient();
    await ably.channels.get(`chat:${sessionId}`).publish("message", newMessage);

    return json({ message: newMessage }, 201);
  } catch (error) {
    console.error("Message save error:", error);
    return serverError("Failed to save message");
  }
}
