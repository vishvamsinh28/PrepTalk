import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

export async function POST(req) {
  try {
    const { role, category, numberOfQuestions } = await req.json();

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const prompt = `
      Generate ${numberOfQuestions} realistic and challenging interview questions for the role of ${role}, focusing on ${category} skills.
      Do not provide answers, just the questions.
      Format the output as a plain numbered list, like:
      1. Question one?
      2. Question two?
      3. Question three?
      ...
    `;

    const result = await model.generateContent({
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      generationConfig: {
        temperature: 0.9,
        topK: 40,
        topP: 0.95,
        maxOutputTokens: 2048,
      },
    });

    const response = result.response;
    const text = response.text().trim();

    const lines = text.split("\n").filter(line => line.trim() !== "");
    const questions = lines.map(line => line.replace(/^\d+\.\s*/, "").trim());

    return NextResponse.json({ questions });
  } catch (error) {
    console.error("Mock Interview Generation Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
