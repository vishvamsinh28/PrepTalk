import { json } from "@/lib/api";
import { getAuthPayloadFromRequest } from "@/lib/auth";
import { findMissingIntervieweeEmails } from "@/lib/candidateUsers";
import { connectDB } from "@/lib/db";
import { assessmentIsExpired, normalizeLabAssessmentPayload, sanitizeAssessmentForUser, userCanAccessAssessment } from "@/lib/labAccess";
import { isValidObjectId } from "@/lib/sessionAccess";
import { normalizeEmailList, normalizeText } from "@/lib/validation";
import LabAssessment from "@/models/LabAssessment";

const LAB_ROLES = new Set(["Interviewer", "Interviewee"]);

/**
 * GET /api/lab/assessments/:id — one assessment, sanitized for the
 * caller's role. Auth: owner or assigned candidate.
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
 * DELETE /api/lab/assessments/:id — removes an assessment. Auth: owner.
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
 * PATCH /api/lab/assessments/:id — updates settings/problems. Auth: owner.
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

function normalizeSkillList(value) {
  const rawSkills = Array.isArray(value) ? value : String(value || "").split(",");
  return [...new Set(rawSkills.map((skill) => normalizeText(skill, 80)).filter(Boolean))].slice(0, 12);
}

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

function isValidJson(value) {
  try {
    JSON.parse(value);
    return true;
  } catch {
    return false;
  }
}
