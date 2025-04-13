"use client";

import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { FaUserGraduate, FaComments, FaClipboardCheck, FaRocket, FaChartLine, FaMedal } from "react-icons/fa";

export default function HomePage() {
  const router = useRouter();

  // Reusable fade animation
  const fadeIn = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  const staggerContainer = {
    hidden: {},
    visible: {
      transition: {
        staggerChildren: 0.2,
      },
    },
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-900 text-gray-100 scroll-smooth">
      {/* Hero Section */}
      <motion.div
        className="relative h-screen flex flex-col justify-center items-center text-center px-4"
        initial="hidden"
        animate="visible"
        variants={fadeIn}
        transition={{ duration: 1 }}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-blue-900 to-gray-900 opacity-70"></div>
        <div className="absolute inset-0 bg-[url('/images/pattern.svg')] bg-repeat opacity-10"></div>

        <div className="z-10 max-w-5xl mx-auto">
          <motion.div variants={fadeIn}>
            <div className="mb-4">
              <span className="inline-block bg-sky-500 p-2 rounded-full animate-pulse">
                <span className="text-4xl">🎙️</span>
              </span>
            </div>
            <h1 className="text-6xl font-extrabold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-sky-300 to-blue-500 leading-tight">
              PrepTalk
            </h1>
            <p className="text-xl text-sky-100 max-w-2xl mx-auto mb-8">
              Master your interview skills and dominate group discussions with our
              real-time collaborative platform designed for ambitious students and professionals.
            </p>
          </motion.div>

          <motion.div
            className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-6 justify-center"
            variants={fadeIn}
          >
            <button
              onClick={() => router.push("/register")}
              className="bg-gradient-to-r from-sky-400 to-blue-500 text-white px-8 py-4 rounded-lg font-semibold shadow-xl hover:scale-105 transform transition duration-300"
            >
              🚀 Get Started Free
            </button>
            <button
              onClick={() => router.push("/login")}
              className="bg-gray-800 text-sky-400 border border-sky-500 px-8 py-4 rounded-lg font-semibold shadow-lg hover:bg-gray-700 hover:scale-105 transition transform duration-300"
            >
              🔑 Login
            </button>
          </motion.div>

          <motion.div
            className="mt-16 flex justify-center"
            variants={fadeIn}
          >
            <div className="animate-bounce bg-sky-500/20 p-3 w-12 h-12 ring-1 ring-sky-500/50 rounded-full flex items-center justify-center cursor-pointer"
              onClick={() => window.scrollTo({ top: window.innerHeight, behavior: "smooth" })}
            >
              <svg className="w-6 h-6 text-sky-300" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path d="M19 14l-7 7m0 0l-7-7m7 7V3"></path>
              </svg>
            </div>
          </motion.div>
        </div>
      </motion.div>

      {/* Features Section */}
      <section className="py-20 bg-gray-800">
        <div className="container mx-auto px-4">
          <motion.div className="text-center mb-16" variants={fadeIn} initial="hidden" whileInView="visible" viewport={{ once: true }}>
            <h2 className="text-4xl font-bold mb-4 text-sky-300">Why Choose PrepTalk?</h2>
            <p className="max-w-2xl mx-auto text-gray-300 text-lg">
              Your personal practice ground for high-stakes interviews and group discussions. Build confidence, skill, and success!
            </p>
          </motion.div>

          <motion.div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto"
            variants={staggerContainer} initial="hidden" whileInView="visible" viewport={{ once: true }}>
            {[
              { icon: <FaUserGraduate />, title: "Role-Based Experience", desc: "Moderator, Participant, or Evaluator with tailored interfaces for you." },
              { icon: <FaComments />, title: "Real-Time Collaboration", desc: "Dynamic discussions with instant messaging & audio features." },
              { icon: <FaClipboardCheck />, title: "Comprehensive Feedback", desc: "Get actionable insights to boost your performance fast." },
              { icon: <FaRocket />, title: "AI-Powered Insights", desc: "Personalized recommendations to play on your strengths." },
              { icon: <FaChartLine />, title: "Progress Tracking", desc: "Track your improvement over time with detailed analytics." },
              { icon: <FaMedal />, title: "Industry Templates", desc: "Practice with curated questions from top companies." },
            ].map((feature, i) => (
              <motion.div key={i} className="bg-gray-900 border border-gray-700 p-8 rounded-xl shadow-lg group hover:shadow-sky-500/20 hover:border-sky-500/50 transition-all duration-300"
                variants={fadeIn}>
                <div className="text-center">
                  <div className="flex justify-center items-center text-sky-400 text-4xl mb-4 group-hover:scale-110 transform transition">
                    {feature.icon}
                  </div>
                  <h3 className="text-xl font-bold text-sky-300 mb-3 group-hover:text-sky-400 transition">{feature.title}</h3>
                  <p className="text-gray-400 group-hover:text-gray-300 transition">{feature.desc}</p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 bg-gray-900">
        <div className="container mx-auto px-4">
          <motion.div className="text-center mb-16" variants={fadeIn} initial="hidden" whileInView="visible" viewport={{ once: true }}>
            <h2 className="text-4xl font-bold mb-4 text-sky-300">Success Stories</h2>
            <p className="max-w-2xl mx-auto text-gray-300 text-lg">
              PrepTalk has helped thousands achieve their career goals.
            </p>
          </motion.div>

          <motion.div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto"
            variants={staggerContainer} initial="hidden" whileInView="visible" viewport={{ once: true }}>
            {[
              { quote: "PrepTalk transformed my interview skills. After just 3 weeks of practice, I secured offers from two top tech companies!", author: "Mira S.", position: "Software Engineer at TechGiant Inc." },
              { quote: "The feedback I received was invaluable. I'm now leading discussions in my MBA program with confidence.", author: "James L.", position: "MBA Candidate, Business School" },
            ].map((t, i) => (
              <motion.div key={i} className="bg-gray-800 border border-gray-700 p-8 rounded-xl shadow-lg relative group hover:border-sky-500/50 transition"
                variants={fadeIn}>
                <div className="absolute -top-5 left-5 text-5xl text-sky-500 opacity-40 group-hover:opacity-60">“</div>
                <p className="text-gray-300 mb-6">{t.quote}</p>
                <div>
                  <p className="font-semibold text-sky-300">{t.author}</p>
                  <p className="text-gray-400 text-sm">{t.position}</p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-20 bg-gradient-to-r from-blue-900 to-sky-900 text-center">
        <motion.div className="max-w-3xl mx-auto" variants={fadeIn} initial="hidden" whileInView="visible" viewport={{ once: true }}>
          <h2 className="text-4xl font-bold mb-6 text-white">Ready to Elevate Your Skills?</h2>
          <p className="text-sky-100 text-lg mb-10">
            Join thousands of successful professionals who’ve transformed their communication abilities with PrepTalk.
          </p>
          <button
            onClick={() => router.push("/register")}
            className="bg-sky-400 hover:bg-sky-500 text-gray-900 font-bold px-10 py-4 rounded-lg shadow-lg hover:shadow-sky-400/50 transform hover:scale-105 transition duration-300"
          >
            Start Free Trial
          </button>
          <p className="text-sky-200 mt-4 text-sm">No credit card required. 7-day free trial.</p>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 border-t border-gray-800 py-12">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="mb-6 md:mb-0 text-center md:text-left">
              <h3 className="text-2xl font-bold text-sky-400">PrepTalk</h3>
              <p className="text-gray-400 mt-2">Elevate your communication skills.</p>
            </div>
            <div className="flex flex-wrap justify-center gap-6 text-gray-400">
              {["About", "Features", "Pricing", "Blog", "Contact"].map((link) => (
                <a key={link} href="#" className="hover:text-sky-300 transition">{link}</a>
              ))}
            </div>
          </div>
          <div className="mt-8 pt-8 border-t border-gray-800 text-center text-gray-500 text-sm">
            © {new Date().getFullYear()} PrepTalk. Made with ❤️ by TechCravers.
          </div>
        </div>
      </footer>
    </div>
  );
}
