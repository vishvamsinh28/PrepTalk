import jwt from "jsonwebtoken";
import { cookies } from "next/headers";

export default async function DashboardPage() {
  const cookieStore = cookies();
  const token = cookieStore.get("prepTalkToken")?.value;

  let userData;

  try {
    userData = jwt.verify(token, process.env.JWT_SECRET);
  } catch (error) {
    console.error("Token verification failed:", error);
    return (
      <div className="flex min-h-screen justify-center items-center">
        <h2 className="text-xl text-red-500">Invalid or expired token. Please login again.</h2>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen justify-center items-center flex-col bg-gray-100">
      <h1 className="text-3xl font-bold mb-4">Welcome to PrepTalk 🚀</h1>
      <p className="text-xl">Hello, <strong>{userData?.email}</strong>!</p>
      <p className="text-lg mt-2">Your role: <span className="font-semibold">{userData?.role}</span></p>

      <div className="mt-6 space-x-4">
        <a href="/moderator" className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition">Moderator Panel</a>
        <a href="/participant" className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 transition">Participant Panel</a>
        <a href="/evaluator" className="bg-yellow-500 text-white px-4 py-2 rounded hover:bg-yellow-600 transition">Evaluator Panel</a>
      </div>
    </div>
  );
}
