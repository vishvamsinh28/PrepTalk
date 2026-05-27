import { connectDB } from "@/lib/db";
import Session from "@/models/Session";
import Message from "@/models/Message";
import Feedback from "@/models/Feedback";
import { getAuthPayloadFromRequest } from "@/lib/auth";
import { json } from "@/lib/api";

export async function GET(req) {
  try {
    const payload = await getAuthPayloadFromRequest(req);
    if (!payload) {
      return json({ message: "Unauthorized" }, 401);
    }

    if (payload.role !== "Interviewer") {
      return json({ message: "Only interviewers can view analytics" }, 403);
    }

    await connectDB();

    const sessionCount = await Session.countDocuments();
    const messageCount = await Message.countDocuments();
    const feedbackCount = await Feedback.countDocuments();

    const feedbacks = await Feedback.find();
    const averageRating =
      feedbacks.reduce((acc, feedback) => acc + feedback.rating, 0) / (feedbacks.length || 1);

    return json({
      sessionCount,
      messageCount,
      feedbackCount,
      averageRating: averageRating.toFixed(2),
    });
  } catch (error) {
    console.error(error);
    return json({ message: "Analytics fetch failed", error: error.message }, 500);
  }
}
