import { connectDB } from "@/lib/db";
import Session from "@/models/Session";
import { json } from "@/lib/api";

export async function GET() {
  try {
    await connectDB();

    const sessions = await Session.find().sort({ createdAt: -1 });

    return json({ sessions });
  } catch (error) {
    console.error(error);
    return json({ message: "Failed to fetch sessions", error: error.message }, 500);
  }
}
