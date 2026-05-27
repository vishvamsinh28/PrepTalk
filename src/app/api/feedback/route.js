import { connectDB } from "@/lib/db";
import Feedback from "@/models/Feedback";
import { json } from "@/lib/api";

export async function POST(req) {
  try {
    await connectDB();
    const body = await req.json();

    const feedback = new Feedback(body);
    await feedback.save();

    return json({ message: "Feedback submitted successfully!" });
  } catch (error) {
    console.error("Feedback error:", error);
    return json({ error: "Failed to submit feedback." }, 500);
  }
}
