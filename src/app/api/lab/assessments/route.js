import { json } from "@/lib/api";
import { getAuthPayloadFromRequest } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import { findMissingIntervieweeEmails } from "@/lib/candidateUsers";
import { normalizeLabAssessmentPayload, sanitizeAssessmentForUser } from "@/lib/labAccess";
import LabAssessment from "@/models/LabAssessment";

export async function GET(req) {
  try {
    const user = await getAuthPayloadFromRequest(req);
    if (!user) return json({ message: "Unauthorized" }, 401);

    await connectDB();
    const query = user.role === "Interviewer"
      ? { createdBy: user.email }
      : { candidates: user.email };
    const assessments = await LabAssessment.find(query).sort({ createdAt: -1 });

    return json({
      assessments: assessments.map((assessment) => sanitizeAssessmentForUser(assessment, user)),
    });
  } catch (error) {
    console.error("Lab assessment list error:", error);
    return json({ message: "Failed to fetch Lab assessments", error: error.message }, 500);
  }
}

export async function POST(req) {
  try {
    const user = await getAuthPayloadFromRequest(req);
    if (!user) return json({ message: "Unauthorized" }, 401);
    if (user.role !== "Interviewer") return json({ message: "Only interviewers can create Lab assessments" }, 403);

    const payload = normalizeLabAssessmentPayload(await req.json(), user.email);
    if (!payload.title) return json({ message: "Assessment title is required" }, 400);
    if (payload.candidates.length === 0) return json({ message: "Assign at least one candidate email" }, 400);
    if (payload.problems.length === 0) return json({ message: "Add at least one problem" }, 400);

    const totalProblemMinutes = payload.problems.reduce(
      (total, problem) => total + problem.timeLimitMinutes,
      0
    );

    if (totalProblemMinutes !== payload.durationMinutes) {
      return json({
        message: `Problem timers must add up to the assessment timer. Current total is ${totalProblemMinutes} minutes, assessment timer is ${payload.durationMinutes} minutes.`,
      }, 400);
    }

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
    return json({ message: "Failed to create Lab assessment", error: error.message }, 500);
  }
}

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

function isValidJson(value) {
  try {
    JSON.parse(value);
    return true;
  } catch {
    return false;
  }
}
