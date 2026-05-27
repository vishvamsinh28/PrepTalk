import { connectDB } from "@/lib/db";
import Session from "@/models/Session";
import { getAuthPayloadFromRequest } from "@/lib/auth";
import { json } from "@/lib/api";

export async function POST(req) {
  try {
    const { title, description, role, level, interviewType, skills, interviewees } = await req.json();

    const payload = await getAuthPayloadFromRequest(req);
    if (!payload) {
      return json({ message: "Unauthorized" }, 401);
    }

    if (payload.role !== "Interviewer") {
      return json({ message: "Only interviewers can create sessions" }, 403);
    }

    if (!title || !role) {
      return json({ message: "Session title and target role are required" }, 400);
    }

    await connectDB();

    const newSession = new Session({
      title,
      description,
      role,
      level,
      interviewType,
      skills,
      createdBy: payload.email,
      interviewees,
    });

    await newSession.save();

    return json({ message: "Session created successfully" }, 201);
  } catch (error) {
    console.error(error);
    return json({ message: "Session creation failed", error: error.message }, 500);
  }
}
