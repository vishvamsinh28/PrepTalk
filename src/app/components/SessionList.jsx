"use client";

import { useEffect, useState } from "react";
import { deleteJson, getJson } from "@/lib/clientApi";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { FaCalendarAlt, FaEnvelope, FaLink, FaSpinner, FaExclamationCircle, FaSignInAlt, FaTrash } from "react-icons/fa";

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

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <div className="text-ink">
      <motion.div
        initial="hidden"
        animate="visible"
        variants={containerVariants}
        className={compact ? "mx-auto w-full" : "mx-auto max-w-6xl"}
      >
        {loading && (
          <motion.div
            variants={itemVariants}
            className="flex items-center justify-center space-x-2 text-accent"
          >
            <FaSpinner className="animate-spin text-xl" />
            <span>Loading sessions...</span>
          </motion.div>
        )}

        {!loading && sessions.length === 0 && (
          <motion.div
            variants={itemVariants}
            className="glass-panel rounded-2xl p-8 text-center"
          >
            <FaExclamationCircle className="mx-auto mb-3 text-4xl text-accent" />
            <p className="text-lg font-bold text-ink">No sessions found.</p>
            <p className="text-sm text-ink-soft">Create a new session to get started.</p>
          </motion.div>
        )}

        {!loading && sessions.length > 0 && (
          <motion.div
            className={compact ? "grid max-h-[34rem] gap-4 overflow-y-auto pr-1" : "grid max-h-[46rem] gap-5 overflow-y-auto pr-1 lg:grid-cols-2"}
            variants={containerVariants}
          >
            <AnimatePresence>
              {sessions.map((session) => (
                <SessionCard
                  key={session._id}
                  session={session}
                  router={router}
                  variants={itemVariants}
                  compact={compact}
                  onDeleted={(sessionId) => setSessions((current) => current.filter((item) => item._id !== sessionId))}
                />
              ))}
            </AnimatePresence>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}

function SessionCard({ session, router, variants, compact, onDeleted }) {
  const [origin, setOrigin] = useState("");
  const [copied, setCopied] = useState(false);
  const [deleting, setDeleting] = useState(false);
  useEffect(() => {
    setOrigin(window.location.origin);
  }, []);
  const inviteUrl = origin ? `${origin}/session/${session._id}` : "";
  const mailtoHref = `mailto:${(session.interviewees || []).join(",")}?subject=${encodeURIComponent(`PrepTalk interview: ${session.title}`)}&body=${encodeURIComponent(`Hi,\n\nYou are invited to a PrepTalk interview session.\n\nSession: ${session.title}\nRole: ${session.role}\n${session.scheduledAt ? `Time: ${new Date(session.scheduledAt).toLocaleString()}\n` : ""}${inviteUrl ? `Join link: ${inviteUrl}\n` : ""}\n\nSee you there.`)}`;
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
    <motion.div
      variants={variants}
      initial="hidden"
      animate="visible"
      exit="hidden"
      className="glass-panel h-full rounded-xl p-5 transition hover:-translate-y-1 hover:border-accent"
    >
      <div className="flex flex-col gap-3">
        <div>
          <h3 className={compact ? "mb-2 text-xl font-semibold text-ink" : "mb-2 text-2xl font-semibold text-ink"}>{session.title}</h3>
          <p className="mb-3 line-clamp-3 text-sm leading-6 text-ink-soft">{session.description}</p>
        </div>
        {session.scheduledAt && (
          <span className="inline-flex w-fit items-center gap-2 rounded-lg border border-amber-600/40 bg-amber-50 px-3 py-2 text-xs font-bold text-amber-700">
            <FaCalendarAlt />
            {new Date(session.scheduledAt).toLocaleString()}
          </span>
        )}
      </div>

      <div className="flex flex-wrap gap-2 mb-4">
        <span className="rounded-lg border border-accent bg-accent/10 px-3 py-1 text-xs font-bold text-accent">{session.role || "General"}</span>
        <span className="rounded-lg border border-rule bg-black/5 px-3 py-1 text-xs text-ink">{session.level || "Entry"}</span>
        <span className="rounded-lg border border-rule bg-black/5 px-3 py-1 text-xs text-ink">{session.interviewType || "Mixed"}</span>
        {session.skills?.map((skill) => (
          <span key={skill} className="rounded-lg border border-rule bg-white px-3 py-1 text-xs text-ink-soft">{skill}</span>
        ))}
      </div>

      <p className="mb-5 text-xs text-ink-soft">Interviewees: <span className="text-ink">{session.interviewees?.join(", ") || "None assigned"}</span></p>
      {copied && (
        <p className="mb-3 rounded-lg border border-emerald-600/40 bg-emerald-50 px-3 py-2 text-xs font-bold text-emerald-700">
          Link copied
        </p>
      )}

      <div className="grid gap-2 sm:grid-cols-2">
        <button
          onClick={() => router.push(`/session/${session._id}`)}
          className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-ink px-5 py-2.5 font-semibold text-canvas transition hover:-translate-y-0.5"
        >
          <FaSignInAlt />
          Join Session
        </button>
        {inviteUrl && (
          <button
            onClick={copyLink}
            className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg border border-accent bg-accent/10 px-4 py-2.5 font-bold text-accent"
          >
            <FaLink />
            Copy Link
          </button>
        )}
        {(session.interviewees || []).length > 0 && (
          <a href={mailtoHref} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg border border-rule bg-black/5 px-4 py-2.5 font-bold text-ink">
            <FaEnvelope />
            Email Invite
          </a>
        )}
        <button
          onClick={deleteSession}
          disabled={deleting}
          className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg border border-rose-600/40 bg-rose-50 px-4 py-2.5 font-bold text-rose-700 disabled:opacity-60"
        >
          <FaTrash />
          {deleting ? "Deleting..." : "Delete"}
        </button>
      </div>
    </motion.div>
  );
}
