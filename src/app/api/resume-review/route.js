import { generateGeminiContent } from "@/lib/gemini";
import { NextResponse } from "next/server";

export async function POST(req) {
  const formData = await req.json();

  const { fullName, summary, experience, skills, education, certifications, jobRole } = formData;

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
    const text = await generateGeminiContent(prompt);

    return NextResponse.json({ feedback: text });
  } catch (error) {
    console.error("Resume Review Error:", error);
    return NextResponse.json({ feedback: "Error analyzing resume. Please try again." }, { status: 500 });
  }
}
