import { connectDB } from "@/lib/db";
import Session from "@/models/Session";
import { getAuthPayloadFromRequest } from "@/lib/auth";
import { json } from "@/lib/api";

export async function POST(req) {
  try {
    const { title, description, topic, participants, evaluators } = await req.json();

    const payload = await getAuthPayloadFromRequest(req);
    if (!payload) {
      return json({ message: "Unauthorized" }, 401);
    }

    if (payload.role !== "Moderator") {
      return json({ message: "Only moderators can create sessions" }, 403);
    }

    await connectDB();

    const newSession = new Session({
      title,
      description,
      topic,
      createdBy: payload.email,
      participants,
      evaluators,
    });

    await newSession.save();

    return json({ message: "Session created successfully" }, 201);
  } catch (error) {
    console.error(error);
    return json({ message: "Session creation failed", error: error.message }, 500);
  }
}
