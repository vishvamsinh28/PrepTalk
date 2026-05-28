import { connectDB } from "@/lib/db";
import { json } from "@/lib/api";
import { getAuthPayloadFromRequest } from "@/lib/auth";
import InterviewReport from "@/models/InterviewReport";
import Session from "@/models/Session";
import { isValidObjectId } from "@/lib/sessionAccess";
import { normalizeEmail, normalizeText } from "@/lib/validation";

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
    return json({ message: "Failed to fetch reports", error: error.message }, 500);
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

    if (!isValidObjectId(sessionId)) {
      return json({ message: "Invalid sessionId" }, 400);
    }

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
        scores,
        strengths: normalizeText(strengths, 2000),
        improvements: normalizeText(improvements, 2000),
        notes: normalizeText(notes, 3000),
      },
      { new: true, upsert: true, runValidators: true }
    );

    return json({ report }, 201);
  } catch (error) {
    console.error("Report save error:", error);
    return json({ message: "Failed to save report", error: error.message }, 500);
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
    return json({ message: "Failed to delete report", error: error.message }, 500);
  }
}
