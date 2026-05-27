import { connectDB } from "@/lib/db";
import Session from "@/models/Session";
import { getCurrentUser } from "@/lib/serverAuth";
import ChatRoom from "@/app/components/ChatRoom";
import VideoRoom from "@/app/components/VideoRoom";
import InterviewScorecard from "@/app/components/InterviewScorecard";
import AuthState from "@/app/components/AuthState";
import { FaComments, FaExclamationTriangle, FaUserTie } from "react-icons/fa";
import SessionTools from "@/app/components/SessionTools";
import SharedWorkspace from "@/app/components/SharedWorkspace";

export default async function SessionRoom(props) {
  const { sessionId } = await props.params;
  const searchParams = await props.searchParams;

  await connectDB();

  const session = await Session.findById(sessionId);

  if (!session) {
    return (
      <div className="app-shell relative flex min-h-screen items-center justify-center overflow-hidden px-5">
        <div className="soft-grid absolute inset-0 opacity-60"></div>
        <div className="glass-panel relative z-10 max-w-md rounded-[2rem] p-8 text-center">
          <FaExclamationTriangle className="mx-auto mb-4 text-4xl text-rose-200" />
          <p className="text-xl font-black text-white">Session not found</p>
          <p className="mt-2 text-sm text-slate-300">Please check the session ID and try again.</p>
        </div>
      </div>
    );
  }

  const user = await getCurrentUser();
  if (!user) {
    return <AuthState title="Invalid token." message="Please login again to continue." />;
  }

  const sessionData = JSON.parse(JSON.stringify(session));
  const inviteCode = typeof searchParams?.invite === "string" ? searchParams.invite : "";

  return (
    <div className="app-shell relative min-h-screen overflow-hidden px-5 py-24">
      <div className="soft-grid absolute inset-0 z-0 opacity-60"></div>

      <div className="relative z-10 mx-auto max-w-7xl">
        <div className="mb-8 grid gap-6 lg:grid-cols-[1fr_auto] lg:items-end">
          <div>
            <div className="mb-5 inline-grid h-14 w-14 place-items-center rounded-3xl bg-gradient-to-br from-rose-400 via-amber-300 to-cyan-300 shadow-lg shadow-cyan-500/20">
              <FaComments className="text-xl text-slate-950" />
            </div>
            <h1 className="text-4xl font-black leading-tight tracking-tight text-white sm:text-5xl">{session.title}</h1>
            <p className="mt-3 max-w-3xl text-base leading-7 text-slate-300">{session.description}</p>
          </div>
          <div className="glass-panel rounded-3xl p-5 text-left lg:min-w-80">
            <p className="mb-3 flex items-center gap-2 text-sm font-bold text-cyan-100">
              <FaUserTie />
              Created by
            </p>
            <p className="break-all text-sm text-slate-300">{session.createdBy}</p>
          </div>
        </div>

        <div className="mb-8 flex flex-wrap gap-2">
          <span className="rounded-xl border border-cyan-300/25 bg-cyan-300/10 px-3 py-1 text-xs font-bold text-cyan-100">{session.role || "General"}</span>
          <span className="rounded-xl border border-white/10 bg-white/10 px-3 py-1 text-xs text-slate-200">{session.level || "Entry"}</span>
          <span className="rounded-xl border border-white/10 bg-white/10 px-3 py-1 text-xs text-slate-200">{session.interviewType || "Mixed"}</span>
          {session.skills?.map((skill) => (
            <span key={skill} className="rounded-xl border border-white/10 bg-slate-950/35 px-3 py-1 text-xs text-slate-300">{skill}</span>
          ))}
        </div>

        <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_390px]">
          <section className="glass-panel rounded-[2rem] p-4 sm:p-5">
            <div className="mb-4 flex items-center justify-between gap-4 px-1">
              <div>
                <p className="text-sm font-bold uppercase tracking-[0.18em] text-cyan-200">Live room</p>
                <h2 className="text-2xl font-black text-white">Video Interview</h2>
              </div>
              <span className="rounded-xl border border-emerald-300/25 bg-emerald-300/10 px-3 py-1 text-xs font-bold text-emerald-100">
                In session
              </span>
            </div>
            <VideoRoom sessionId={sessionId} userEmail={user.email} />
          </section>

          <aside className="glass-panel rounded-[2rem] p-4 sm:p-5">
            <div className="mb-4 px-1">
              <p className="text-sm font-bold uppercase tracking-[0.18em] text-rose-200">Conversation</p>
              <h2 className="text-2xl font-black text-white">Live Chat</h2>
            </div>
            <ChatRoom sessionId={sessionId} userEmail={user.email} />
          </aside>
        </div>

        <div className="mt-8">
          <SessionTools sessionId={sessionId} session={sessionData} userRole={user.role} />
        </div>

        <div className="mt-8">
          <SharedWorkspace sessionId={sessionId} inviteCode={inviteCode} />
        </div>

        {user.role === "Interviewer" && (
          <section className="glass-panel mt-8 rounded-[2rem] p-5 sm:p-7">
            <div className="mb-6">
              <p className="text-sm font-bold uppercase tracking-[0.18em] text-amber-200">Feedback</p>
              <h2 className="mt-2 text-3xl font-black text-white">Interview Scorecard</h2>
            </div>
            <InterviewScorecard sessionId={sessionId} session={sessionData} />
          </section>
        )}
      </div>
    </div>
  );
}
