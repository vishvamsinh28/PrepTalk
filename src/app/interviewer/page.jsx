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
    <div className="app-shell relative min-h-screen overflow-hidden px-5 pb-20 pt-28">
      <div className="soft-grid absolute inset-0 z-0 opacity-60"></div>

      <div className="relative z-10 mx-auto max-w-7xl">
        <div className="mb-10 grid gap-5 lg:grid-cols-[1fr_auto] lg:items-end">
          <div>
            <div className="mb-5 inline-grid h-14 w-14 place-items-center rounded-2xl bg-gradient-to-br from-cyan-300 via-emerald-300 to-blue-400 shadow-lg shadow-cyan-500/20">
              <FaMicrophoneAlt className="text-xl text-slate-950" />
            </div>
            <p className="mb-2 text-xs font-bold uppercase tracking-[0.2em] text-cyan-200">Interviewer workspace</p>
            <h1 className="text-5xl font-black tracking-tight gradient-text">Run better interviews</h1>
            <p className="mt-3 max-w-2xl text-slate-300">Create sessions, send invites, generate AI questions, and review reports from one focused workspace.</p>
          </div>
          <div className="glass-panel rounded-2xl p-4 text-sm text-slate-300">
            <span className="block text-xs font-bold uppercase tracking-[0.18em] text-amber-200">Signed in as</span>
            <span className="mt-1 block break-all text-white">{userData.email}</span>
          </div>
        </div>

        <section className="mb-12">
          <CreateSessionForm />
        </section>

        <section>
          <div className="mb-5 flex items-end justify-between gap-4">
            <div>
              <p className="text-sm font-bold uppercase tracking-[0.18em] text-cyan-200">Manage</p>
              <h2 className="text-3xl font-black tracking-tight text-white">Your Sessions</h2>
            </div>
          </div>
          <SessionList />
        </section>

        <section className="mt-14">
          <div className="mb-5">
            <p className="text-sm font-bold uppercase tracking-[0.18em] text-amber-200">Review</p>
            <h2 className="text-3xl font-black tracking-tight text-white">Submitted Reports</h2>
          </div>
          <ReportList />
        </section>
      </div>
    </div>
  );
}
