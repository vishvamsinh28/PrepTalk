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
    <div className="app-shell relative min-h-screen overflow-hidden px-5 pb-16 pt-24">
      <div className="soft-grid absolute inset-0 z-0 opacity-60"></div>

      <div className="relative z-10 mx-auto max-w-7xl">
        <div className="mb-8">
          <div>
            <div className="mb-4 inline-grid h-12 w-12 place-items-center rounded-xl bg-gradient-to-br from-cyan-300 via-emerald-300 to-blue-400 shadow-lg shadow-cyan-500/20">
              <FaMicrophoneAlt className="text-xl text-slate-950" />
            </div>
            <p className="mb-2 text-xs font-bold uppercase tracking-[0.2em] text-cyan-200">Interviewer workspace</p>
            <h1 className="text-4xl font-black tracking-tight gradient-text sm:text-5xl">Run better interviews</h1>
            <p className="mt-3 max-w-2xl text-slate-300">Create sessions, send invites, generate AI questions, and review reports from one focused workspace.</p>
            <div className="mt-4 inline-flex max-w-full items-center gap-2 rounded-lg border border-white/10 bg-slate-950/35 px-3 py-2 text-sm text-slate-300">
              <span className="shrink-0 text-xs font-bold uppercase tracking-[0.16em] text-amber-200">Signed in</span>
              <span className="min-w-0 truncate text-white">{userData.email}</span>
            </div>
          </div>
        </div>

        <div className="grid gap-6 xl:grid-cols-[minmax(0,1.05fr)_minmax(22rem,0.75fr)] xl:items-start">
          <section id="create-session">
            <CreateSessionForm />
          </section>

          <section id="sessions" className="xl:sticky xl:top-24">
            <div className="mb-5 flex items-end justify-between gap-4">
              <div>
                <p className="text-sm font-bold uppercase tracking-[0.18em] text-cyan-200">Manage</p>
                <h2 className="text-3xl font-black tracking-tight text-white">Your Sessions</h2>
              </div>
            </div>
            <SessionList compact />
          </section>
        </div>

        <section id="reports" className="mt-14">
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
