"use client";

import { motion } from "framer-motion";
import { FaUserShield, FaUserFriends, FaUserCheck, FaChartBar, FaRocket, FaComments } from "react-icons/fa";

export default function DashboardClient({ userData }) {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.2, delayChildren: 0.3 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  const roleDescriptions = {
    Moderator: "As a Moderator, you can create sessions, manage participants, and guide discussions.",
    Participant: "As a Participant, you can join discussions, share ideas, and improve your speaking skills.",
    Evaluator: "As an Evaluator, you can provide feedback, rate participants, and help them grow."
  };

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 flex justify-center items-center relative px-4">
      {/* Background pattern */}
      <div className="absolute inset-0 bg-[url('/images/pattern.svg')] bg-repeat opacity-5"></div>

      {/* Content */}
      <motion.div
        initial="hidden"
        animate="visible"
        variants={containerVariants}
        className="bg-gray-800 border border-gray-700 p-10 rounded-xl shadow-2xl text-center max-w-2xl w-full relative z-10"
      >
        {/* Header */}
        <motion.div variants={itemVariants}>
          <div className="bg-sky-500/20 p-3 rounded-full inline-flex mb-4">
            <span className="text-3xl">🎉</span>
          </div>
          <h1 className="text-3xl font-bold text-sky-300 mb-3">Welcome to PrepTalk 🚀</h1>
          <p className="text-lg text-gray-300 mb-1">
            Hello, <strong className="text-sky-400">{userData?.email}</strong>!
          </p>
          <p className="text-md text-gray-400 mb-4">
            Your role: <span className="font-semibold text-sky-300">{userData?.role}</span>
          </p>
          <p className="text-gray-400 italic mb-8">
            {roleDescriptions[userData?.role] || "Get ready to explore PrepTalk and enhance your skills!"}
          </p>
        </motion.div>

        {/* Quick Stats */}
        <motion.div
          className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8"
          variants={containerVariants}
        >
          <motion.div variants={itemVariants} className="bg-gray-700 p-4 rounded-lg shadow-inner">
            <FaChartBar className="text-sky-400 text-2xl mb-2 mx-auto" />
            <h3 className="text-lg font-bold text-sky-300">12 Sessions</h3>
            <p className="text-sm text-gray-400">Total completed</p>
          </motion.div>

          <motion.div variants={itemVariants} className="bg-gray-700 p-4 rounded-lg shadow-inner">
            <FaComments className="text-sky-400 text-2xl mb-2 mx-auto" />
            <h3 className="text-lg font-bold text-sky-300">154 Messages</h3>
            <p className="text-sm text-gray-400">Shared in discussions</p>
          </motion.div>

          <motion.div variants={itemVariants} className="bg-gray-700 p-4 rounded-lg shadow-inner">
            <FaRocket className="text-sky-400 text-2xl mb-2 mx-auto" />
            <h3 className="text-lg font-bold text-sky-300">8 Feedbacks</h3>
            <p className="text-sm text-gray-400">Received this week</p>
          </motion.div>
        </motion.div>

        {/* Action Buttons */}
        <motion.div variants={itemVariants} className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <a
            href="/moderator"
            className="flex items-center justify-center gap-2 bg-gradient-to-r from-blue-500 to-sky-500 text-white px-5 py-3 rounded-lg font-semibold shadow-md hover:scale-105 transform transition duration-300"
          >
            <FaUserShield /> Moderator Panel
          </a>
          <a
            href="/participant"
            className="flex items-center justify-center gap-2 bg-gradient-to-r from-green-500 to-emerald-500 text-white px-5 py-3 rounded-lg font-semibold shadow-md hover:scale-105 transform transition duration-300"
          >
            <FaUserFriends /> Participant Panel
          </a>
          <a
            href="/evaluator"
            className="flex items-center justify-center gap-2 bg-gradient-to-r from-yellow-500 to-amber-400 text-white px-5 py-3 rounded-lg font-semibold shadow-md hover:scale-105 transform transition duration-300"
          >
            <FaUserCheck /> Evaluator Panel
          </a>
        </motion.div>
      </motion.div>
    </div>
  );
}
