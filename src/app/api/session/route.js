import { connectDB } from "@/lib/db";
import Session from "@/models/Session";
import { getAuthPayloadFromRequest } from "@/lib/auth";
import { json } from "@/lib/api";
import { normalizeEmailList, normalizeStringList, normalizeText } from "@/lib/validation";
import { findMissingIntervieweeEmails } from "@/lib/candidateUsers";

function parseAgenda(agenda) {
  if (Array.isArray(agenda)) {
    return agenda
      .map((item) => ({
        title: normalizeText(item.title, 120),
        minutes: Math.min(Math.max(Number(item.minutes) || 10, 1), 240),
      }))
      .filter((item) => item.title)
      .slice(0, 20);
  }

  return String(agenda || "")
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const match = line.match(/^(.+?)(?:\s*[-–]\s*(\d+)\s*min(?:utes?)?)?$/i);
      return {
        title: normalizeText(match?.[1] || line, 120),
        minutes: Math.min(Math.max(Number(match?.[2]) || 10, 1), 240),
      };
    })
    .slice(0, 20);
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
    } = await req.json();

    const payload = await getAuthPayloadFromRequest(req);
    if (!payload) {
      return json({ message: "Unauthorized" }, 401);
    }

    if (payload.role !== "Interviewer") {
      return json({ message: "Only interviewers can create sessions" }, 403);
    }

    const cleanTitle = normalizeText(title, 120);
    const cleanRole = normalizeText(role, 120);
    if (!cleanTitle || !cleanRole) {
      return json({ message: "Session title and target role are required" }, 400);
    }

    await connectDB();
    const cleanInterviewees = normalizeEmailList(interviewees, 25);
    const missingInterviewees = await findMissingIntervieweeEmails(cleanInterviewees);

    if (missingInterviewees.length > 0) {
      return json({
        message: `These candidates must register as Interviewees first: ${missingInterviewees.join(", ")}`,
      }, 400);
    }

    const newSession = new Session({
      title: cleanTitle,
      description: normalizeText(description, 1200),
      role: cleanRole,
      level,
      interviewType,
      skills: normalizeStringList(skills, 20, 80),
      createdBy: payload.email,
      interviewees: cleanInterviewees,
      scheduledAt: scheduledAt ? new Date(scheduledAt) : undefined,
      durationMinutes: Number(durationMinutes) || 60,
      agenda: parseAgenda(agenda),
    });

    await newSession.save();

    return json({ message: "Session created successfully", session: newSession }, 201);
  } catch (error) {
    console.error(error);
    return json({ message: "Session creation failed", error: error.message }, 500);
  }
}
