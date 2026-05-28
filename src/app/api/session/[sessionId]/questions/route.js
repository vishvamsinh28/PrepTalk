import { json } from "@/lib/api";
import { getAuthPayloadFromRequest } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import { generateGeminiJson } from "@/lib/gemini";
import { normalizePrepGuide } from "@/lib/aiOutput";
import { findOwnedSession } from "@/lib/sessionAccess";

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
    return json({ message: "Failed to generate questions", error: error.message }, 500);
  }
}

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
    return json({ message: "Failed to clear questions", error: error.message }, 500);
  }
}
