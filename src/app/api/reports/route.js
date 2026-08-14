/** @file `/api/reports` — interview scorecards: list, upsert, delete. */

import { connectDB } from "@/lib/db";
import { json, serverError } from "@/lib/api";
import { getAuthPayloadFromRequest } from "@/lib/auth";
import InterviewReport from "@/models/InterviewReport";
import Session from "@/models/Session";
import { isValidObjectId } from "@/lib/sessionAccess";
import { isValidEmail, normalizeEmail, normalizeText } from "@/lib/validation";

/** Accepted recommendation values; anything else is a 400. */
const RECOMMENDATIONS = new Set(["Strong hire", "Hire", "Needs more practice", "No hire"]);

/** The five scorecard dimensions. Must match `scoreKeys` in the progress route. */
const SCORE_KEYS = ["communication", "technicalDepth", "problemSolving", "confidence", "roleFit"];

/**
 * Validates all five scores as integers in 1-5, or rejects the whole set.
 * All-or-nothing on purpose: a partial scorecard would skew the progress
 * averages, so one bad dimension fails the submission rather than defaulting.
 * @param {unknown} value - Raw `scores` object from the request body.
 * @returns {{[key: string]: number}|null} Rounded scores, or null if any is missing or out of range.
 */
function normalizeScores(value) {
  const normalized = {};
  for (const key of SCORE_KEYS) {
    const score = Number(value?.[key]);
    if (!Number.isFinite(score) || score < 1 || score > 5) return null;
    normalized[key] = Math.round(score);
  }
  return normalized;
}

/**
 * Lists reports the caller wrote (interviewer) or received (interviewee).
 * `canDeleteReports` is returned so the client doesn't have to re-derive the
 * role rule to decide whether to render a delete control.
 * @param {import("next/server").NextRequest} req - Authenticated request.
 * @returns {Promise<import("next/server").NextResponse>} 200 with
 *   `{ reports, canDeleteReports }` newest-first; 401 signed out; 500 otherwise.
 */
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

/**
 * Saves an interview scorecard, upserting on (session, interviewee).
 * The upsert makes submitting twice an edit rather than a duplicate, so an
 * interviewer can revise their scores without a separate update endpoint.
 * Two ownership checks apply: the caller must own the session, and the subject
 * must actually be assigned to it.
 * @param {import("next/server").NextRequest} req - Body carries the scorecard payload.
 * @returns {Promise<import("next/server").NextResponse>} 201 with the saved
 *   `{ report }`; 400 on invalid id, email, recommendation, or scores; 401
 *   signed out; 403 for non-interviewers or non-owners; 404 when the session is
 *   gone; 500 otherwise.
 */
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

/**
 * Deletes a report by id.
 * Restricted to the interviewer who wrote it — owning the session is not
 * enough, so a report can't be removed by someone who merely ran the interview
 * under a different account.
 * @param {import("next/server").NextRequest} req - Body carries `{ reportId }`.
 * @returns {Promise<import("next/server").NextResponse>} 200 on success; 400 on
 *   a malformed id; 401 signed out; 403 for non-authors; 404 when missing; 500 otherwise.
 */
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
