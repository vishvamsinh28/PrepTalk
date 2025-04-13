import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

export async function POST(req) {
  try {
    const { question, answer } = await req.json();

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const prompt = `
      You are an expert interviewer.
      I will give you an interview question and a candidate's answer.
      Provide a short evaluation of the answer. Mention:
      - If the answer is correct, partially correct, or incorrect
      - Any improvements or suggestions

      Format your response as plain text, 2-3 lines.

      Question: ${question}
      Candidate's Answer: ${answer}
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
    const feedback = response.text().trim();

    return NextResponse.json({ feedback });
  } catch (error) {
    console.error("Evaluate Answer Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
