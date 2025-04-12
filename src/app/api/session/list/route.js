import { connectDB } from "@/lib/db";
import Session from "@/models/Session";

export async function GET() {
  try {
    await connectDB();

    const sessions = await Session.find().sort({ createdAt: -1 });

    return new Response(JSON.stringify({ sessions }), { status: 200 });
  } catch (error) {
    console.error(error);
    return new Response(JSON.stringify({ message: "Failed to fetch sessions", error: error.message }), { status: 500 });
  }
}
