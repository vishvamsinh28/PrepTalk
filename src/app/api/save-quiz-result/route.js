import { connectDB } from "@/lib/db";
import QuizResult from "@/models/QuizResult";
import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/serverAuth";

export async function POST(req) {
  try {
    const { totalQuestions, score } = await req.json();

    await connectDB();

    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const quizResult = new QuizResult({
      userEmail: user.email,
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
