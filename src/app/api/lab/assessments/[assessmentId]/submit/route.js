import { json } from "@/lib/api";
import { getAuthPayloadFromRequest } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import { gradeLabAssessment } from "@/lib/labServerRunner";
import { assessmentIsExpired, userCanAccessAssessment } from "@/lib/labAccess";
import { isValidObjectId } from "@/lib/sessionAccess";
import LabAssessment from "@/models/LabAssessment";

export async function POST(req, props) {
  try {
    const user = await getAuthPayloadFromRequest(req);
    if (!user) return json({ message: "Unauthorized" }, 401);
    if (user.role !== "Interviewee") return json({ message: "Only interviewees can submit Lab assessments" }, 403);
    const userEmail = String(user.email || "").toLowerCase();

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

    assessment.submissions.push(submission);
    await assessment.save();

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

function normalizeSolutions(value) {
  if (!Array.isArray(value)) return [];

  return value.slice(0, 12).map((solution) => ({
    problemIndex: Number.isInteger(solution?.problemIndex) ? solution.problemIndex : -1,
    title: String(solution?.title || "").slice(0, 140),
    code: String(solution?.code || "").slice(0, 12000),
  }));
}
