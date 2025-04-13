import { connectDB } from "@/lib/db";
import Question from "@/models/Question";
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { jwtVerify } from "jose";

export async function POST(req) {
  try {
    const { category, question } = await req.json();

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

    const newQuestion = new Question({
      userEmail,
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
