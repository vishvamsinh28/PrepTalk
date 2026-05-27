import { connectDB } from "@/lib/db";
import Session from "@/models/Session";
import { getCurrentUser } from "@/lib/serverAuth";
import ChatRoom from "@/app/components/ChatRoom";
import VideoRoom from "@/app/components/VideoRoom";
import InterviewScorecard from "@/app/components/InterviewScorecard";
import AuthState from "@/app/components/AuthState";
import { FaExclamationTriangle, FaUserTie } from "react-icons/fa";
import SessionTools from "@/app/components/SessionTools";
import SharedWorkspace from "@/app/components/SharedWorkspace";
import { isValidObjectId, userCanAccessSession } from "@/lib/sessionAccess";

export default async function SessionRoom(props) {
  const { sessionId } = await props.params;
  const searchParams = await props.searchParams;

  await connectDB();

  if (!isValidObjectId(sessionId)) {
    return (
      <div className="app-shell relative flex min-h-screen items-center justify-center overflow-hidden px-5">
        <div className="soft-grid absolute inset-0 opacity-60"></div>
        <div className="glass-panel relative z-10 max-w-md rounded-2xl p-8 text-center">
          <FaExclamationTriangle className="mx-auto mb-4 text-4xl text-amber-200" />
          <p className="text-xl font-black text-white">Session not found</p>
          <p className="mt-2 text-sm text-slate-300">Please check the session ID and try again.</p>
        </div>
      </div>
    );
  }

  const session = await Session.findById(sessionId);

  if (!session) {
    return (
      <div className="app-shell relative flex min-h-screen items-center justify-center overflow-hidden px-5">
        <div className="soft-grid absolute inset-0 opacity-60"></div>
        <div className="glass-panel relative z-10 max-w-md rounded-2xl p-8 text-center">
          <FaExclamationTriangle className="mx-auto mb-4 text-4xl text-amber-200" />
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

  if (!userCanAccessSession(session, user, inviteCode)) {
    return <AuthState title="Access denied." message="You do not have access to this session." />;
  }

  return (
    <div className="app-shell relative min-h-screen overflow-hidden px-5 pb-16 pt-24">
      <div className="soft-grid absolute inset-0 z-0 opacity-60"></div>

      <div className="relative z-10 mx-auto max-w-7xl">
        <section className="glass-panel mb-5 rounded-xl p-5 sm:p-6">
          <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center">
            <div className="min-w-0">
              <h1 className="text-4xl font-black leading-tight tracking-tight text-white">{session.title}</h1>
              <p className="mt-3 max-w-3xl text-base leading-7 text-slate-300">{session.description}</p>
              <div className="mt-4 flex flex-wrap gap-2">
                <span className="rounded-lg border border-cyan-300/25 bg-cyan-300/10 px-3 py-1 text-xs font-bold text-cyan-100">{session.role || "General"}</span>
                <span className="rounded-lg border border-white/10 bg-white/10 px-3 py-1 text-xs text-slate-200">{session.level || "Entry"}</span>
                <span className="rounded-lg border border-white/10 bg-white/10 px-3 py-1 text-xs text-slate-200">{session.interviewType || "Mixed"}</span>
                {session.skills?.map((skill) => (
                  <span key={skill} className="rounded-lg border border-white/10 bg-slate-950/35 px-3 py-1 text-xs text-slate-300">{skill}</span>
                ))}
              </div>
            </div>
            <div className="grid gap-3 rounded-lg border border-white/10 bg-slate-950/35 p-4 text-sm text-slate-300 lg:min-w-80">
              <p className="flex items-center gap-2 font-bold text-cyan-100">
                <FaUserTie />
                Created by
              </p>
              <p className="break-all">{session.createdBy}</p>
              <div className="h-px bg-white/10" />
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-emerald-200">Room ready</p>
            </div>
          </div>
        </section>

        <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_360px]">
          <section className="glass-panel rounded-xl p-4">
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

          <aside className="glass-panel rounded-xl p-4">
            <div className="mb-4 px-1">
              <p className="text-sm font-bold uppercase tracking-[0.18em] text-amber-200">Conversation</p>
              <h2 className="text-2xl font-black text-white">Live Chat</h2>
            </div>
            <ChatRoom sessionId={sessionId} userEmail={user.email} inviteCode={inviteCode} />
          </aside>
        </div>

        <div className="mt-8">
          <SessionTools sessionId={sessionId} session={sessionData} userRole={user.role} />
        </div>

        <div className="mt-8">
          <SharedWorkspace sessionId={sessionId} inviteCode={inviteCode} />
        </div>

        {user.role === "Interviewer" && (
          <section className="glass-panel mt-8 rounded-2xl p-5 sm:p-7">
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
