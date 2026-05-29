import { connectDB } from "@/lib/db";
import { json, serverError } from "@/lib/api";
import { getAuthPayloadFromRequest } from "@/lib/auth";
import InterviewReport from "@/models/InterviewReport";
import Session from "@/models/Session";
import { isValidObjectId } from "@/lib/sessionAccess";
import { isValidEmail, normalizeEmail, normalizeText } from "@/lib/validation";

const RECOMMENDATIONS = new Set(["Strong hire", "Hire", "Needs more practice", "No hire"]);
const SCORE_KEYS = ["communication", "technicalDepth", "problemSolving", "confidence", "roleFit"];

function normalizeScores(value) {
  const normalized = {};
  for (const key of SCORE_KEYS) {
    const score = Number(value?.[key]);
    if (!Number.isFinite(score) || score < 1 || score > 5) return null;
    normalized[key] = Math.round(score);
  }
  return normalized;
}

export async function GET(req) {
  try {
    const user = await getAuthPayloadFromRequest(req);
    if (!user) return json({ message: "Unauthorized" }, 401);

    await connectDB();

    const query = user.role === "Interviewer"
      ? { interviewerEmail: user.email }
      : { intervieweeEmail: user.email };
    const reports = await InterviewReport.find(query).sort({ createdAt: -1 });

    return json({ reports, canDeleteReports: user.role === "Interviewer" });
  } catch (error) {
    console.error("Report fetch error:", error);
    return serverError("Failed to fetch reports");
  }
}

export async function POST(req) {
  try {
    const user = await getAuthPayloadFromRequest(req);
    if (!user) return json({ message: "Unauthorized" }, 401);
    if (user.role !== "Interviewer") {
      return json({ message: "Only interviewers can submit reports" }, 403);
    }

    const body = await req.json();
    const { sessionId, intervieweeEmail, recommendation, scores, strengths, improvements, notes } = body;
    const cleanIntervieweeEmail = normalizeEmail(intervieweeEmail);
    const cleanScores = normalizeScores(scores);

    if (!isValidObjectId(sessionId)) {
      return json({ message: "Invalid sessionId" }, 400);
    }
    if (!isValidEmail(cleanIntervieweeEmail)) return json({ message: "Valid interviewee email is required" }, 400);
    if (!RECOMMENDATIONS.has(recommendation)) return json({ message: "Invalid recommendation" }, 400);
    if (!cleanScores) return json({ message: "Scores must be between 1 and 5" }, 400);

    await connectDB();
    const session = await Session.findById(sessionId);
    if (!session) return json({ message: "Session not found" }, 404);
    if (session.createdBy !== user.email) {
      return json({ message: "Only the session interviewer can submit this report" }, 403);
    }

    if (!session.interviewees.includes(cleanIntervieweeEmail)) {
      return json({ message: "Interviewee is not assigned to this session" }, 400);
    }

    const report = await InterviewReport.findOneAndUpdate(
      { sessionId, intervieweeEmail: cleanIntervieweeEmail },
      {
        sessionId,
        intervieweeEmail: cleanIntervieweeEmail,
        interviewerEmail: user.email,
        recommendation,
        scores: cleanScores,
        strengths: normalizeText(strengths, 2000),
        improvements: normalizeText(improvements, 2000),
        notes: normalizeText(notes, 3000),
      },
      { new: true, upsert: true, runValidators: true }
    );

    return json({ report }, 201);
  } catch (error) {
    console.error("Report save error:", error);
    return serverError("Failed to save report");
  }
}

export async function DELETE(req) {
  try {
    const user = await getAuthPayloadFromRequest(req);
    if (!user) return json({ message: "Unauthorized" }, 401);
    if (user.role !== "Interviewer") {
      return json({ message: "Only interviewers can delete reports" }, 403);
    }

    const { reportId } = await req.json();
    if (!isValidObjectId(reportId)) {
      return json({ message: "Invalid reportId" }, 400);
    }

    await connectDB();
    const report = await InterviewReport.findById(reportId);
    if (!report) return json({ message: "Report not found" }, 404);
    if (report.interviewerEmail !== user.email) {
      return json({ message: "Forbidden" }, 403);
    }

    await InterviewReport.deleteOne({ _id: reportId });

    return json({ message: "Report deleted" });
  } catch (error) {
    console.error("Report delete error:", error);
    return serverError("Failed to delete report");
  }
}
