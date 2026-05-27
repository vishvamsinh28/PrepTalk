import { connectDB } from "@/lib/db";
import InterviewResult from "@/models/InterviewResult";
import { NextResponse } from "next/server";
import { generateGeminiContent } from "@/lib/gemini";
import { getCurrentUser } from "@/lib/serverAuth";

export async function POST(req) {
  try {
    const { questions, answers, role } = await req.json();

    const qaPairs = questions.map((q, index) => {
      const ans = answers[index] || "No answer provided.";
      return `Q: ${q}\nA: ${ans}`;
    }).join("\n\n");

    const prompt = `
      You are an expert interview coach.
      Based on the following questions and candidate answers, provide:
      - A brief summary of performance
      - Strengths observed
      - Areas of improvement

      Interview Transcript:
      ${qaPairs}
    `;

    const summary = await generateGeminiContent(
      { contents: [{ role: "user", parts: [{ text: prompt }] }] },
      {
        temperature: 0.7,
        topK: 40,
        topP: 0.9,
        maxOutputTokens: 512,
      }
    );

    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();
    const interviewResult = new InterviewResult({
      userEmail: user.email,
      role,
      summary,
    });
    await interviewResult.save();

    return NextResponse.json({ summary });
  } catch (error) {
    console.error("Generate Summary Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
