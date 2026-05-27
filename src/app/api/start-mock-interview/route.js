import { NextResponse } from "next/server";
import { generateGeminiContent } from "@/lib/gemini";

export async function POST(req) {
  try {
    const { role, category, numberOfQuestions } = await req.json();

    const randomSeed = Math.floor(Math.random() * 1000);

    const prompt = `
      Generate ${numberOfQuestions} unique and varied interview questions for the role of ${role}, focusing on ${category} skills.
      Avoid repetition from previous questions, make each question creative and diverse.
      Random seed: ${randomSeed}
      Do not provide answers, just the questions.
      Format as plain numbered list:
      1. Question one?
      2. Question two?
      ...
    `;

    const text = await generateGeminiContent(
      { contents: [{ role: "user", parts: [{ text: prompt }] }] },
      {
        temperature: 0.9,
        topK: 40,
        topP: 0.95,
        maxOutputTokens: 2048,
      }
    );

    const lines = text.split("\n").filter(line => line.trim() !== "");
    const questions = lines.map(line => line.replace(/^\d+\.\s*/, "").trim());

    return NextResponse.json({ questions });
  } catch (error) {
    console.error("Mock Interview Generation Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
