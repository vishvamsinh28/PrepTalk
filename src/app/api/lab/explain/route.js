import { json } from "@/lib/api";
import { getAuthPayloadFromRequest } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import { generateGeminiJson } from "@/lib/gemini";
import { assessmentIsExpired, userCanAccessAssessment } from "@/lib/labAccess";
import { isValidObjectId } from "@/lib/sessionAccess";
import LabAssessment from "@/models/LabAssessment";

const MAX_FAILED_CASES = 8;
const MAX_CODE_CHARS = 6000;
const LAB_ROLES = new Set(["Interviewer", "Interviewee"]);

function safeString(value, max = 1200) {
  return String(value ?? "").slice(0, max);
}

function normalizeCases(value) {
  if (!Array.isArray(value)) return [];

  return value.slice(0, MAX_FAILED_CASES).map((testCase) => ({
    name: safeString(testCase.name, 80),
    input: safeString(JSON.stringify(testCase.input ?? null), 800),
    expected: safeString(JSON.stringify(testCase.expected ?? null), 800),
    output: safeString(JSON.stringify(testCase.output ?? null), 800),
    error: safeString(testCase.error, 600),
  }));
}

function normalizeExplanations(value) {
  if (!Array.isArray(value)) return [];

  return value
    .map((item) => ({
      name: safeString(item.name, 80),
      explanation: safeString(item.explanation, 700),
    }))
    .filter((item) => item.name && item.explanation)
    .slice(0, MAX_FAILED_CASES);
}

function explanationPrompt({ problem, code, failedCases }) {
  return `
Return only valid JSON.
Shape:
{
  "explanations": [
    {
      "name": "failed test name",
      "explanation": "candidate-facing debugging hint in 1-2 short sentences"
    }
  ]
}

You are explaining failed coding assessment tests. Be helpful, concise, and do not rewrite the full solution.
Explain the likely bug using the observed input, expected output, actual output, and runtime error.

Problem title: ${safeString(problem?.title, 120)}
Problem statement: ${safeString(problem?.prompt, 1000)}
Candidate code:
${safeString(code, MAX_CODE_CHARS)}

Failed cases:
${JSON.stringify(failedCases, null, 2)}
`;
}

export async function POST(req) {
  try {
    const user = await getAuthPayloadFromRequest(req);
    if (!user) return json({ message: "Unauthorized" }, 401);
    if (!LAB_ROLES.has(user.role)) return json({ message: "Forbidden" }, 403);

    const body = await req.json();
    if (!isValidObjectId(body.assessmentId)) return json({ message: "Valid assessmentId is required" }, 400);

    await connectDB();
    const assessment = await LabAssessment.findById(body.assessmentId).select("createdBy candidates deadlineAt");
    if (!assessment) return json({ message: "Assessment not found" }, 404);
    if (!userCanAccessAssessment(assessment, user)) return json({ message: "Forbidden" }, 403);
    if (user.role === "Interviewee" && assessmentIsExpired(assessment)) return json({ message: "This assessment deadline has passed." }, 410);

    const failedCases = normalizeCases(body.failedCases);

    if (failedCases.length === 0) {
      return json({ explanations: [] });
    }

    const result = await generateGeminiJson(
      explanationPrompt({
        problem: body.problem || {},
        code: safeString(body.code, MAX_CODE_CHARS),
        failedCases,
      })
    );

    return json({ explanations: normalizeExplanations(result.explanations) });
  } catch (error) {
    console.error("Lab explanation error:", error);
    return json({ message: "Failed to explain failed tests" }, 500);
  }
}
