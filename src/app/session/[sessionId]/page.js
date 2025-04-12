import { connectDB } from "@/lib/db";
import Session from "@/models/Session";
import { cookies } from "next/headers";
import { jwtVerify } from "jose";
import ChatRoom from "@/app/components/ChatRoom";

export default async function SessionRoom({ params }) {
  const { sessionId } = params;

  await connectDB();

  const session = await Session.findById(sessionId);

  if (!session) {
    return (
      <div className="flex min-h-screen justify-center items-center">
        <h2 className="text-xl text-red-500">Session not found ❌</h2>
      </div>
    );
  }

  const cookieStore = cookies();
  const token = cookieStore.get("prepTalkToken")?.value;

  let userEmail = "Unknown";

  if (token) {
    try {
      const secret = new TextEncoder().encode(process.env.JWT_SECRET);
      const { payload } = await jwtVerify(token, secret);
      userEmail = payload.email;
    } catch (error) {
      console.error("Token error:", error);
    }
  }

  return (
    <div className="flex min-h-screen justify-center items-center flex-col bg-gray-100 p-4">
      <h1 className="text-3xl font-bold mb-2">{session.title} 💬</h1>
      <p className="text-gray-600 mb-4">{session.description}</p>
      <p className="text-sm text-gray-500">Created by: {session.createdBy}</p>

      <ChatRoom sessionId={sessionId} userEmail={userEmail} />
    </div>
  );
}
