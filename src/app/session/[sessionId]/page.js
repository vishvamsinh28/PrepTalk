import { connectDB } from "@/lib/db";
import Session from "@/models/Session";

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

  return (
    <div className="flex min-h-screen justify-center items-center flex-col bg-gray-100">
      <h1 className="text-3xl font-bold mb-4">{session.title} 💬</h1>
      <p className="text-gray-600 mb-2">{session.description}</p>
      <p className="text-sm text-gray-500 mb-6">Created by: {session.createdBy}</p>

      <p className="text-green-600">✅ Ready for discussion and chat!</p>

      {/* Placeholder: Later we'll add chat room here */}
    </div>
  );
}
