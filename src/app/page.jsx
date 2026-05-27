"use client";

import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  FaArrowRight,
  FaChartLine,
  FaClipboardCheck,
  FaComments,
  FaMedal,
  FaRocket,
  FaUserGraduate,
} from "react-icons/fa";
import PrepTalkLogo from "./components/PrepTalkLogo";

const fadeIn = {
  hidden: { opacity: 0, y: 22 },
  visible: { opacity: 1, y: 0 },
};

const staggerContainer = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.12,
    },
  },
};

const features = [
  { icon: <FaUserGraduate />, title: "Role-based prep", desc: "Interviewers build focused rooms while candidates join only the sessions assigned to them." },
  { icon: <FaComments />, title: "Live room context", desc: "Video, chat, and presence stay together so interview feedback has the right evidence." },
  { icon: <FaClipboardCheck />, title: "Structured scorecards", desc: "Capture communication, depth, problem solving, confidence, and role fit in one pass." },
  { icon: <FaRocket />, title: "Fast session setup", desc: "Define the target role, level, type, skills, and invitees without extra admin work." },
  { icon: <FaChartLine />, title: "Progress trail", desc: "Reports stay organized so interviewees can see what changed after every practice round." },
  { icon: <FaMedal />, title: "Cleaner decisions", desc: "A polished workflow helps teams spend less time coordinating and more time coaching." },
];

const stats = [
  ["5", "score dimensions"],
  ["2", "clear user roles"],
  ["1", "live practice room"],
];

