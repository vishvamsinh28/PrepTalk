import { connectDB } from "@/lib/db";
import Question from "@/models/Question";
import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/serverAuth";

export async function POST(req) {
  try {
    const { category, question } = await req.json();

    await connectDB();

    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const newQuestion = new Question({
      userEmail: user.email,
      category,
      question,
    });

    await newQuestion.save();

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error saving question:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
