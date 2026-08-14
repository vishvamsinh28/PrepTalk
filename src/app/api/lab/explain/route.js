/** @file `POST /api/lab/explain` — asks Gemini why a candidate's failing tests failed. */

import { json } from "@/lib/api";
import { getAuthPayloadFromRequest } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import { generateGeminiJson } from "@/lib/gemini";
import { assessmentIsExpired, userCanAccessAssessment } from "@/lib/labAccess";
import { isValidObjectId } from "@/lib/sessionAccess";
import LabAssessment from "@/models/LabAssessment";
import { getClientIp, rateLimit, rateLimitResponse } from "@/lib/rateLimit";

/** Cap on failing cases sent per request, bounding prompt size and cost. */
const MAX_FAILED_CASES = 8;

/** Cap on candidate code included in the prompt. */
const MAX_CODE_CHARS = 6000;

/** Roles allowed in the Lab. Anything else is a 403. */
const LAB_ROLES = new Set(["Interviewer", "Interviewee"]);

/**
 * Coerces any value to a length-bounded string.
 * Every field interpolated into the prompt passes through here, so a huge or
 * non-string value can't blow up the request.
 * @param {unknown} value - Raw value; nullish becomes `""`.
 * @param {number} [max=1200] - Character cap.
 * @returns {string} Bounded string.
 */
function safeString(value, max = 1200) {
  return String(value ?? "").slice(0, max);
}

/**
 * Bounds the failing test cases before they go into the prompt.
 * Values are re-stringified through `JSON.stringify` so the model sees the same
 * literal form the candidate saw in the results panel.
 * @param {unknown} value - Raw `failedCases` from the request body.
 * @returns {Array<{name: string, input: string, expected: string, output: string, error: string}>}
 *   Up to `MAX_FAILED_CASES` bounded cases.
 */
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

/**
 * Bounds the model's explanations and drops incomplete entries.
 * The client matches these back to results by `name`, so an entry missing a
 * name is unusable and is filtered out rather than rendered unattached.
 * @param {unknown} value - `explanations` from the parsed model response.
 * @returns {Array<{name: string, explanation: string}>} Up to `MAX_FAILED_CASES` entries.
 */
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

/**
 * Builds the prompt asking for a short hint per failing test.
 * Explicitly tells the model not to rewrite the solution — the point is to
 * unblock the candidate, not to hand them the answer mid-assessment.
 * @param {{ problem: object, code: string, failedCases: object[] }} input - Problem
 *   from the database, the candidate's code, and their failing cases.
 * @returns {string} Prompt requesting `{ explanations }`.
 */
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

/**
 * Explains a candidate's failing tests in one or two sentences each.
 * Returns early with an empty list when nothing failed, avoiding a pointless
 * model call. Interviewers may call this on an expired assessment (to review a
 * candidate's work); interviewees may not.
 * @param {import("next/server").NextRequest} req - Body carries
 *   `{ assessmentId, problemIndex, code, failedCases }`.
 * @returns {Promise<import("next/server").NextResponse>} 200 with `{ explanations }`;
 *   400 on a bad assessment id or problem index; 401 signed out; 403 for unknown
 *   roles or non-participants; 404 when missing; 410 past the deadline for
 *   candidates; 429 at 20/hour; 500 when Gemini fails.
 */
export async function POST(req) {
  try {
    const user = await getAuthPayloadFromRequest(req);
    if (!user) return json({ message: "Unauthorized" }, 401);
    if (!LAB_ROLES.has(user.role)) return json({ message: "Forbidden" }, 403);
    const limiter = rateLimit({
      key: `lab-explain:${user.email}:${getClientIp(req)}`,
      limit: 20,
      windowMs: 60 * 60 * 1000,
    });
    if (limiter.limited) return rateLimitResponse();

    const body = await req.json();
    if (!isValidObjectId(body.assessmentId)) return json({ message: "Valid assessmentId is required" }, 400);

    await connectDB();
    const assessment = await LabAssessment.findById(body.assessmentId).select("createdBy candidates deadlineAt problems");
    if (!assessment) return json({ message: "Assessment not found" }, 404);
    if (!userCanAccessAssessment(assessment, user)) return json({ message: "Forbidden" }, 403);
    if (user.role === "Interviewee" && assessmentIsExpired(assessment)) return json({ message: "This assessment deadline has passed." }, 410);

    // Read the problem statement from the stored assessment rather than the
    // request body — the body is candidate-controlled and would otherwise let
    // them steer the prompt with text that was never part of the assessment.
    const problemIndex = Number.isInteger(body.problemIndex) ? body.problemIndex : -1;
    const problem = assessment.problems?.[problemIndex];
    if (!problem) return json({ message: "Valid problemIndex is required" }, 400);

    const failedCases = normalizeCases(body.failedCases);

    if (failedCases.length === 0) {
      return json({ explanations: [] });
    }

    const result = await generateGeminiJson(
      explanationPrompt({
        problem,
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
