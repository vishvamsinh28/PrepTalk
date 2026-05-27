import { connectDB } from "@/lib/db";
import Session from "@/models/Session";
import { getAuthPayloadFromRequest } from "@/lib/auth";
import { json } from "@/lib/api";
import crypto from "crypto";

function parseAgenda(agenda) {
  if (Array.isArray(agenda)) {
    return agenda
      .map((item) => ({
        title: String(item.title || "").trim(),
        minutes: Number(item.minutes) || 10,
      }))
      .filter((item) => item.title);
  }

  return String(agenda || "")
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const match = line.match(/^(.+?)(?:\s*[-–]\s*(\d+)\s*min(?:utes?)?)?$/i);
      return {
        title: match?.[1]?.trim() || line,
        minutes: Number(match?.[2]) || 10,
      };
    });
}

export async function POST(req) {
  try {
    const {
      title,
      description,
      role,
      level,
      interviewType,
      skills,
      interviewees,
      scheduledAt,
      durationMinutes,
      agenda,
      publicInviteEnabled,
    } = await req.json();

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
      scheduledAt: scheduledAt ? new Date(scheduledAt) : undefined,
      durationMinutes: Number(durationMinutes) || 60,
      agenda: parseAgenda(agenda),
      inviteCode: publicInviteEnabled ? crypto.randomBytes(8).toString("hex") : undefined,
    });

    await newSession.save();

    return json({ message: "Session created successfully" }, 201);
  } catch (error) {
    console.error(error);
    return json({ message: "Session creation failed", error: error.message }, 500);
  }
}
