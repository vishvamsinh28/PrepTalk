import { connectDB } from "@/lib/db";
import Question from "@/models/Question";
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { jwtVerify } from "jose";

export async function GET() {
  try {
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

    const questions = await Question.find({ userEmail }).sort({ createdAt: -1 });

    return NextResponse.json({ questions });
  } catch (error) {
    console.error("Error fetching questions:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
