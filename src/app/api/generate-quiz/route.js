import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

export async function POST(req) {
  try {
    const { category, numberOfQuestions } = await req.json();

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const prompt = `
      Generate ${numberOfQuestions} multiple choice quiz questions on the topic of ${category}.
      For each question, provide:
      - The question text
      - Four options (A, B, C, D)
      - Indicate which option is the correct answer

      Format the response as a pure JSON array only, no markdown, no explanation, no prefixes, no suffixes, just plain JSON like:
      [
        {
          "question": "What is AI?",
          "options": ["Option A", "Option B", "Option C", "Option D"],
          "answer": "Option A"
        },
        ...
      ]
    `;

    const result = await model.generateContent(prompt);
    const response = result.response;
    let rawText = response.text().trim();

    if (rawText.startsWith("```")) {
      rawText = rawText.replace(/^```.*\n/, "").replace(/\n```$/, "");
    }

    const jsonStart = rawText.indexOf("[");
    const jsonEnd = rawText.lastIndexOf("]") + 1;
    const jsonString = rawText.substring(jsonStart, jsonEnd);

    let quiz;
    try {
      quiz = JSON.parse(jsonString);
    } catch (parseError) {
      console.error("Parsing error:", parseError);
      console.error("Gemini response:", rawText);
      return NextResponse.json({ error: "Failed to parse AI response." }, { status: 500 });
    }

    return NextResponse.json({ quiz });
  } catch (error) {
    console.error("Generate Quiz API Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
