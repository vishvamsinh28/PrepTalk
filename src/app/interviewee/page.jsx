import { getCurrentUser } from "@/lib/serverAuth";
import IntervieweeSessionList from "../components/IntervieweeSessionList";
import ReportList from "../components/ReportList";
import AuthState from "../components/AuthState";
import { FaUserFriends } from "react-icons/fa";

export default async function IntervieweePage() {
  const userData = await getCurrentUser();

  if (!userData) {
    return <AuthState title="Invalid token." message="Please login again to continue." />;
  }

  if (userData.role !== "Interviewee") {
    return <AuthState title="Access denied." message="This page is restricted to Interviewees only." />;
  }

  return (
    <div className="app-shell relative min-h-screen overflow-hidden px-5 py-24">
      <div className="soft-grid absolute inset-0 z-0 opacity-60"></div>

      <div className="relative z-10 mx-auto max-w-6xl">
        <div className="mb-12 text-center">
          <div className="mb-5 inline-grid h-16 w-16 place-items-center rounded-3xl bg-gradient-to-br from-emerald-300 via-cyan-300 to-rose-300 shadow-lg shadow-cyan-500/20">
            <FaUserFriends className="text-2xl text-slate-950" />
          </div>
          <h1 className="mb-3 text-5xl font-black tracking-tight gradient-text">Interviewee Panel</h1>
          <p className="text-slate-300">Welcome, {userData.email}</p>
          <p className="mt-3 text-xs font-bold uppercase tracking-[0.2em] text-cyan-200">Interviewee workspace</p>
        </div>

        {/* Session List */}
        <div>
          <h2 className="mb-6 text-center text-3xl font-black tracking-tight text-white">Your Sessions</h2>
          <IntervieweeSessionList />
        </div>

        <div className="mt-16">
          <h2 className="mb-6 text-center text-3xl font-black tracking-tight text-white">Your Reports</h2>
          <ReportList />
        </div>
      </div>
    </div>
  );
}
