import { connectDB } from "@/lib/db";
import InterviewResult from "@/models/InterviewResult";
import { cookies } from "next/headers";
import { jwtVerify } from "jose";
import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

export async function POST(req) {
  try {
    const { questions, answers, role } = await req.json();

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

      Interview Transcript:
      ${qaPairs}
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

    const cookieStore = cookies();
    const token = cookieStore.get("prepTalkToken")?.value;

    let userEmail = "Unknown";
    if (token) {
      try {
        const secret = new TextEncoder().encode(process.env.JWT_SECRET);
        const { payload } = await jwtVerify(token, secret);
        userEmail = payload.email;
      } catch (error) {
        console.error("Token verification failed:", error);
      }
    }

    await connectDB();
    const interviewResult = new InterviewResult({
      userEmail,
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
