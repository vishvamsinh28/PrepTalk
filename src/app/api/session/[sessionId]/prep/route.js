/** @file `/api/session/:id/prep` — generates and clears the candidate-facing prep guide. Session owner only. */

import { json, serverError } from "@/lib/api";
import { getAuthPayloadFromRequest } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import { generateGeminiJson } from "@/lib/gemini";
import { normalizePrepGuide } from "@/lib/aiOutput";
import { findOwnedSession } from "@/lib/sessionAccess";

/**
 * Builds the prep-guide prompt from the session's role, level, and agenda.
 * Every field has a fallback so a sparsely filled session still produces a
 * usable guide rather than a prompt full of `undefined`.
 * @param {object} session - Session document.
 * @returns {string} Prompt requesting `{ prepGuide }`.
 */
function prepPrompt(session) {
  return `
Return only valid JSON:
{
  "prepGuide": "A concise interviewee prep guide with 6 practical bullet points"
}

Create a candidate-facing prep guide for:
Role: ${session.role || "General"}
Level: ${session.level || "Entry"}
Type: ${session.interviewType || "Mixed"}
Skills: ${(session.skills || []).join(", ") || "general role skills"}
Agenda: ${(session.agenda || []).map((item) => `${item.title} ${item.minutes} min`).join(", ") || "not provided"}
`;
}

/**
 * Generates the prep guide and stores it on the session.
 * The existing guide is passed to `normalizePrepGuide` as the fallback, so a
 * malformed response leaves the previous guide in place rather than blanking it.
 * @param {import("next/server").NextRequest} req - Authenticated request; body unused.
 * @param {{ params: Promise<{ sessionId: string }> }} props - Route params; awaited per Next 15.
 * @returns {Promise<import("next/server").NextResponse>} 200 with `{ prepGuide }`;
 *   401 signed out; 403 for non-interviewers; 404 when not owned; 500 when Gemini fails.
 */
export async function POST(req, props) {
  try {
    const { sessionId } = await props.params;
    const user = await getAuthPayloadFromRequest(req);
    if (!user) return json({ message: "Unauthorized" }, 401);
    if (user.role !== "Interviewer") return json({ message: "Only interviewers can generate prep guides" }, 403);

    await connectDB();
    const session = await findOwnedSession(sessionId, user);
    if (!session) return json({ message: "Session not found" }, 404);

    const result = await generateGeminiJson(prepPrompt(session));
    const prepGuide = normalizePrepGuide(result.prepGuide, session.prepGuide);
    session.prepGuide = prepGuide;
    await session.save();

    return json({ prepGuide });
  } catch (error) {
    console.error("Prep guide generation error:", error);
    return serverError("Failed to generate prep guide");
  }
}

/**
 * Clears the prep guide, leaving the question bank intact.
 * @param {import("next/server").NextRequest} req - Authenticated request.
 * @param {{ params: Promise<{ sessionId: string }> }} props - Route params; awaited per Next 15.
 * @returns {Promise<import("next/server").NextResponse>} 200 with `{ prepGuide: "" }`;
 *   401 signed out; 403 for non-interviewers; 404 when not owned; 500 otherwise.
 */
export async function DELETE(req, props) {
  try {
    const { sessionId } = await props.params;
    const user = await getAuthPayloadFromRequest(req);
    if (!user) return json({ message: "Unauthorized" }, 401);
    if (user.role !== "Interviewer") return json({ message: "Only interviewers can clear prep guides" }, 403);

    await connectDB();
    const session = await findOwnedSession(sessionId, user);
    if (!session) return json({ message: "Session not found" }, 404);

    session.prepGuide = "";
    await session.save();

    return json({ prepGuide: "" });
  } catch (error) {
    console.error("Prep guide clear error:", error);
    return serverError("Failed to clear prep guide");
  }
}
