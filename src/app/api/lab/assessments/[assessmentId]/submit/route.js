/** @file `POST /api/lab/assessments/:id/submit` — the authoritative grading path. Assigned candidate only. */

import { json } from "@/lib/api";
import { getAuthPayloadFromRequest } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import { gradeLabAssessment } from "@/lib/labServerRunner";
import { assessmentIsExpired, userCanAccessAssessment } from "@/lib/labAccess";
import { isValidObjectId } from "@/lib/sessionAccess";
import LabAssessment from "@/models/LabAssessment";
import { getClientIp, rateLimit, rateLimitResponse } from "@/lib/rateLimit";

/**
 * Grades a candidate's solutions server-side and records the submission.
 * The attempt cap is enforced twice on purpose: the early `previous.length`
 * check gives a fast, clear rejection, while the `$expr` filter on the update
 * is what actually holds under concurrent submissions — two requests in flight
 * would both pass the first check, and only one can win the second.
 * Grading runs before the write, so a sandbox failure can't record a bogus score.
 * @param {import("next/server").NextRequest} req - Body carries `{ solutions }`.
 * @param {{ params: Promise<{ assessmentId: string }> }} props - Route params; awaited per Next 15.
 * @returns {Promise<import("next/server").NextResponse>} 200 with a summary
 *   `{ submission }` (no hidden-test detail); 400 on a malformed id; 401 signed
 *   out; 403 for non-interviewees or non-assigned callers; 404 when missing;
 *   410 past the deadline; 429 at 12 submits/hour or the 20-attempt cap; 500 otherwise.
 */
export async function POST(req, props) {
  try {
    const user = await getAuthPayloadFromRequest(req);
    if (!user) return json({ message: "Unauthorized" }, 401);
    if (user.role !== "Interviewee") return json({ message: "Only interviewees can submit Lab assessments" }, 403);
    const userEmail = String(user.email || "").toLowerCase();
    const limiter = rateLimit({
      key: `lab-submit:${userEmail}:${getClientIp(req)}`,
      limit: 12,
      windowMs: 60 * 60 * 1000,
    });
    if (limiter.limited) return rateLimitResponse();

    const { assessmentId } = await props.params;
    if (!isValidObjectId(assessmentId)) return json({ message: "Invalid assessmentId" }, 400);

    const body = await req.json();
    await connectDB();

    const assessment = await LabAssessment.findById(assessmentId);
    if (!assessment) return json({ message: "Assigned assessment not found" }, 404);
    if (!userCanAccessAssessment(assessment, user)) return json({ message: "Forbidden" }, 403);
    if (assessmentIsExpired(assessment)) return json({ message: "This assessment deadline has passed." }, 410);

    const previous = assessment.submissions.filter(
      (submission) => String(submission.candidateEmail || "").toLowerCase() === userEmail
    );
    if (previous.length >= 20) return json({ message: "Submission limit reached for this assessment" }, 429);

    const solutions = normalizeSolutions(body.solutions);
    const grade = await gradeLabAssessment(assessment, solutions);
    const submission = {
      candidateEmail: userEmail,
      score: grade.score,
      maxScore: grade.maxScore,
      passedTests: grade.passedTests,
      totalTests: grade.totalTests,
      runtimeMs: Math.min(grade.runtimeMs, assessment.durationMinutes * 60 * 1000),
      attempts: previous.length + 1,
      status: "Submitted",
      submittedAt: new Date(),
      solutions,
      problemResults: grade.problemResults,
    };

    const updated = await LabAssessment.findOneAndUpdate(
      {
        _id: assessmentId,
        $expr: {
          $lt: [
            {
              $size: {
                $filter: {
                  input: "$submissions",
                  as: "submission",
                  cond: { $eq: [{ $toLower: "$$submission.candidateEmail" }, userEmail] },
                },
              },
            },
            20,
          ],
        },
      },
      { $push: { submissions: submission } },
      { new: true }
    );

    if (!updated) return json({ message: "Submission limit reached for this assessment" }, 429);

    return json({
      message: "Lab assessment submitted",
      submission: {
        attempts: submission.attempts,
        maxScore: submission.maxScore,
        passedTests: submission.passedTests,
        score: submission.score,
        status: submission.status,
        submittedAt: submission.submittedAt,
        totalTests: submission.totalTests,
      },
    });
  } catch (error) {
    console.error("Lab submit error:", error);
    return json({ message: "Failed to submit Lab assessment" }, 500);
  }
}

/**
 * Bounds an untrusted solutions array before it reaches the grading sandbox.
 * A non-integer `problemIndex` becomes -1, which matches no problem, so the
 * entry is effectively discarded rather than grading against the wrong question.
 * The 12k code cap mirrors the sandbox's own truncation.
 * @param {unknown} value - Raw `solutions` from the request body.
 * @returns {Array<{problemIndex: number, title: string, code: string}>} Up to 12 bounded entries.
 */
function normalizeSolutions(value) {
  if (!Array.isArray(value)) return [];

  return value.slice(0, 12).map((solution) => ({
    problemIndex: Number.isInteger(solution?.problemIndex) ? solution.problemIndex : -1,
    title: String(solution?.title || "").slice(0, 140),
    code: String(solution?.code || "").slice(0, 12000),
  }));
}
