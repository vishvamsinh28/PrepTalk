/** @file `/api/lab/assessments/:id` — read, update, and delete a single assessment. */

import { json } from "@/lib/api";
import { getAuthPayloadFromRequest } from "@/lib/auth";
import { findMissingIntervieweeEmails } from "@/lib/candidateUsers";
import { connectDB } from "@/lib/db";
import { assessmentIsExpired, normalizeLabAssessmentPayload, sanitizeAssessmentForUser, userCanAccessAssessment } from "@/lib/labAccess";
import { isValidObjectId } from "@/lib/sessionAccess";
import { normalizeEmailList, normalizeText } from "@/lib/validation";
import LabAssessment from "@/models/LabAssessment";

/** Roles allowed in the Lab. Anything else is a 403. */
const LAB_ROLES = new Set(["Interviewer", "Interviewee"]);

/**
 * Returns one assessment, sanitized for the caller's role.
 * Interviewers get the full document including hidden tests and every
 * submission; candidates get visible tests and only their own results. The
 * deadline check applies to candidates only, so an owner can still review work
 * after the assessment closes.
 * @param {import("next/server").NextRequest} req - Authenticated request.
 * @param {{ params: Promise<{ assessmentId: string }> }} props - Route params; awaited per Next 15.
 * @returns {Promise<import("next/server").NextResponse>} 200 with `{ assessment }`;
 *   400 on a malformed id; 401 signed out; 403 for unknown roles or
 *   non-participants; 404 when missing; 410 past the deadline for candidates; 500 otherwise.
 */
export async function GET(req, props) {
  try {
    const user = await getAuthPayloadFromRequest(req);
    if (!user) return json({ message: "Unauthorized" }, 401);
    if (!LAB_ROLES.has(user.role)) return json({ message: "Forbidden" }, 403);

    const { assessmentId } = await props.params;
    if (!isValidObjectId(assessmentId)) return json({ message: "Invalid assessmentId" }, 400);

    await connectDB();
    const assessment = await LabAssessment.findById(assessmentId);
    if (!assessment) return json({ message: "Assessment not found" }, 404);
    if (!userCanAccessAssessment(assessment, user)) return json({ message: "Forbidden" }, 403);
    if (user.role === "Interviewee" && assessmentIsExpired(assessment)) return json({ message: "This assessment deadline has passed." }, 410);

    return json({ assessment: sanitizeAssessmentForUser(assessment, user) });
  } catch (error) {
    console.error("Lab assessment fetch error:", error);
    return json({ message: "Failed to fetch Lab assessment" }, 500);
  }
}

/**
 * Deletes an assessment and, with it, every submission stored inside it.
 * Ownership is re-checked against `createdBy` directly rather than via
 * `userCanAccessAssessment`, since that helper would also admit candidates.
 * @param {import("next/server").NextRequest} req - Authenticated request.
 * @param {{ params: Promise<{ assessmentId: string }> }} props - Route params; awaited per Next 15.
 * @returns {Promise<import("next/server").NextResponse>} 200 on success; 400 on
 *   a malformed id; 401 signed out; 403 for non-owners; 404 when missing; 500 otherwise.
 */
export async function DELETE(req, props) {
  try {
    const user = await getAuthPayloadFromRequest(req);
    if (!user) return json({ message: "Unauthorized" }, 401);
    if (user.role !== "Interviewer") return json({ message: "Only interviewers can delete Lab assessments" }, 403);

    const { assessmentId } = await props.params;
    if (!isValidObjectId(assessmentId)) return json({ message: "Invalid assessmentId" }, 400);

    await connectDB();
    const assessment = await LabAssessment.findById(assessmentId);
    if (!assessment) return json({ message: "Assessment not found" }, 404);
    if (String(assessment.createdBy || "").toLowerCase() !== String(user.email || "").toLowerCase()) return json({ message: "Forbidden" }, 403);

    await LabAssessment.deleteOne({ _id: assessmentId });
    return json({ message: "Lab assessment deleted" });
  } catch (error) {
    console.error("Lab assessment delete error:", error);
    return json({ message: "Failed to delete Lab assessment" }, 500);
  }
}

/**
 * Updates an assessment's candidates, skills, deadline, and problems.
 * NOTE: `title` and `description` are pinned to the stored values before
 * normalizing, so this endpoint cannot rename an assessment — sending a new
 * title is silently ignored. Intentional or not, the builder UI has no rename
 * control today; add one and this line must change too.
 * Existing submissions are left untouched, so editing problems after candidates
 * have submitted leaves their old results scored against the previous tests.
 * @param {import("next/server").NextRequest} req - Body carries the builder payload.
 * @param {{ params: Promise<{ assessmentId: string }> }} props - Route params; awaited per Next 15.
 * @returns {Promise<import("next/server").NextResponse>} 200 with the sanitized
 *   `{ assessment }`; 400 for no candidates, unregistered candidates, an invalid
 *   or past deadline, no sections, out-of-range duration, or malformed test
 *   JSON; 401 signed out; 403 for non-owners; 404 when missing; 500 otherwise.
 */
