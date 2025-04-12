import { connectDB } from "@/lib/db";
import Session from "@/models/Session";
import Message from "@/models/Message";
import Feedback from "@/models/Feedback";
import { jwtVerify } from "jose";

export async function GET(req) {
  try {
    const token = req.cookies.get("prepTalkToken")?.value;

    if (!token) {
      return new Response(JSON.stringify({ message: "Unauthorized" }), { status: 401 });
    }

    const secret = new TextEncoder().encode(process.env.JWT_SECRET);
    const { payload } = await jwtVerify(token, secret);

    if (payload.role !== "Moderator") {
      return new Response(JSON.stringify({ message: "Only moderators can view analytics" }), { status: 403 });
    }

    await connectDB();

    const sessionCount = await Session.countDocuments();
    const messageCount = await Message.countDocuments();
    const feedbackCount = await Feedback.countDocuments();

    const feedbacks = await Feedback.find();
    const averageRating =
      feedbacks.reduce((acc, feedback) => acc + feedback.rating, 0) / (feedbacks.length || 1);

    return new Response(
      JSON.stringify({
        sessionCount,
        messageCount,
        feedbackCount,
        averageRating: averageRating.toFixed(2),
      }),
      { status: 200 }
    );
  } catch (error) {
    console.error(error);
    return new Response(JSON.stringify({ message: "Analytics fetch failed", error: error.message }), { status: 500 });
  }
}
