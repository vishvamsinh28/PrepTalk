import { connectDB } from "@/lib/db";
import Session from "@/models/Session";
import { getAuthPayloadFromRequest } from "@/lib/auth";
import { json, serverError } from "@/lib/api";
import { normalizeEmailList, normalizeStringList, normalizeText } from "@/lib/validation";
import { findMissingIntervieweeEmails } from "@/lib/candidateUsers";

const LEVELS = new Set(["Entry", "Mid", "Senior"]);
const INTERVIEW_TYPES = new Set(["Technical", "Behavioral", "Mixed"]);

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

/**
 * POST /api/session — creates an interview session (agenda, schedule,
 * invitees). Auth: interviewer.
 */
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
    if (level && !LEVELS.has(level)) return json({ message: "Invalid level" }, 400);
    if (interviewType && !INTERVIEW_TYPES.has(interviewType)) return json({ message: "Invalid interview type" }, 400);

    const cleanDuration = Number.parseInt(durationMinutes, 10);
    if (durationMinutes && (!Number.isFinite(cleanDuration) || cleanDuration < 15 || cleanDuration > 480)) {
      return json({ message: "Duration must be between 15 and 480 minutes" }, 400);
    }

    const cleanScheduledAt = scheduledAt ? new Date(scheduledAt) : undefined;
    if (scheduledAt && Number.isNaN(cleanScheduledAt.getTime())) {
      return json({ message: "Invalid scheduled date" }, 400);
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
      level: level || "Entry",
      interviewType: interviewType || "Technical",
      skills: normalizeStringList(skills, 20, 80),
      createdBy: payload.email,
      interviewees: cleanInterviewees,
      scheduledAt: cleanScheduledAt,
      durationMinutes: cleanDuration || 60,
      agenda: parseAgenda(agenda),
    });

    await newSession.save();

    return json({ message: "Session created successfully", session: newSession }, 201);
  } catch (error) {
    console.error(error);
    return serverError("Session creation failed");
  }
}
