import { connectDB } from "@/lib/db";
import Feedback from "@/models/Feedback";
import Session from "@/models/Session";
import FeedbackClient from "../components/FeedbackClient";

export const dynamic = "force-dynamic";

export default async function FeedbackPage() {
  await connectDB();

  const feedbacks = await Feedback.find({}).sort({ createdAt: -1 });

  const sessionIds = feedbacks.map(fb => fb.sessionId.toString());

  const sessions = await Session.find({ _id: { $in: sessionIds } });

  const sessionMap = {};
  sessions.forEach(session => {
    sessionMap[session._id.toString()] = session;
  });

  return (
    <FeedbackClient feedbacks={JSON.parse(JSON.stringify(feedbacks))} sessions={JSON.parse(JSON.stringify(sessionMap))} />
  );
}
