import { json } from "@/lib/api";
import { getAuthPayloadFromRequest } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import { generateGeminiJson } from "@/lib/gemini";
import { normalizePrepGuide } from "@/lib/aiOutput";
import { findOwnedSession } from "@/lib/sessionAccess";

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
    return json({ message: "Failed to generate prep guide", error: error.message }, 500);
  }
}
