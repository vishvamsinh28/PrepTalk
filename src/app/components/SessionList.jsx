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
    <div className="text-slate-100">
      <motion.div
        initial="hidden"
        animate="visible"
        variants={containerVariants}
        className={compact ? "mx-auto w-full" : "mx-auto max-w-6xl"}
      >
        {loading && (
          <motion.div
            variants={itemVariants}
            className="flex items-center justify-center space-x-2 text-cyan-200"
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
            <FaExclamationCircle className="mx-auto mb-3 text-4xl text-cyan-200" />
            <p className="text-lg font-bold text-white">No sessions found.</p>
            <p className="text-sm text-slate-300">Create a new session to get started.</p>
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
      className="glass-panel h-full rounded-xl p-5 transition hover:-translate-y-1 hover:border-cyan-200/40"
    >
      <div className="flex flex-col gap-3">
        <div>
          <h3 className={compact ? "mb-2 text-xl font-black text-white" : "mb-2 text-2xl font-black text-white"}>{session.title}</h3>
          <p className="mb-3 line-clamp-3 text-sm leading-6 text-slate-300">{session.description}</p>
        </div>
        {session.scheduledAt && (
          <span className="inline-flex w-fit items-center gap-2 rounded-lg border border-amber-300/25 bg-amber-300/10 px-3 py-2 text-xs font-bold text-amber-100">
            <FaCalendarAlt />
            {new Date(session.scheduledAt).toLocaleString()}
          </span>
        )}
      </div>

      <div className="flex flex-wrap gap-2 mb-4">
        <span className="rounded-lg border border-cyan-300/25 bg-cyan-300/10 px-3 py-1 text-xs font-bold text-cyan-100">{session.role || "General"}</span>
        <span className="rounded-lg border border-white/10 bg-white/10 px-3 py-1 text-xs text-slate-200">{session.level || "Entry"}</span>
        <span className="rounded-lg border border-white/10 bg-white/10 px-3 py-1 text-xs text-slate-200">{session.interviewType || "Mixed"}</span>
        {session.skills?.map((skill) => (
          <span key={skill} className="rounded-lg border border-white/10 bg-slate-950/35 px-3 py-1 text-xs text-slate-300">{skill}</span>
        ))}
      </div>

      <p className="mb-5 text-xs text-slate-400">Interviewees: <span className="text-slate-200">{session.interviewees?.join(", ") || "None assigned"}</span></p>
      {copied && (
        <p className="mb-3 rounded-lg border border-emerald-300/25 bg-emerald-300/10 px-3 py-2 text-xs font-bold text-emerald-100">
          Link copied
        </p>
      )}

      <div className="grid gap-2 sm:grid-cols-2">
        <button
          onClick={() => router.push(`/session/${session._id}`)}
          className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-linear-to-r from-cyan-300 via-emerald-300 to-blue-400 px-5 py-2.5 font-black text-slate-950 transition hover:-translate-y-0.5"
        >
          <FaSignInAlt />
          Join Session
        </button>
        {inviteUrl && (
          <button
            onClick={copyLink}
            className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg border border-cyan-300/25 bg-cyan-300/10 px-4 py-2.5 font-bold text-cyan-100"
          >
            <FaLink />
            Copy Link
          </button>
        )}
        {(session.interviewees || []).length > 0 && (
          <a href={mailtoHref} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg border border-white/15 bg-white/10 px-4 py-2.5 font-bold text-white">
            <FaEnvelope />
            Email Invite
          </a>
        )}
        <button
          onClick={deleteSession}
          disabled={deleting}
          className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg border border-rose-300/25 bg-rose-400/10 px-4 py-2.5 font-bold text-rose-100 disabled:opacity-60"
        >
          <FaTrash />
          {deleting ? "Deleting..." : "Delete"}
        </button>
      </div>
    </motion.div>
  );
}
