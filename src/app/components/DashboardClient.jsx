"use client";

import { motion } from "framer-motion";
import { FaUserShield, FaUserFriends } from "react-icons/fa";

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
    Interviewer: "As an Interviewer, you can create sessions, run live interviews, and submit structured reports.",
    Interviewee: "As an Interviewee, you can join assigned interviews and review your reports after each session."
  };
  const roleActions = {
    Interviewer: {
      href: "/interviewer",
      icon: <FaUserShield />,
      label: "Open Interviewer Panel",
      className: "from-blue-500 to-sky-500",
    },
    Interviewee: {
      href: "/interviewee",
      icon: <FaUserFriends />,
      label: "Open Interviewee Panel",
      className: "from-green-500 to-emerald-500",
    },
  };
  const action = roleActions[userData?.role];

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 flex justify-center items-center relative px-4">
      <div className="absolute inset-0 bg-[url('/images/pattern.svg')] bg-repeat opacity-5"></div>

      <motion.div
        initial="hidden"
        animate="visible"
        variants={containerVariants}
        className="bg-gray-800 border border-gray-700 p-10 rounded-xl shadow-2xl text-center max-w-2xl w-full relative z-10"
      >
        <motion.div variants={itemVariants}>
          <h1 className="text-3xl font-bold text-sky-300 mb-3">Welcome to PrepTalk</h1>
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

        {action && (
          <motion.a
            variants={itemVariants}
            href={action.href}
            className={`inline-flex items-center justify-center gap-2 bg-gradient-to-r ${action.className} text-white px-5 py-3 rounded-lg font-semibold shadow-md hover:scale-105 transform transition duration-300`}
          >
            {action.icon}
            {action.label}
          </motion.a>
        )}
      </motion.div>
    </div>
  );
}
