import { connectDB } from "@/lib/db";
import QuizResult from "@/models/QuizResult";
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { jwtVerify } from "jose";

export async function GET() {
  try {
    await connectDB();

    // Get user email from token
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

    const results = await QuizResult.find({ userEmail }).sort({ date: -1 });

    return NextResponse.json({ results });
  } catch (error) {
    console.error("Error fetching quiz results:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
