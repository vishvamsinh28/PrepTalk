import { connectDB } from "@/lib/db";
import InterviewResult from "@/models/InterviewResult";
import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/serverAuth";

export async function GET() {
  try {
    await connectDB();

    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const results = await InterviewResult.find({ userEmail: user.email }).sort({ date: -1 });

    return NextResponse.json({ results });
  } catch (error) {
    console.error("Error fetching interview results:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
