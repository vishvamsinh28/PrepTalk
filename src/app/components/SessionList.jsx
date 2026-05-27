"use client";

import { useEffect, useState } from "react";
import { getJson } from "@/lib/clientApi";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { FaCalendarAlt, FaEnvelope, FaLink, FaSpinner, FaExclamationCircle, FaSignInAlt } from "react-icons/fa";

export default function SessionList() {
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
        className="max-w-5xl mx-auto"
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
            className="glass-panel rounded-3xl p-8 text-center"
          >
            <FaExclamationCircle className="mx-auto mb-3 text-4xl text-cyan-200" />
            <p className="text-lg font-bold text-white">No sessions found.</p>
            <p className="text-sm text-slate-300">Create a new session to get started.</p>
          </motion.div>
        )}

        {!loading && sessions.length > 0 && (
          <motion.div className="space-y-6" variants={containerVariants}>
            <AnimatePresence>
              {sessions.map((session) => (
                <SessionCard key={session._id} session={session} router={router} variants={itemVariants} />
              ))}
            </AnimatePresence>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}

function SessionCard({ session, router, variants }) {
  const [origin, setOrigin] = useState("");
  useEffect(() => {
    setOrigin(window.location.origin);
  }, []);
  const inviteUrl = origin && session.inviteCode
    ? `${origin}/session/${session._id}?invite=${session.inviteCode}`
    : "";
  const mailtoHref = `mailto:${(session.interviewees || []).join(",")}?subject=${encodeURIComponent(`PrepTalk interview: ${session.title}`)}&body=${encodeURIComponent(`Hi,\n\nYou are invited to a PrepTalk interview session.\n\nSession: ${session.title}\nRole: ${session.role}\n${session.scheduledAt ? `Time: ${new Date(session.scheduledAt).toLocaleString()}\n` : ""}${inviteUrl ? `Join link: ${inviteUrl}\n` : ""}\n\nSee you there.`)}`;

  return (
    <motion.div
      variants={variants}
      initial="hidden"
      animate="visible"
      exit="hidden"
      className="glass-panel rounded-3xl p-6 transition hover:-translate-y-1 hover:border-cyan-200/40"
    >
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <h3 className="mb-2 text-2xl font-black text-white">{session.title}</h3>
          <p className="mb-4 text-sm leading-6 text-slate-300">{session.description}</p>
        </div>
        {session.scheduledAt && (
          <span className="inline-flex items-center gap-2 rounded-xl border border-amber-300/25 bg-amber-300/10 px-3 py-2 text-xs font-bold text-amber-100">
            <FaCalendarAlt />
            {new Date(session.scheduledAt).toLocaleString()}
          </span>
        )}
      </div>

      <div className="flex flex-wrap gap-2 mb-4">
        <span className="rounded-xl border border-cyan-300/25 bg-cyan-300/10 px-3 py-1 text-xs font-bold text-cyan-100">{session.role}</span>
        <span className="rounded-xl border border-white/10 bg-white/10 px-3 py-1 text-xs text-slate-200">{session.level}</span>
        <span className="rounded-xl border border-white/10 bg-white/10 px-3 py-1 text-xs text-slate-200">{session.interviewType}</span>
        {session.skills?.map((skill) => (
          <span key={skill} className="rounded-xl border border-white/10 bg-slate-950/35 px-3 py-1 text-xs text-slate-300">{skill}</span>
        ))}
      </div>

      <p className="mb-5 text-xs text-slate-400">Interviewees: <span className="text-slate-200">{session.interviewees?.join(", ") || "None assigned"}</span></p>

      <div className="flex flex-wrap gap-3">
        <button
          onClick={() => router.push(`/session/${session._id}`)}
          className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-rose-400 via-amber-300 to-cyan-300 px-6 py-3 font-black text-slate-950 transition hover:-translate-y-0.5"
        >
          <FaSignInAlt />
          Join Session
        </button>
        {inviteUrl && (
          <button
            onClick={() => navigator.clipboard?.writeText(inviteUrl)}
            className="flex items-center gap-2 rounded-xl border border-cyan-300/25 bg-cyan-300/10 px-5 py-3 font-bold text-cyan-100"
          >
            <FaLink />
            Copy Link
          </button>
        )}
        {(session.interviewees || []).length > 0 && (
          <a href={mailtoHref} className="flex items-center gap-2 rounded-xl border border-white/15 bg-white/10 px-5 py-3 font-bold text-white">
            <FaEnvelope />
            Email Invite
          </a>
        )}
      </div>
    </motion.div>
  );
}
