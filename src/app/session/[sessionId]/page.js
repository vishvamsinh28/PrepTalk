import { connectDB } from "@/lib/db";
import Session from "@/models/Session";
import { cookies } from "next/headers";
import { jwtVerify } from "jose";
import ChatRoom from "@/app/components/ChatRoom";
import VideoRoom from "@/app/components/VideoRoom";
import FeedbackForm from "@/app/components/FeedbackForm";
import { FaComments, FaExclamationTriangle } from "react-icons/fa";

export default async function SessionRoom(props) {
  const { sessionId } = await props.params;

  await connectDB();

  const session = await Session.findById(sessionId);

  if (!session) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900 text-gray-100 relative px-4">
        <div className="absolute inset-0 bg-[url('/images/pattern.svg')] bg-repeat opacity-5"></div>
        <div className="bg-red-500/10 border border-red-500/50 text-red-400 p-6 rounded-lg text-center max-w-md">
          <FaExclamationTriangle className="text-4xl mb-3 mx-auto" />
          <p className="text-lg font-medium">Session not found ❌</p>
          <p className="text-sm text-gray-400">Please check the session ID and try again.</p>
        </div>
      </div>
    );
  }

  const cookieStore = cookies();
  const token = cookieStore.get("prepTalkToken")?.value;

  let userEmail = "Unknown";
  let userRole = "Unknown";

  if (token) {
    try {
      const secret = new TextEncoder().encode(process.env.JWT_SECRET);
      const { payload } = await jwtVerify(token, secret);
      userEmail = payload.email;
      userRole = payload.role;
    } catch (error) {
      console.error("Token error:", error);
    }
  }

  return (
    <div className="min-h-screen text-center bg-gray-900 text-gray-100 relative px-4 py-10">
      {/* Background pattern */}
      <div className="absolute inset-0 bg-[url('/images/pattern.svg')] bg-repeat opacity-5 z-0"></div>

      {/* Container */}
      <div className="relative z-10 max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="bg-sky-500/20 p-3 rounded-full inline-flex mb-4">
            <FaComments className="text-3xl text-sky-300" />
          </div>
          <h1 className="text-4xl font-bold text-sky-300 mb-2">{session.title} 💬</h1>
          <p className="text-gray-400 text-sm mb-2">{session.description}</p>
          <p className="text-gray-500 text-xs">
            Created by: <strong className="text-sky-300">{session.createdBy}</strong>
          </p>
        </div>

        {/* Video + Chat layout */}
        <div className="flex flex-col md:flex-row gap-8 justify-between">
          {/* Video Room */}
          <div className="md:w-2/3 bg-gray-800 p-4 rounded-lg shadow-lg">
            <h2 className="text-xl font-bold text-sky-300 mb-4">Video Discussion 🎥</h2>
            <VideoRoom sessionId={sessionId} userEmail={userEmail} />
          </div>

          {/* Chat Room */}
          <div className="md:w-1/3 bg-gray-800 p-4 rounded-lg shadow-lg">
            <h2 className="text-xl font-bold text-sky-300 mb-4">Live Chat 💬</h2>
            <ChatRoom sessionId={sessionId} userEmail={userEmail} />
          </div>
        </div>

        {(userRole === "Evaluator" || userRole === "Moderator") && (
          <div className="mt-16 bg-gray-800 p-6 rounded-lg shadow-lg">
            <h2 className="text-2xl font-bold text-sky-300 mb-6">Submit Feedback 📝</h2>
            <FeedbackForm sessionId={sessionId} userEmail={userEmail} role={userRole} />
          </div>
        )}
      </div>
    </div>
  );
}
