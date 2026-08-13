"use client";

import { useEffect, useState } from "react";
import { getJson } from "@/lib/clientApi";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { FaSignInAlt } from "react-icons/fa";

export default function IntervieweeSessionList() {
  const [sessions, setSessions] = useState([]);
  const router = useRouter();

  useEffect(() => {
    const fetchSessions = async () => {
      try {
        const response = await getJson("/api/session/list");
        setSessions(response.sessions || []);
      } catch (error) {
        console.error("Error fetching sessions:", error);
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
    <div className="text-ink">
      <motion.div
        initial="hidden"
        animate="visible"
        variants={containerVariants}
        className="max-w-4xl mx-auto"
      >
        {sessions.length === 0 ? (
          <motion.div variants={itemVariants} className="glass-panel rounded-2xl p-8 text-center">
            <p className="text-lg font-bold text-ink">No sessions assigned yet.</p>
            <p className="text-sm text-ink-soft">Please check back later.</p>
          </motion.div>
        ) : (
          <motion.div className="grid max-h-168 gap-5 overflow-y-auto pr-1" variants={containerVariants}>
            <AnimatePresence>
              {sessions.map((session) => (
                <motion.div
                  key={session._id}
                  variants={itemVariants}
                  initial="hidden"
                  animate="visible"
                  exit="hidden"
                  className="glass-panel rounded-2xl p-6 transition hover:-translate-y-1 hover:border-accent"
                >
                  <h3 className="mb-2 text-2xl font-semibold text-ink">{session.title}</h3>
                  <p className="mb-4 text-sm leading-6 text-ink-soft">{session.description}</p>
                  <div className="flex flex-wrap gap-2 mb-4">
                    <span className="rounded-xl border border-accent bg-accent/10 px-3 py-1 text-xs font-bold text-accent">{session.role}</span>
                    <span className="rounded-xl border border-rule bg-black/5 px-3 py-1 text-xs text-ink">{session.level}</span>
                    <span className="rounded-xl border border-rule bg-black/5 px-3 py-1 text-xs text-ink">{session.interviewType}</span>
                    {session.skills?.map((skill) => (
                      <span key={skill} className="rounded-xl border border-rule bg-white px-3 py-1 text-xs text-ink-soft">{skill}</span>
                    ))}
                  </div>
                  <button
                    onClick={() => router.push(`/session/${session._id}`)}
                    className="flex items-center gap-2 rounded-xl bg-ink px-6 py-3 font-semibold text-canvas transition hover:-translate-y-0.5"
                  >
                    <FaSignInAlt />
                    Join Session
                  </button>
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}