export async function PATCH(req, props) {
  try {
    const user = await getAuthPayloadFromRequest(req);
    if (!user) return json({ message: "Unauthorized" }, 401);
    if (user.role !== "Interviewer") return json({ message: "Only interviewers can update Lab assessments" }, 403);

    const { assessmentId } = await props.params;
    if (!isValidObjectId(assessmentId)) return json({ message: "Invalid assessmentId" }, 400);

    const body = await req.json();
    await connectDB();

    const assessment = await LabAssessment.findById(assessmentId);
    if (!assessment) return json({ message: "Assessment not found" }, 404);
    if (String(assessment.createdBy || "").toLowerCase() !== String(user.email || "").toLowerCase()) return json({ message: "Forbidden" }, 403);

    const normalizedPatch = normalizeLabAssessmentPayload({
      ...body,
      title: assessment.title,
      description: assessment.description,
      problems: Array.isArray(body.problems) ? body.problems : assessment.problems,
    }, user.email);
    const candidates = [...new Set(normalizeEmailList(body.candidates, 50))];
    if (candidates.length === 0) return json({ message: "Assign at least one candidate email" }, 400);

    const missingCandidates = await findMissingIntervieweeEmails(candidates);
    if (missingCandidates.length > 0) {
      return json({
        message: `These candidates must register as Interviewees first: ${missingCandidates.join(", ")}`,
      }, 400);
    }

    const deadlineAt = new Date(body.deadlineAt);
    if (Number.isNaN(deadlineAt.getTime())) return json({ message: "Valid deadline is required" }, 400);
    if (deadlineAt.getTime() <= Date.now()) return json({ message: "Deadline must be in the future" }, 400);

    if (normalizedPatch.problems.length === 0) return json({ message: "Add at least one section" }, 400);
    const totalProblemMinutes = normalizedPatch.problems.reduce(
      (total, problem) => total + problem.timeLimitMinutes,
      0
    );

    if (totalProblemMinutes < 1 || totalProblemMinutes > 120) {
      return json({ message: "Total section duration must be between 1 and 120 minutes" }, 400);
    }

    const invalidTest = findInvalidTest(normalizedPatch.problems);
    if (invalidTest) return json({ message: invalidTest }, 400);

    assessment.candidates = candidates;
    assessment.coreSkills = normalizeSkillList(body.coreSkills);
    assessment.deadlineAt = deadlineAt;
    assessment.durationMinutes = totalProblemMinutes;
    assessment.problems = normalizedPatch.problems;
    await assessment.save();

    return json({ message: "Lab assessment updated", assessment: sanitizeAssessmentForUser(assessment, user) });
  } catch (error) {
    console.error("Lab assessment update error:", error);
    return json({ message: "Failed to update Lab assessment" }, 500);
  }
}

/**
 * Normalizes core skills from an array or comma-separated string.
 * Third copy of this logic — the others live in `@/lib/labAccess` and the
 * sibling assessments route. Worth exporting one from `labAccess`.
 * @param {unknown} value - Array of skills or a comma-separated string.
 * @returns {string[]} Unique, non-empty skill names, capped at 12.
 */
function normalizeSkillList(value) {
  const rawSkills = Array.isArray(value) ? value : String(value || "").split(",");
  return [...new Set(rawSkills.map((skill) => normalizeText(skill, 80)).filter(Boolean))].slice(0, 12);
}

/**
 * Finds the first test whose JSON won't parse, as a user-facing message.
 * Same as the sibling create route but worded "Section" rather than "Problem",
 * matching the edit UI's terminology.
 * @param {object[]} problems - Normalized problems, each with a `tests` array.
 * @returns {string} Message naming the offending section and test, or `""` when all are valid.
 */
function findInvalidTest(problems) {
  for (const [problemIndex, problem] of problems.entries()) {
    if (!problem.tests.length) return `Section ${problemIndex + 1} needs at least one test case.`;

    for (const [testIndex, test] of problem.tests.entries()) {
      if (!isValidJson(test.inputJson)) return `Section ${problemIndex + 1}, test case ${testIndex + 1} input must be valid JSON.`;
      if (!isValidJson(test.expectedJson)) return `Section ${problemIndex + 1}, test case ${testIndex + 1} expected output must be valid JSON.`;
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
