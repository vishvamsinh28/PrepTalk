import { json, serverError } from "@/lib/api";
import { getAuthPayloadFromRequest } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import { generateGeminiJson } from "@/lib/gemini";
import InterviewReport from "@/models/InterviewReport";
import Session from "@/models/Session";
import { isValidObjectId } from "@/lib/sessionAccess";

function summaryPrompt({ session, report }) {
  return `
Return only valid JSON:
{
  "aiSummary": "A polished candidate-facing post-interview feedback summary in 2 short paragraphs",
  "actionItems": ["specific action item 1", "specific action item 2", "specific action item 3"]
}

Session role: ${session.role}
Level: ${session.level}
Type: ${session.interviewType}
Skills: ${(session.skills || []).join(", ")}
Recommendation: ${report.recommendation}
Scores: ${JSON.stringify(report.scores)}
Strengths: ${report.strengths}
Improvements: ${report.improvements}
Notes: ${report.notes || "None"}
`;
}

export async function POST(req) {
  try {
    const user = await getAuthPayloadFromRequest(req);
    if (!user) return json({ message: "Unauthorized" }, 401);
    if (user.role !== "Interviewer") return json({ message: "Only interviewers can generate summaries" }, 403);

    const { reportId } = await req.json();
    if (!reportId) return json({ message: "reportId is required" }, 400);
    if (!isValidObjectId(reportId)) return json({ message: "Invalid reportId" }, 400);

    await connectDB();
    const report = await InterviewReport.findById(reportId);
    if (!report) return json({ message: "Report not found" }, 404);
    if (report.interviewerEmail !== user.email) return json({ message: "Forbidden" }, 403);

    const session = await Session.findById(report.sessionId);
    if (!session) return json({ message: "Session not found" }, 404);

    const result = await generateGeminiJson(summaryPrompt({ session, report }));
    report.aiSummary = result.aiSummary || "";
    report.actionItems = Array.isArray(result.actionItems) ? result.actionItems.slice(0, 5) : [];
    await report.save();

    return json({ report });
  } catch (error) {
    console.error("Report summary error:", error);
    return serverError("Failed to generate report summary");
  }
}
