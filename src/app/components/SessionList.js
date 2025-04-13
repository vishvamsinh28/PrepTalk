"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { FaChalkboardTeacher, FaSpinner, FaExclamationCircle, FaSignInAlt } from "react-icons/fa";

export default function SessionList() {
  const router = useRouter();
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSessions = async () => {
      try {
        const response = await axios.get("/api/session/list");
        setSessions(response.data.sessions);
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
    <div className="min-h-screen bg-gray-900 text-gray-100 px-4 py-10 relative">
      {/* Background pattern */}
      <div className="absolute inset-0 bg-[url('/images/pattern.svg')] bg-repeat opacity-5 z-0"></div>

      {/* Content container */}
      <motion.div
        initial="hidden"
        animate="visible"
        variants={containerVariants}
        className="relative z-10 max-w-5xl mx-auto"
      >
        {/* Header */}
        <motion.div variants={itemVariants} className="text-center mb-10">
          <div className="bg-sky-500/20 p-3 rounded-full inline-flex mb-4">
            <FaChalkboardTeacher className="text-3xl text-sky-300" />
          </div>
          <h1 className="text-4xl font-bold text-sky-300 mb-2">All Sessions</h1>
          <p className="text-gray-400 text-sm">Manage and join all available sessions here.</p>
        </motion.div>

        {/* Loader */}
        {loading && (
          <motion.div
            variants={itemVariants}
            className="flex justify-center items-center text-sky-400 space-x-2"
          >
            <FaSpinner className="animate-spin text-xl" />
            <span>Loading sessions...</span>
          </motion.div>
        )}

        {/* No sessions */}
        {!loading && sessions.length === 0 && (
          <motion.div
            variants={itemVariants}
            className="text-center bg-gray-800 p-6 rounded-xl border border-gray-700"
          >
            <FaExclamationCircle className="text-4xl text-sky-500 mb-3 mx-auto" />
            <p className="text-lg text-sky-400">No sessions found.</p>
            <p className="text-gray-400 text-sm">Create a new session to get started!</p>
          </motion.div>
        )}

        {/* Sessions list */}
        {!loading && sessions.length > 0 && (
          <motion.div className="space-y-6" variants={containerVariants}>
            <AnimatePresence>
              {sessions.map((session) => (
                <motion.div
                  key={session._id}
                  variants={itemVariants}
                  initial="hidden"
                  animate="visible"
                  exit="hidden"
                  className="bg-gray-800 border border-gray-700 p-6 rounded-xl shadow-lg transition-all hover:border-sky-500/50"
                >
                  <h3 className="text-2xl font-bold text-sky-300 mb-2">{session.title}</h3>
                  <p className="text-gray-400 text-sm mb-3">{session.description}</p>
                  <p className="text-gray-500 text-xs mb-4">Created by: <span className="text-gray-300">{session.createdBy}</span></p>
                  <button
                    onClick={() => router.push(`/session/${session._id}`)}
                    className="bg-gradient-to-r from-sky-500 to-blue-500 hover:from-sky-600 hover:to-blue-600 text-white px-6 py-2 rounded-lg flex items-center gap-2 font-medium hover:scale-105 transition"
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
