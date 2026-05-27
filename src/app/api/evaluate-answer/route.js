import { NextResponse } from "next/server";
import { generateGeminiContent } from "@/lib/gemini";

export async function POST(req) {
  try {
    const { question, answer } = await req.json();

    const prompt = `
      You are an expert interviewer.
      I will give you an interview question and a candidate's answer.
      Provide a short evaluation of the answer. Mention:
      - If the answer is correct, partially correct, or incorrect
      - Any improvements or suggestions

      Question: ${question}
      Candidate's Answer: ${answer}
    `;

    const feedback = await generateGeminiContent(
      { contents: [{ role: "user", parts: [{ text: prompt }] }] },
      {
        temperature: 0.7,
        topK: 40,
        topP: 0.9,
        maxOutputTokens: 512,
      }
    );

    return NextResponse.json({ feedback });
  } catch (error) {
    console.error("Evaluate Answer Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
