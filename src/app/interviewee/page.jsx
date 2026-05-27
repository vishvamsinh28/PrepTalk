import { getCurrentUser } from "@/lib/serverAuth";
import IntervieweeSessionList from "../components/IntervieweeSessionList";
import ReportList from "../components/ReportList";
import AuthState from "../components/AuthState";

export default async function IntervieweePage() {
  const userData = await getCurrentUser();

  if (!userData) {
    return <AuthState title="Invalid token." message="Please login again to continue." />;
  }

  if (userData.role !== "Interviewee") {
    return <AuthState title="Access denied." message="This page is restricted to Interviewees only." />;
  }

  return (
    <div className="app-shell relative min-h-screen overflow-hidden px-5 pb-20 pt-28">
      <div className="soft-grid absolute inset-0 z-0 opacity-60"></div>

      <div className="relative z-10 mx-auto max-w-7xl">
        <div className="mb-10 grid gap-5 lg:grid-cols-[1fr_auto] lg:items-end">
          <div>
            <p className="mb-2 text-xs font-bold uppercase tracking-[0.2em] text-cyan-200">Interviewee workspace</p>
            <h1 className="text-5xl font-black tracking-tight gradient-text">Your practice room</h1>
            <p className="mt-3 max-w-2xl text-slate-300">Join assigned sessions, review prep guidance, and track your feedback history.</p>
          </div>
          <div className="glass-panel rounded-2xl p-4 text-sm text-slate-300">
            <span className="block text-xs font-bold uppercase tracking-[0.18em] text-amber-200">Signed in as</span>
            <span className="mt-1 block break-all text-white">{userData.email}</span>
          </div>
        </div>

        <section>
          <div className="mb-5">
            <p className="text-sm font-bold uppercase tracking-[0.18em] text-cyan-200">Assigned</p>
            <h2 className="text-3xl font-black tracking-tight text-white">Your Sessions</h2>
          </div>
          <IntervieweeSessionList />
        </section>

        <section className="mt-14">
          <div className="mb-5">
            <p className="text-sm font-bold uppercase tracking-[0.18em] text-amber-200">Feedback</p>
            <h2 className="text-3xl font-black tracking-tight text-white">Your Reports</h2>
          </div>
          <ReportList />
        </section>
      </div>
    </div>
  );
}
