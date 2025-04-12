import { connectDB } from "@/lib/db";
import Feedback from "@/models/Feedback";
import Session from "@/models/Session";

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
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">All Feedbacks 📝</h1>

      {feedbacks.length === 0 ? (
        <p>No feedback submitted yet.</p>
      ) : (
        <div className="space-y-4">
          {feedbacks.map((fb) => {
            const session = sessionMap[fb.sessionId.toString()];

            return (
              <div key={fb._id.toString()} className="p-4 border rounded shadow bg-white">
                <p><strong>Session:</strong> {session ? session.title : "Unknown Session"}</p>
                <p><strong>Topic:</strong> {session ? session.topic : "Unknown Topic"}</p>
                <p><strong>By:</strong> {fb.userEmail} ({fb.role})</p>
                <p><strong>Rating:</strong> {fb.rating} / 5</p>
                <p><strong>Comments:</strong> {fb.comments || "No comments"}</p>
                <p className="text-gray-500 text-sm">Date: {new Date(fb.createdAt).toLocaleString()}</p>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
