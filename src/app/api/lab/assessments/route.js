/** @file `/api/lab/assessments` — lists and creates coding assessments. */

import { json } from "@/lib/api";
import { getAuthPayloadFromRequest } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import { findMissingIntervieweeEmails } from "@/lib/candidateUsers";
import { assessmentIsExpired, normalizeLabAssessmentPayload, sanitizeAssessmentForUser } from "@/lib/labAccess";
import LabAssessment from "@/models/LabAssessment";

/** Roles allowed anywhere in the Lab. Anything else is a 403. */
const LAB_ROLES = new Set(["Interviewer", "Interviewee"]);

/**
 * Lists assessments the caller owns (interviewer) or is assigned (interviewee).
 * Candidates additionally only see unexpired ones, so a passed deadline removes
 * the assessment from their list rather than showing an unusable entry. Every
 * result goes through `sanitizeAssessmentForUser`, which strips hidden tests and
 * other candidates' submissions.
 * @param {import("next/server").NextRequest} req - Authenticated request.
 * @returns {Promise<import("next/server").NextResponse>} 200 with `{ assessments }`
 *   newest-first; 401 signed out; 403 for unknown roles; 500 otherwise.
 */
export async function GET(req) {
  try {
    const user = await getAuthPayloadFromRequest(req);
    if (!user) return json({ message: "Unauthorized" }, 401);
    if (!LAB_ROLES.has(user.role)) return json({ message: "Forbidden" }, 403);

    await connectDB();
    const userEmail = String(user.email || "").toLowerCase();
    const query = user.role === "Interviewer"
      ? { createdBy: userEmail }
      : { candidates: userEmail, deadlineAt: { $gt: new Date() } };
    const assessments = await LabAssessment.find(query).sort({ createdAt: -1 });

    return json({
      assessments: assessments.map((assessment) => sanitizeAssessmentForUser(assessment, user)),
    });
  } catch (error) {
    console.error("Lab assessment list error:", error);
    return json({ message: "Failed to fetch Lab assessments" }, 500);
  }
}

/**
 * Creates a coding assessment from the builder payload.
 * Validation runs in a deliberate order — cheap shape checks first, then the
 * database round-trip for candidate existence, so a malformed payload never
 * costs a query. `durationMinutes` is recomputed from the problems rather than
 * trusted from the body.
 * @param {import("next/server").NextRequest} req - Body carries the test-builder payload.
 * @returns {Promise<import("next/server").NextResponse>} 201 with the created
 *   `{ assessment }`; 400 for a missing title, no candidates, no problems, an
 *   invalid or past deadline, out-of-range duration, malformed test JSON, or
 *   unregistered candidates; 401 signed out; 403 for non-interviewers; 500 otherwise.
 */
export async function POST(req) {
  try {
    const user = await getAuthPayloadFromRequest(req);
    if (!user) return json({ message: "Unauthorized" }, 401);
    if (user.role !== "Interviewer") return json({ message: "Only interviewers can create Lab assessments" }, 403);

    const payload = normalizeLabAssessmentPayload(await req.json(), user.email);
    if (!payload.title) return json({ message: "Assessment title is required" }, 400);
    if (payload.candidates.length === 0) return json({ message: "Assign at least one candidate email" }, 400);
    if (payload.problems.length === 0) return json({ message: "Add at least one problem" }, 400);
    if (Number.isNaN(new Date(payload.deadlineAt).getTime())) return json({ message: "Valid deadline is required" }, 400);
    if (assessmentIsExpired(payload)) return json({ message: "Deadline must be in the future" }, 400);

    const totalProblemMinutes = payload.problems.reduce(
      (total, problem) => total + problem.timeLimitMinutes,
      0
    );

    if (totalProblemMinutes < 1 || totalProblemMinutes > 120) {
      return json({ message: "Total section duration must be between 1 and 120 minutes" }, 400);
    }

    payload.durationMinutes = totalProblemMinutes;

    const invalidTest = findInvalidTest(payload.problems);
    if (invalidTest) {
      return json({ message: invalidTest }, 400);
    }

    await connectDB();
    const missingCandidates = await findMissingIntervieweeEmails(payload.candidates);

    if (missingCandidates.length > 0) {
      return json({
        message: `These candidates must register as Interviewees first: ${missingCandidates.join(", ")}`,
      }, 400);
    }

    const assessment = await LabAssessment.create(payload);

    return json({ message: "Lab assessment created", assessment }, 201);
  } catch (error) {
    console.error("Lab assessment create error:", error);
    return json({ message: "Failed to create Lab assessment" }, 500);
  }
}

/**
 * Finds the first test whose JSON won't parse, as a user-facing message.
 * Checked at create time because the grader parses these at run time — an
 * unparseable expectation would silently fail every candidate's submission.
 * @param {object[]} problems - Normalized problems, each with a `tests` array.
 * @returns {string} Message naming the offending problem and test, or `""` when all are valid.
 */
function findInvalidTest(problems) {
  for (const [problemIndex, problem] of problems.entries()) {
    if (!problem.tests.length) return `Problem ${problemIndex + 1} needs at least one test case.`;

    for (const [testIndex, test] of problem.tests.entries()) {
      if (!isValidJson(test.inputJson)) return `Problem ${problemIndex + 1}, test case ${testIndex + 1} input must be valid JSON.`;
      if (!isValidJson(test.expectedJson)) return `Problem ${problemIndex + 1}, test case ${testIndex + 1} expected output must be valid JSON.`;
    }
  }

  return "";
}

/**
 * True when a string parses as JSON.
 * @param {string} value - Raw `inputJson` or `expectedJson` from a test case.
 * @returns {boolean} `true` when `JSON.parse` succeeds.
 */
function isValidJson(value) {
  try {
    JSON.parse(value);
    return true;
  } catch {
    // Parse failure is the answer here, not an error to propagate.
    return false;
  }
}
