/** @file `/api/session/:id/questions` — generates and clears the AI question bank. Session owner only. */

import { json, serverError } from "@/lib/api";
import { getAuthPayloadFromRequest } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import { generateGeminiJson } from "@/lib/gemini";
import { normalizePrepGuide } from "@/lib/aiOutput";
import { findOwnedSession } from "@/lib/sessionAccess";

/**
 * Normalizes the model's question array into the stored shape.
 * NOTE: near-duplicate of `normalizeQuestionList` in `@/lib/questionBank`, which
 * also handles bare-string entries and has no 12-item cap. Worth collapsing into
 * the shared helper — kept separate here only because the cap differs.
 * @param {unknown} value - `questions` field from the parsed model response.
 * @returns {Array<{category: string, skill: string, question: string, followUps: string[]}>}
 *   Up to 12 questions; entries without question text are dropped.
 */
function normalizeQuestions(value) {
  if (!Array.isArray(value)) return [];

  return value
    .map((item) => ({
      category: String(item.category || "General").trim(),
      skill: String(item.skill || "").trim(),
      question: String(item.question || "").trim(),
      followUps: Array.isArray(item.followUps)
        ? item.followUps.map((followUp) => String(followUp).trim()).filter(Boolean)
        : String(item.followUps || "")
            .split(/\n|;/)
            .map((followUp) => followUp.trim())
            .filter(Boolean),
    }))
    .filter((item) => item.question)
    .slice(0, 12);
}

/**
 * Builds the prompt for the question bank and its companion prep guide.
 * Asks for 10 but the normalizer caps at 12, leaving headroom for a model that
 * over-delivers rather than truncating a good response.
 * @param {object} session - Session document supplying role, level, and skills.
 * @returns {string} Prompt requesting `{ questions, prepGuide }`.
 */
function questionPrompt(session) {
  return `
Return only valid JSON for an interview question bank.
Shape:
{
  "questions": [
    {
      "category": "Technical | Behavioral | System design | Role fit",
      "skill": "specific skill",
      "question": "one clear interview question",
      "followUps": ["follow-up 1", "follow-up 2"]
    }
  ],
  "prepGuide": "candidate-facing prep guide in 5 short bullets"
}

Session:
Title: ${session.title}
Role: ${session.role || "General"}
Level: ${session.level || "Entry"}
Type: ${session.interviewType || "Mixed"}
Skills: ${(session.skills || []).join(", ") || "general role skills"}
Description: ${session.description || "No description"}

Generate 10 strong questions. Make them practical and role-specific.
`;
}

/**
 * Generates the AI question bank and stores it on the session.
 * Also refreshes the prep guide, since one generation produces both — the
 * existing guide is passed as the fallback so a partial response can't blank it.
 * Replaces any previous bank, which is the intended "regenerate" behaviour.
 * @param {import("next/server").NextRequest} req - Authenticated request; body unused.
 * @param {{ params: Promise<{ sessionId: string }> }} props - Route params; awaited per Next 15.
 * @returns {Promise<import("next/server").NextResponse>} 200 with `{ questions, prepGuide }`;
 *   401 signed out; 403 for non-interviewers; 404 when not owned; 500 when Gemini fails.
 */
export async function POST(req, props) {
  try {
    const { sessionId } = await props.params;
    const user = await getAuthPayloadFromRequest(req);
    if (!user) return json({ message: "Unauthorized" }, 401);
    if (user.role !== "Interviewer") return json({ message: "Only interviewers can generate questions" }, 403);

    await connectDB();
    const session = await findOwnedSession(sessionId, user);
    if (!session) return json({ message: "Session not found" }, 404);

    const result = await generateGeminiJson(questionPrompt(session));
    const questionBank = normalizeQuestions(result.questions);
    const prepGuide = normalizePrepGuide(result.prepGuide, session.prepGuide);

    session.questionBank = questionBank;
    session.prepGuide = prepGuide;
    await session.save();

    return json({ questions: questionBank, prepGuide });
  } catch (error) {
    console.error("Question generation error:", error);
    return serverError("Failed to generate questions");
  }
}

/**
 * Clears the question bank, leaving the prep guide intact.
 * The two are generated together but cleared independently, so wiping questions
 * doesn't cost the candidate their prep material.
 * @param {import("next/server").NextRequest} req - Authenticated request.
 * @param {{ params: Promise<{ sessionId: string }> }} props - Route params; awaited per Next 15.
 * @returns {Promise<import("next/server").NextResponse>} 200 with `{ questions: [] }`;
 *   401 signed out; 403 for non-interviewers; 404 when not owned; 500 otherwise.
 */
export async function DELETE(req, props) {
  try {
    const { sessionId } = await props.params;
    const user = await getAuthPayloadFromRequest(req);
    if (!user) return json({ message: "Unauthorized" }, 401);
    if (user.role !== "Interviewer") return json({ message: "Only interviewers can clear questions" }, 403);

    await connectDB();
    const session = await findOwnedSession(sessionId, user);
    if (!session) return json({ message: "Session not found" }, 404);

    session.questionBank = [];
    await session.save();

    return json({ questions: [] });
  } catch (error) {
    console.error("Question clear error:", error);
    return serverError("Failed to clear questions");
  }
}
