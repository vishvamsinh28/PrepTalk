import { getCurrentUser } from "@/lib/serverAuth";
import CreateSessionForm from "../components/CreateSessionForm";
import SessionList from "../components/SessionList";
import ReportList from "../components/ReportList";
import AuthState from "../components/AuthState";
import { FaMicrophoneAlt } from "react-icons/fa";

export default async function InterviewerPage() {
  const userData = await getCurrentUser();

  if (!userData) {
    return <AuthState title="Invalid token." message="Please login again to continue." />;
  }

  if (userData.role !== "Interviewer") {
    return <AuthState title="Access denied." message="This page is restricted to Interviewers only." />;
  }

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 relative px-4 py-10">
      {/* Background pattern */}
      <div className="absolute inset-0 bg-[url('/images/pattern.svg')] bg-repeat opacity-5 z-0"></div>

      {/* Container */}
      <div className="relative z-10 max-w-5xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="bg-sky-500/20 p-3 rounded-full inline-flex mb-4">
            <FaMicrophoneAlt className="text-3xl text-sky-300" />
          </div>
          <h1 className="text-4xl font-bold text-sky-300 mb-2">Interviewer Panel</h1>
          <p className="text-gray-400 text-sm mb-4">Welcome, {userData.email}!</p>
          <p className="text-gray-500 text-xs">Your role: <strong className="text-sky-300">Interviewer</strong></p>
        </div>

        <div className="mb-16">
          <CreateSessionForm />
        </div>

        {/* Session list */}
        <div>
          <h2 className="text-2xl text-center font-bold text-sky-300 mb-6">Your Sessions</h2>
          <SessionList />
        </div>

        <div className="mt-16">
          <h2 className="text-2xl text-center font-bold text-sky-300 mb-6">Submitted Reports</h2>
          <ReportList />
        </div>
      </div>
    </div>
  );
}
