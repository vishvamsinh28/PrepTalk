import { cookies } from "next/headers";
import { jwtVerify } from "jose";
import SessionList from "../components/SessionList";
import { FaUserCheck, FaExclamationTriangle } from "react-icons/fa";

export default async function EvaluatorPage() {
  const cookieStore = cookies();
  const token = cookieStore.get("prepTalkToken")?.value;

  if (!token) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900 text-gray-100 relative px-4">
        <div className="absolute inset-0 bg-[url('/images/pattern.svg')] bg-repeat opacity-5"></div>
        <div className="bg-red-500/10 border border-red-500/50 text-red-400 p-6 rounded-lg text-center max-w-md">
          <FaExclamationTriangle className="text-4xl mb-3 mx-auto" />
          <p className="text-lg font-medium">No token found.</p>
          <p className="text-sm text-gray-400">Please login to access the Evaluator panel.</p>
        </div>
      </div>
    );
  }

  let userData;

  try {
    const secret = new TextEncoder().encode(process.env.JWT_SECRET);
    const { payload } = await jwtVerify(token, secret);
    userData = payload;
  } catch (error) {
    console.error("Token verification failed:", error);
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900 text-gray-100 relative px-4">
        <div className="absolute inset-0 bg-[url('/images/pattern.svg')] bg-repeat opacity-5"></div>
        <div className="bg-red-500/10 border border-red-500/50 text-red-400 p-6 rounded-lg text-center max-w-md">
          <FaExclamationTriangle className="text-4xl mb-3 mx-auto" />
          <p className="text-lg font-medium">Invalid token.</p>
          <p className="text-sm text-gray-400">Please login again to continue.</p>
        </div>
      </div>
    );
  }

  if (userData.role !== "Evaluator") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900 text-gray-100 relative px-4">
        <div className="absolute inset-0 bg-[url('/images/pattern.svg')] bg-repeat opacity-5"></div>
        <div className="bg-red-500/10 border border-red-500/50 text-red-400 p-6 rounded-lg text-center max-w-md">
          <FaExclamationTriangle className="text-4xl mb-3 mx-auto" />
          <p className="text-lg font-medium">Access Denied.</p>
          <p className="text-sm text-gray-400">This page is restricted to Evaluators only.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 relative px-4 py-10">
      {/* Background pattern */}
      <div className="absolute inset-0 bg-[url('/images/pattern.svg')] bg-repeat opacity-5 z-0"></div>

      {/* Container */}
      <div className="relative z-10 max-w-5xl mx-auto">
        {/* Header */}
        <div className="text-center mb-10">
          <div className="bg-sky-500/20 p-3 rounded-full inline-flex mb-4">
            <FaUserCheck className="text-3xl text-sky-300" />
          </div>
          <h1 className="text-4xl font-bold text-sky-300 mb-2">Evaluator Panel 📝</h1>
          <p className="text-gray-400 text-sm mb-4">Welcome, {userData.email}!</p>
          <p className="text-gray-500 text-xs">Your role: <strong className="text-sky-300">{userData.role}</strong></p>
        </div>

        {/* Session list component (already premium from earlier) */}
        <SessionList />
      </div>
    </div>
  );
}
