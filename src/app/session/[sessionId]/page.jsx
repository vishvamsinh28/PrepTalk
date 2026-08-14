import { connectDB } from "@/lib/db";
import Session from "@/models/Session";
import { getCurrentUser } from "@/lib/serverAuth";
import ChatRoom from "@/app/components/ChatRoom";
import VideoRoom from "@/app/components/VideoRoom";
import InterviewScorecard from "@/app/components/InterviewScorecard";
import AuthState from "@/app/components/AuthState";
import SessionTools from "@/app/components/SessionTools";
import SharedWorkspace from "@/app/components/SharedWorkspace";
import { isValidObjectId, userCanAccessSession } from "@/lib/sessionAccess";

function SessionMissing() {
  return (
    <div className="app-shell flex min-h-screen items-center justify-center px-8">
      <div className="max-w-md text-center">
        <span className="mx-auto block h-0.5 w-10 bg-accent" />
        <p className="app-title mt-8">Session not found.</p>
        <p className="mt-4 text-[15px] leading-[1.7] text-ink-soft">
          Check the session link and try again — it may have been deleted.
        </p>
      </div>
    </div>
  );
}

/**
 * Live interview room: video, chat, session tools, shared workspace,
 * and (for the interviewer) the scorecard. Server-checks access.
 */
export default async function SessionRoom(props) {
  const { sessionId } = await props.params;

  if (!isValidObjectId(sessionId)) {
    return <SessionMissing />;
  }

  const user = await getCurrentUser();
  if (!user) {
    return <AuthState title="Invalid token." message="Please login again to continue." />;
  }

  await connectDB();
  const session = await Session.findById(sessionId);

  if (!session) {
    return <SessionMissing />;
  }

  const sessionData = JSON.parse(JSON.stringify(session));

  if (!userCanAccessSession(session, user)) {
    return <AuthState title="Access denied." message="You do not have access to this session." />;
  }

  return (
    <div className="app-shell min-h-screen px-8 pb-24 pt-28">
      <div className="mx-auto max-w-[84rem]">
        <header className="border-b border-rule pb-8">
          <div className="flex flex-wrap items-end justify-between gap-x-10 gap-y-5">
            <div className="min-w-0">
              <p className="app-eyebrow">Interview room</p>
              <h1 className="app-title mt-4">{session.title}</h1>
              {session.description && (
                <p className="mt-4 max-w-[62ch] text-[15px] leading-[1.7] text-ink-soft">
                  {session.description}
                </p>
              )}
              <div className="mt-4 flex flex-wrap items-center gap-2">
                <span className="chip chip-accent">{session.role || "General"}</span>
                <span className="chip">{session.level || "Entry"}</span>
                <span className="chip">{session.interviewType || "Mixed"}</span>
                {session.skills?.map((skill) => (
                  <span key={skill} className="chip">
                    {skill}
                  </span>
                ))}
              </div>
            </div>

            <div className="text-right">
              <p className="app-eyebrow">Created by</p>
              <p className="mt-1.5 max-w-[22rem] truncate text-sm text-ink">
                {session.createdBy}
              </p>
              <p className="mt-3 inline-flex items-center gap-2 text-sm text-ink-soft">
                <span className="h-1.5 w-1.5 rounded-full bg-accent" />
                Room ready
              </p>
            </div>
          </div>
        </header>

        <div className="mt-12 grid gap-12 xl:grid-cols-[minmax(0,1fr)_360px]">
          <section>
            <div className="mb-5 flex items-end justify-between gap-4 border-b border-rule pb-4">
              <div>
                <p className="app-eyebrow">Live room</p>
                <h2 className="app-h2 mt-3">Video</h2>
              </div>
              <span className="chip">In session</span>
            </div>
            <VideoRoom sessionId={sessionId} userEmail={user.email} />
          </section>

          <aside>
            <div className="mb-5 border-b border-rule pb-4">
              <p className="app-eyebrow">Conversation</p>
              <h2 className="app-h2 mt-3">Chat</h2>
            </div>
            <ChatRoom sessionId={sessionId} userEmail={user.email} />
          </aside>
        </div>

        <div className="mt-16 border-t border-rule pt-14">
          <SessionTools sessionId={sessionId} session={sessionData} userRole={user.role} />
        </div>

        <div className="mt-16 border-t border-rule pt-14">
          <SharedWorkspace sessionId={sessionId} />
        </div>

        {user.role === "Interviewer" && (
          <section className="mt-16 border-t border-rule pt-14">
            <p className="app-eyebrow">Feedback</p>
            <h2 className="app-h2 mt-3">Interview scorecard</h2>
            <div className="mt-8">
              <InterviewScorecard sessionId={sessionId} session={sessionData} />
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
