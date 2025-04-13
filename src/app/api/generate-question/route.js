import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

export async function POST(req) {
  const { category, role } = await req.json();

  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

  const prompt = `
  Generate one challenging interview question for the role of ${role}, focusing on ${category} skills.
  Make the question realistic and suitable for a job interview scenario.

  Format the response as plain text only, no explanations.
`;

  try {
    const result = await model.generateContent(prompt);
    const response = result.response;
    const text = response.text().trim();

    return NextResponse.json({ question: text });
  } catch (error) {
    console.error("Gemini API Error:", error);
    return NextResponse.json({ question: "Error generating question." }, { status: 500 });
  }
}
