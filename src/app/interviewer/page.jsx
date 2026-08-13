import { getCurrentUser } from "@/lib/serverAuth";
import CreateSessionForm from "../components/CreateSessionForm";
import SessionList from "../components/SessionList";
import ReportList from "../components/ReportList";
import AuthState from "../components/AuthState";

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
            <p className="mb-2 text-xs font-bold uppercase tracking-[0.2em] text-accent">Interviewer workspace</p>
            <h1 className="text-4xl font-semibold tracking-tight gradient-text sm:text-5xl">Run better interviews</h1>
            <p className="mt-3 max-w-2xl text-ink-soft">Create sessions, send invites, generate AI questions, and review reports from one focused workspace.</p>
            <div className="mt-4 inline-flex max-w-full items-center gap-2 rounded-lg border border-rule bg-white px-3 py-2 text-sm text-ink-soft">
              <span className="shrink-0 text-xs font-bold uppercase tracking-[0.16em] text-amber-700">Signed in</span>
              <span className="min-w-0 truncate text-ink">{userData.email}</span>
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
                <p className="text-sm font-bold uppercase tracking-[0.18em] text-accent">Manage</p>
                <h2 className="text-3xl font-semibold tracking-tight text-ink">Your Sessions</h2>
              </div>
            </div>
            <SessionList compact />
          </section>
        </div>

        <section id="reports" className="mt-14">
          <div className="mb-5">
            <p className="text-sm font-bold uppercase tracking-[0.18em] text-amber-700">Review</p>
            <h2 className="text-3xl font-semibold tracking-tight text-ink">Submitted Reports</h2>
          </div>
          <ReportList />
        </section>
      </div>
    </div>
  );
}
