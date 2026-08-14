/**
 * @file `/api/messages` — session chat persistence and fan-out.
 * Clients subscribe to the Ably `chat:` channel but publish through here, so
 * every message is stored and access-checked before it reaches anyone.
 */

import { connectDB } from "@/lib/db";
import { json, serverError } from "@/lib/api";
import { getAuthPayloadFromRequest } from "@/lib/auth";
import Message from "@/models/Message";
import { findSessionForUser } from "@/lib/sessionAccess";
import { normalizeText } from "@/lib/validation";
import { getAblyRestClient } from "@/lib/ably";

/**
 * Returns the session's full chat history, oldest first.
 * Unpaginated — fine for interview-length conversations, but it will need a
 * cursor if sessions ever run long enough to accumulate thousands of messages.
 * @param {import("next/server").NextRequest} req - Query must carry `sessionId`.
 * @returns {Promise<import("next/server").NextResponse>} 200 with `{ messages }`;
 *   400 without a sessionId; 401 signed out; 404 when not a participant; 500 otherwise.
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

    const messages = await Message.find({ sessionId }).sort({ createdAt: 1 });

    return json({ messages });
  } catch (error) {
    console.error("Message history error:", error);
    return serverError("Failed to fetch messages");
  }
}

/**
 * Persists a chat message, then publishes it to the session's Ably channel.
 * Order matters: the write happens first, so a subscriber can never see a
 * message that failed to save. The tradeoff is the reverse case — if the Ably
 * publish throws, the message is stored but not broadcast, and the sender sees
 * a 500 even though their message will appear on the next history fetch.
 * @param {import("next/server").NextRequest} req - Body carries `{ sessionId, message }`.
 * @returns {Promise<import("next/server").NextResponse>} 201 with the saved
 *   `{ message }`; 400 when either field is missing or the text normalizes to
 *   empty; 401 signed out; 404 when not a participant; 500 otherwise.
 */
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
