import { json } from "@/lib/api";
import { getAuthPayloadFromRequest } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import { userCanAccessAssessment } from "@/lib/labAccess";
import { isValidObjectId } from "@/lib/sessionAccess";
import LabAssessment from "@/models/LabAssessment";

export async function POST(req, props) {
  try {
    const user = await getAuthPayloadFromRequest(req);
    if (!user) return json({ message: "Unauthorized" }, 401);
    if (user.role !== "Interviewee") return json({ message: "Only interviewees can submit Lab assessments" }, 403);

    const { assessmentId } = await props.params;
    if (!isValidObjectId(assessmentId)) return json({ message: "Invalid assessmentId" }, 400);

    const body = await req.json();
    await connectDB();

    const assessment = await LabAssessment.findById(assessmentId);
    if (!assessment) return json({ message: "Assessment not found" }, 404);
    if (!userCanAccessAssessment(assessment, user)) return json({ message: "Forbidden" }, 403);

    const previous = assessment.submissions.filter((submission) => submission.candidateEmail === user.email);
    if (previous.length >= 20) return json({ message: "Submission limit reached for this assessment" }, 429);

    const maxScore = assessment.problems.reduce((total, problem) => total + problem.points, 0);
    const totalTests = assessment.problems.reduce((total, problem) => total + problem.tests.length, 0);
    const submission = {
      candidateEmail: user.email,
      score: clampWholeNumber(body.score, 0, 0, maxScore),
      maxScore,
      passedTests: clampWholeNumber(body.passedTests, 0, 0, totalTests),
      totalTests,
      runtimeMs: clampWholeNumber(body.runtimeMs, 0, 0, assessment.durationMinutes * 60 * 1000),
      attempts: previous.length + 1,
      status: "Submitted",
      submittedAt: new Date(),
    };

    assessment.submissions.push(submission);
    await assessment.save();

    return json({ message: "Lab assessment submitted", submission });
  } catch (error) {
    console.error("Lab submit error:", error);
    return json({ message: "Failed to submit Lab assessment", error: error.message }, 500);
  }
}

function clampWholeNumber(value, fallback, min, max) {
  const parsed = Number.parseInt(value, 10);
  const number = Number.isFinite(parsed) ? parsed : fallback;
  return Math.min(Math.max(number, min), max);
}
