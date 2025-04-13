import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";

export async function POST(req) {
  const formData = await req.json();

  const { fullName, summary, experience, skills, education, certifications, jobRole } = formData;

  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  const model = genAI.getGenerativeModel({ model: "models/gemini-1.5-flash" });

  const prompt = `
You are an expert resume reviewer and career coach.

Analyze the following candidate's resume details and provide:
1. Summary of strengths.
2. Areas for improvement.
3. ATS compatibility score (out of 100).
4. Suggested keywords for ${jobRole}.
5. Friendly, encouraging overall advice.

Resume Details:
- Full Name: ${fullName}
- Professional Summary: ${summary}
- Work Experience: ${experience}
- Skills: ${skills}
- Education: ${education}
- Certifications: ${certifications}
- Target Job Role: ${jobRole}
`;

  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text().trim();

    return NextResponse.json({ feedback: text });
  } catch (error) {
    console.error("Resume Review Error:", error);
    return NextResponse.json({ feedback: "Error analyzing resume. Please try again." }, { status: 500 });
  }
}
