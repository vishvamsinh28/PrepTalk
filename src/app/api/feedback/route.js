import { connectDB } from "@/lib/db";
import Feedback from "@/models/Feedback";

export async function POST(req) {
  try {
    await connectDB();
    const body = await req.json();

    const feedback = new Feedback(body);
    await feedback.save();

    return new Response(JSON.stringify({ message: "Feedback submitted successfully!" }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Feedback error:", error);
    return new Response(JSON.stringify({ error: "Failed to submit feedback." }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
