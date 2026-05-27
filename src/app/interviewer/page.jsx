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
    <div className="app-shell relative min-h-screen overflow-hidden px-5 py-24">
      <div className="soft-grid absolute inset-0 z-0 opacity-60"></div>

      <div className="relative z-10 mx-auto max-w-6xl">
        <div className="mb-12 text-center">
          <div className="mb-5 inline-grid h-16 w-16 place-items-center rounded-3xl bg-gradient-to-br from-rose-400 via-amber-300 to-cyan-300 shadow-lg shadow-cyan-500/20">
            <FaMicrophoneAlt className="text-2xl text-slate-950" />
          </div>
          <h1 className="mb-3 text-5xl font-black tracking-tight gradient-text">Interviewer Panel</h1>
          <p className="text-slate-300">Welcome, {userData.email}</p>
          <p className="mt-3 text-xs font-bold uppercase tracking-[0.2em] text-cyan-200">Interviewer workspace</p>
        </div>

        <div className="mb-16">
          <CreateSessionForm />
        </div>

        {/* Session list */}
        <div>
          <h2 className="mb-6 text-center text-3xl font-black tracking-tight text-white">Your Sessions</h2>
          <SessionList />
        </div>

        <div className="mt-16">
          <h2 className="mb-6 text-center text-3xl font-black tracking-tight text-white">Submitted Reports</h2>
          <ReportList />
        </div>
      </div>
    </div>
  );
}
