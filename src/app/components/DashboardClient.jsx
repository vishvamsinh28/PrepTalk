"use client";

import { motion } from "framer-motion";
import { FaArrowRight, FaClipboardCheck, FaCode, FaListAlt, FaPlus, FaUserFriends, FaUserShield } from "react-icons/fa";
import ProgressDashboard from "./ProgressDashboard";

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
    },
    Interviewee: {
      href: "/interviewee",
      icon: <FaUserFriends />,
      label: "Open Interviewee Panel",
    },
  };
  const action = roleActions[userData?.role];
  const quickActions = userData?.role === "Interviewer"
    ? [
        { icon: <FaPlus />, label: "Create interview", href: "/interviewer" },
        { icon: <FaListAlt />, label: "Manage sessions", href: "/interviewer#sessions" },
        { icon: <FaCode />, label: "Open Lab", href: "/lab" },
        { icon: <FaClipboardCheck />, label: "Review reports", href: "/interviewer#reports" },
      ]
    : [
        { icon: <FaListAlt />, label: "Join interviews", href: "/interviewee" },
        { icon: <FaCode />, label: "Practice in Lab", href: "/lab" },
        { icon: <FaClipboardCheck />, label: "View feedback", href: "/interviewee#reports" },
      ];

  return (
    <div className="app-shell relative min-h-screen overflow-hidden px-5 pb-16 pt-24">
      <div className="soft-grid absolute inset-0 opacity-60"></div>

      <motion.div
        initial="hidden"
        animate="visible"
        variants={containerVariants}
        className="relative z-10 mx-auto grid w-full max-w-6xl gap-5 lg:grid-cols-[1.15fr_0.85fr]"
      >
        <motion.section variants={itemVariants} className="glass-panel rounded-xl p-6 sm:p-8">
          <p className="mb-4 text-sm font-bold uppercase tracking-[0.2em] text-accent">Dashboard</p>
          <h1 className="max-w-2xl text-4xl font-semibold leading-tight tracking-tight sm:text-5xl">
            Welcome back to <span className="gradient-text">PrepTalk.</span>
          </h1>
          <p className="mt-4 max-w-2xl text-base leading-7 text-ink-soft">
            {roleDescriptions[userData?.role] || "Get ready to explore PrepTalk and enhance your skills!"}
          </p>
          <div className="mt-6 flex flex-wrap items-center gap-3">
            <span className="rounded-lg border border-rule bg-black/5 px-3 py-2 text-sm text-ink">
              {userData?.email}
            </span>
            <span className="rounded-lg border border-accent bg-accent/10 px-3 py-2 text-sm font-bold text-accent">
              {userData?.role}
            </span>
          </div>
          {action && (
            <motion.a
              variants={itemVariants}
              href={action.href}
              className="mt-8 inline-flex items-center justify-center gap-3 rounded-lg bg-ink px-6 py-3.5 font-semibold text-canvas transition hover:opacity-85"
            >
              {action.icon}
              {action.label}
              <FaArrowRight />
            </motion.a>
          )}
        </motion.section>

        <motion.aside variants={itemVariants} className="grid gap-5">
          <div className="glass-panel rounded-xl p-5">
            <p className="text-sm font-bold uppercase tracking-[0.2em] text-amber-700">Next steps</p>
            <h2 className="mt-2 text-2xl font-semibold text-ink">Useful shortcuts</h2>
            <div className="mt-5 grid gap-3">
              {quickActions.map((item) => (
                <a
                  key={item.label}
                  href={item.href}
                  className="flex items-center justify-between gap-3 rounded-lg border border-rule bg-white px-4 py-3 text-ink transition hover:border-accent hover:bg-accent/10 hover:text-ink"
                >
                  <span className="inline-flex items-center gap-3 font-bold">
                    <span className="text-accent">{item.icon}</span>
                    {item.label}
                  </span>
                  <FaArrowRight className="text-sm text-ink-soft" />
                </a>
              ))}
            </div>
          </div>
        </motion.aside>

        <motion.div variants={itemVariants} className="lg:col-span-2">
          <ProgressDashboard />
        </motion.div>
      </motion.div>
    </div>
  );
}
