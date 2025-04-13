import { connectDB } from "@/lib/db";
import QuizResult from "@/models/QuizResult";
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { jwtVerify } from "jose";

export async function POST(req) {
  try {
    const { totalQuestions, score } = await req.json();

    await connectDB();

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

    const quizResult = new QuizResult({
      userEmail,
      totalQuestions,
      score,
    });

    await quizResult.save();

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error saving quiz result:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
