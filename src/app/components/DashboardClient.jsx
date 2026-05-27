"use client";

import { motion } from "framer-motion";
import { FaArrowRight, FaClipboardCheck, FaComments, FaUserFriends, FaUserShield, FaVideo } from "react-icons/fa";

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
      className: "from-rose-400 via-amber-300 to-cyan-300",
    },
    Interviewee: {
      href: "/interviewee",
      icon: <FaUserFriends />,
      label: "Open Interviewee Panel",
      className: "from-emerald-300 via-cyan-300 to-rose-300",
    },
  };
  const action = roleActions[userData?.role];
  const dashboardStats = [
    { icon: <FaVideo />, label: "Live rooms", value: "Video" },
    { icon: <FaComments />, label: "Session chat", value: "Realtime" },
    { icon: <FaClipboardCheck />, label: "Reports", value: "Tracked" },
  ];

  return (
    <div className="app-shell relative min-h-screen overflow-hidden px-5 py-24">
      <div className="soft-grid absolute inset-0 opacity-60"></div>

      <motion.div
        initial="hidden"
        animate="visible"
        variants={containerVariants}
        className="relative z-10 mx-auto grid w-full max-w-6xl gap-6 lg:grid-cols-[1.1fr_0.9fr]"
      >
        <motion.section variants={itemVariants} className="glass-panel rounded-[2rem] p-8 sm:p-10">
          <p className="mb-4 text-sm font-bold uppercase tracking-[0.2em] text-cyan-200">Dashboard</p>
          <h1 className="max-w-2xl text-5xl font-black leading-tight tracking-tight sm:text-6xl">
            Welcome back to <span className="gradient-text">PrepTalk.</span>
          </h1>
          <p className="mt-5 max-w-2xl text-lg leading-8 text-slate-300">
            {roleDescriptions[userData?.role] || "Get ready to explore PrepTalk and enhance your skills!"}
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-3">
            <span className="rounded-full border border-white/10 bg-white/10 px-4 py-2 text-sm text-slate-200">
              {userData?.email}
            </span>
            <span className="rounded-full border border-cyan-300/25 bg-cyan-300/10 px-4 py-2 text-sm font-bold text-cyan-100">
              {userData?.role}
            </span>
          </div>
          {action && (
            <motion.a
              variants={itemVariants}
              href={action.href}
              className={`mt-10 inline-flex items-center justify-center gap-3 rounded-full bg-gradient-to-r ${action.className} px-7 py-4 font-black text-slate-950 shadow-lg shadow-cyan-500/20 transition hover:-translate-y-1`}
            >
              {action.icon}
              {action.label}
              <FaArrowRight />
            </motion.a>
          )}
        </motion.section>

        <motion.aside variants={itemVariants} className="grid gap-5">
          <div className="glass-panel rounded-[2rem] p-6">
            <p className="text-sm font-bold uppercase tracking-[0.2em] text-rose-200">Today</p>
            <h2 className="mt-3 text-3xl font-black text-white">Your interview command center</h2>
            <p className="mt-3 leading-7 text-slate-300">
              Jump into your role workspace, manage sessions, and keep feedback moving without hunting through pages.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-3 lg:grid-cols-1">
            {dashboardStats.map((stat) => (
              <div key={stat.label} className="rounded-3xl border border-white/10 bg-slate-950/35 p-5">
                <div className="mb-4 grid h-11 w-11 place-items-center rounded-2xl bg-gradient-to-br from-rose-400 via-amber-300 to-cyan-300 text-slate-950">
                  {stat.icon}
                </div>
                <p className="text-2xl font-black text-white">{stat.value}</p>
                <p className="text-sm text-slate-400">{stat.label}</p>
              </div>
            ))}
          </div>
        </motion.aside>
      </motion.div>
    </div>
  );
}
