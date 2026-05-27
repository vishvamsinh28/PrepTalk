import { getCurrentUser } from "@/lib/serverAuth";
import SessionList from "../components/SessionList";
import AuthState from "../components/AuthState";
import { FaUserCheck } from "react-icons/fa";

export default async function EvaluatorPage() {
  const userData = await getCurrentUser();

  if (!userData) {
    return <AuthState title="Invalid token." message="Please login again to continue." />;
  }

  if (userData.role !== "Evaluator") {
    return <AuthState title="Access denied." message="This page is restricted to Evaluators only." />;
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

        <SessionList />
      </div>
    </div>
  );
}
