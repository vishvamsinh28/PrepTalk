import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

export async function POST(req) {
  try {
    const { questions, answers } = await req.json();

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

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

      Be specific and encouraging.

      Interview Transcript:
      ${qaPairs}

      Provide your summary as plain text, around 4-5 lines.
    `;

    const result = await model.generateContent({
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      generationConfig: {
        temperature: 0.7,
        topK: 40,
        topP: 0.9,
        maxOutputTokens: 512,
      },
    });

    const response = result.response;
    const summary = response.text().trim();

    return NextResponse.json({ summary });
  } catch (error) {
    console.error("Generate Summary Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
