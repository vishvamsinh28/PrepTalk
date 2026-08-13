"use client";

import { useEffect, useState } from "react";
import { deleteJson, getJson } from "@/lib/clientApi";
import { useRouter } from "next/navigation";

export default function SessionList({ compact = false }) {
  const router = useRouter();
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSessions = async () => {
      try {
        const response = await getJson("/api/session/list");
        setSessions(response.sessions);
      } catch (error) {
        console.error("Error fetching sessions:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchSessions();
    window.addEventListener("preptalk:sessions-updated", fetchSessions);

    return () => {
      window.removeEventListener("preptalk:sessions-updated", fetchSessions);
    };
  }, []);

  if (loading) {
    return <p className="app-eyebrow py-8">Loading sessions…</p>;
  }

  if (sessions.length === 0) {
    return (
      <div className="border-y border-rule py-14 text-center">
        <p className="app-h3">No sessions yet.</p>
        <p className="mt-2 text-sm text-ink-soft">
          Create one on the left and it will show up here.
        </p>
      </div>
    );
  }

  return (
    <ul className={compact ? "max-h-[42rem] overflow-y-auto" : ""}>
      {sessions.map((session) => (
        <SessionRow
          key={session._id}
          session={session}
          router={router}
          onDeleted={(sessionId) =>
            setSessions((current) => current.filter((item) => item._id !== sessionId))
          }
        />
      ))}
    </ul>
  );
}

function SessionRow({ session, router, onDeleted }) {
  const [origin, setOrigin] = useState("");
  const [copied, setCopied] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    setOrigin(window.location.origin);
  }, []);

  const inviteUrl = origin ? `${origin}/session/${session._id}` : "";
  const interviewees = session.interviewees || [];
  const mailtoHref = `mailto:${interviewees.join(",")}?subject=${encodeURIComponent(`PrepTalk interview: ${session.title}`)}&body=${encodeURIComponent(`Hi,\n\nYou are invited to a PrepTalk interview session.\n\nSession: ${session.title}\nRole: ${session.role}\n${session.scheduledAt ? `Time: ${new Date(session.scheduledAt).toLocaleString()}\n` : ""}${inviteUrl ? `Join link: ${inviteUrl}\n` : ""}\n\nSee you there.`)}`;

  const deleteSession = async () => {
    if (!window.confirm(`Delete "${session.title}" and its saved chat/reports?`)) return;

    setDeleting(true);
    try {
      await deleteJson(`/api/session/${session._id}`);
      onDeleted(session._id);
    } catch (error) {
      console.error("Session delete failed:", error);
      setDeleting(false);
    }
  };

  const copyLink = async () => {
    if (!inviteUrl) return;
    await navigator.clipboard?.writeText(inviteUrl);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1800);
  };

  return (
    <li className="row-hair px-1 py-6">
      <div className="flex items-start justify-between gap-6">
        <div className="min-w-0">
          <h3 className="app-h3">{session.title}</h3>
          {session.description && (
            <p className="mt-1.5 line-clamp-2 max-w-[60ch] text-sm leading-[1.65] text-ink-soft">
              {session.description}
            </p>
          )}
        </div>
        <button onClick={() => router.push(`/session/${session._id}`)} className="btn-ink shrink-0">
          Join
        </button>
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-2">
        <span className="chip chip-accent">{session.role || "General"}</span>
        <span className="chip">{session.level || "Entry"}</span>
        <span className="chip">{session.interviewType || "Mixed"}</span>
        {session.skills?.map((skill) => (
          <span key={skill} className="chip">
            {skill}
          </span>
        ))}
      </div>

      <dl className="mt-4 space-y-1 text-[13px]">
        {session.scheduledAt && (
          <div className="flex gap-2">
            <dt className="text-ink-soft">Scheduled</dt>
            <dd className="text-ink">{new Date(session.scheduledAt).toLocaleString()}</dd>
          </div>
        )}
        <div className="flex min-w-0 gap-2">
          <dt className="shrink-0 text-ink-soft">Interviewees</dt>
          <dd className="min-w-0 truncate text-ink">
            {interviewees.join(", ") || "None assigned"}
          </dd>
        </div>
      </dl>

      {/* Secondary actions stay as quiet text so only "Join" reads as a button */}
      <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2 text-[13px]">
        {inviteUrl && (
          <button
            onClick={copyLink}
            className="text-ink-soft underline decoration-rule decoration-1 underline-offset-4 transition-colors hover:text-ink hover:decoration-ink"
          >
            {copied ? "Link copied" : "Copy invite link"}
          </button>
        )}
        {interviewees.length > 0 && (
          <a
            href={mailtoHref}
            className="text-ink-soft underline decoration-rule decoration-1 underline-offset-4 transition-colors hover:text-ink hover:decoration-ink"
          >
            Email invite
          </a>
        )}
        <button
          onClick={deleteSession}
          disabled={deleting}
          className="ml-auto text-ink-soft underline decoration-rule decoration-1 underline-offset-4 transition-colors hover:text-accent hover:decoration-accent disabled:opacity-50"
        >
          {deleting ? "Deleting…" : "Delete"}
        </button>
      </div>
    </li>
  );
}