export default function HomePage() {
  const router = useRouter();

  return (
    <main className="app-shell overflow-hidden">
      <section className="relative min-h-screen px-5 py-8 sm:px-8 lg:px-12">
        <div className="soft-grid absolute inset-0 opacity-70" />
        <div className="relative z-10 mx-auto flex min-h-[calc(100vh-4rem)] max-w-7xl flex-col">
          <header className="flex items-center justify-between">
            <button
              onClick={() => router.push("/")}
              className="flex items-center gap-3 text-left"
              aria-label="PrepTalk home"
            >
              <PrepTalkLogo />
            </button>

            <div className="flex items-center gap-3">
              <button
                onClick={() => router.push("/login")}
                className="rounded-xl border border-white/15 px-5 py-2.5 text-sm font-semibold text-white/85 transition hover:border-cyan-300/70 hover:text-white"
              >
                Login
              </button>
              <button
                onClick={() => router.push("/register")}
                className="rounded-xl bg-gradient-to-r from-cyan-300 via-emerald-300 to-blue-400 px-5 py-2.5 text-sm font-black text-slate-950 shadow-lg shadow-cyan-500/20 transition hover:-translate-y-0.5"
              >
                Start
              </button>
            </div>
          </header>

          <div className="grid flex-1 items-center gap-12 py-12 lg:grid-cols-[1.02fr_0.98fr] lg:py-8">
            <motion.div
              initial="hidden"
              animate="visible"
              variants={staggerContainer}
              className="max-w-3xl"
            >
              <motion.p variants={fadeIn} className="mb-5 inline-flex rounded-xl border border-white/15 bg-white/10 px-4 py-2 text-sm font-semibold text-cyan-100 backdrop-blur">
                Practice interviews with less friction and better feedback.
              </motion.p>
              <motion.h1 variants={fadeIn} className="text-5xl font-black leading-[1.03] tracking-tight sm:text-6xl lg:text-7xl">
                Interview prep that feels <span className="gradient-text">sharp, live, and human.</span>
              </motion.h1>
              <motion.p variants={fadeIn} className="mt-5 max-w-2xl text-lg leading-8 text-slate-300">
                PrepTalk gives interviewers a polished room to run mock interviews and gives candidates clear reports they can actually act on.
              </motion.p>
              <motion.div variants={fadeIn} className="mt-8 flex flex-col gap-4 sm:flex-row">
                <button
                  onClick={() => router.push("/register")}
                  className="inline-flex items-center justify-center gap-3 rounded-xl bg-gradient-to-r from-cyan-300 via-emerald-300 to-blue-400 px-7 py-4 font-black text-slate-950 shadow-xl shadow-cyan-500/20 transition hover:-translate-y-1"
                >
                  Get started free
                  <FaArrowRight />
                </button>
                <button
                  onClick={() => router.push("/login")}
                  className="rounded-xl border border-white/15 bg-white/[0.08] px-7 py-4 font-bold text-white transition hover:border-cyan-300/70 hover:bg-white/[0.12]"
                >
                  Sign in
                </button>
              </motion.div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: 24 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.2 }}
              className="glass-panel rounded-2xl p-5 sm:p-7"
            >
              <div className="rounded-[1.5rem] border border-white/10 bg-slate-950/50 p-5">
                <div className="mb-5 flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold text-cyan-200">Live mock room</p>
                    <h2 className="text-2xl font-black">Frontend Engineer</h2>
                  </div>
                  <span className="rounded-xl bg-emerald-400/15 px-3 py-1 text-xs font-bold text-emerald-200 ring-1 ring-emerald-300/30">
                    Active
                  </span>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="aspect-video rounded-2xl bg-gradient-to-br from-cyan-300/20 via-slate-500/20 to-blue-400/20 p-4">
                    <div className="flex h-full flex-col justify-between rounded-xl bg-black/25 p-4">
                      <span className="h-3 w-16 rounded-xl bg-white/50" />
                      <p className="text-sm font-semibold text-white/85">Interviewer</p>
                    </div>
                  </div>
                  <div className="aspect-video rounded-2xl bg-gradient-to-br from-emerald-300/20 via-slate-500/20 to-cyan-300/20 p-4">
                    <div className="flex h-full flex-col justify-between rounded-xl bg-black/25 p-4">
                      <span className="h-3 w-20 rounded-xl bg-white/50" />
                      <p className="text-sm font-semibold text-white/85">Candidate</p>
                    </div>
                  </div>
                </div>

                <div className="mt-5 grid gap-3">
                  {["System design tradeoffs", "React state strategy", "Communication clarity"].map((item, index) => (
                    <div key={item} className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/[0.08] px-4 py-3">
                      <span className="text-sm text-slate-200">{item}</span>
                      <span className="rounded-xl bg-cyan-300/15 px-3 py-1 text-xs font-bold text-cyan-100">
                        {index + 3}/5
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      <section className="relative px-5 py-20 sm:px-8 lg:px-12">
        <div className="mx-auto max-w-7xl">
          <div className="mb-12 grid gap-8 lg:grid-cols-[0.8fr_1.2fr] lg:items-end">
            <div>
              <p className="mb-3 text-sm font-bold uppercase tracking-[0.2em] text-cyan-200">What changes</p>
              <h2 className="text-4xl font-black tracking-tight sm:text-5xl">A calmer way to run serious practice.</h2>
            </div>
            <p className="text-lg leading-8 text-slate-300">
              The interface keeps setup, live conversation, and review close together so every practice session has a clean beginning, middle, and next step.
            </p>
          </div>

          <motion.div
            className="grid gap-5 md:grid-cols-2 lg:grid-cols-3"
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
          >
            {features.map((feature) => (
              <motion.article key={feature.title} variants={fadeIn} className="glass-panel rounded-2xl p-6 transition hover:-translate-y-1 hover:border-cyan-200/40">
                <div className="mb-5 grid h-12 w-12 place-items-center rounded-2xl bg-gradient-to-br from-cyan-300/90 via-emerald-300/90 to-blue-400/90 text-xl text-slate-950">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-black">{feature.title}</h3>
                <p className="mt-3 leading-7 text-slate-300">{feature.desc}</p>
              </motion.article>
            ))}
          </motion.div>
        </div>
      </section>

      <section className="px-5 pb-24 sm:px-8 lg:px-12">
        <div className="glass-panel mx-auto grid max-w-7xl gap-8 rounded-2xl p-8 md:grid-cols-[1.1fr_0.9fr] md:p-10">
          <div>
            <h2 className="text-4xl font-black tracking-tight">Ready to make your next mock interview count?</h2>
            <p className="mt-4 max-w-2xl text-slate-300">
              Create an account, pick your role, and move straight into a workflow that looks as focused as the interview should feel.
            </p>
            <button
              onClick={() => router.push("/register")}
              className="mt-7 inline-flex items-center gap-3 rounded-xl bg-gradient-to-r from-cyan-300 via-emerald-300 to-blue-400 px-7 py-4 font-black text-slate-950 shadow-lg shadow-cyan-500/20 transition hover:-translate-y-1"
            >
              Create account
              <FaArrowRight />
            </button>
          </div>
          <div className="grid grid-cols-3 gap-3">
            {stats.map(([value, label]) => (
              <div key={label} className="rounded-2xl border border-white/10 bg-slate-950/40 p-4 text-center">
                <p className="text-4xl font-black gradient-text">{value}</p>
                <p className="mt-2 text-xs font-semibold uppercase tracking-wide text-slate-300">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <footer className="border-t border-white/10 px-5 py-8 text-center text-sm text-slate-400">
        © {new Date().getFullYear()} PrepTalk. Built for better practice.
      </footer>
    </main>
  );
}
