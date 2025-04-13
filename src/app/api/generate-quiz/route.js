import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

export async function POST(req) {
    try {
        const { category, numberOfQuestions } = await req.json();

        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

        const randomSeed = Math.floor(Math.random() * 1000);

        const prompt = `
      Generate ${numberOfQuestions} unique multiple choice quiz questions on the topic of ${category}.
      Add variety, avoid repetition, and make each set unique.
      Random seed: ${randomSeed}
    
      Format the response as a pure JSON array only, like:
      [
        {
          "question": "What is AI?",
          "options": ["Option A", "Option B", "Option C", "Option D"],
          "answer": "Option A"
        }
      ]
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
