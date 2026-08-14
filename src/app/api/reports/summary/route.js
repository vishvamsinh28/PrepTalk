/** @file `POST /api/reports/summary` — turns a saved scorecard into AI feedback prose. Report author only. */

import { json, serverError } from "@/lib/api";
import { getAuthPayloadFromRequest } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import { generateGeminiJson } from "@/lib/gemini";
import InterviewReport from "@/models/InterviewReport";
import Session from "@/models/Session";
import { isValidObjectId } from "@/lib/sessionAccess";

/**
 * Builds the prompt asking Gemini to turn a scorecard into candidate-facing prose.
 * Every value comes from stored records, never from the request body, so a
 * caller cannot steer the wording of feedback about someone else.
 * @param {{ session: object, report: object }} input - Session context and the saved scorecard.
 * @returns {string} Prompt text requesting `{ aiSummary, actionItems }`.
 */
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

/**
 * Generates an AI summary and action items for a saved report, then stores them.
 * Overwrites any previous summary, so re-running produces fresh wording — that
 * is the intended "regenerate" behaviour. Only the interviewer who wrote the
 * report may call it, even though the interviewee can read the result.
 * @param {import("next/server").NextRequest} req - Body must carry `{ reportId }`.
 * @returns {Promise<import("next/server").NextResponse>} 200 with the updated report;
 *   400 for a missing or malformed id; 401 signed out; 403 for non-authors;
 *   404 when the report or its session is gone; 500 when Gemini fails.
 */
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
