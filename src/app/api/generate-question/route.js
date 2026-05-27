import { NextResponse } from "next/server";
import { generateGeminiContent } from "@/lib/gemini";

export async function POST(req) {
  const { category, role } = await req.json();

  const prompt = `
  Generate one challenging interview question for the role of ${role}, focusing on ${category} skills.
  Make the question realistic and suitable for a job interview scenario.

  Format the response as plain text only, no explanations.
`;

  try {
    const text = await generateGeminiContent(prompt);

    return NextResponse.json({ question: text });
  } catch (error) {
    console.error("Gemini API Error:", error);
    return NextResponse.json({ question: "Error generating question." }, { status: 500 });
  }
}
