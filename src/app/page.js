"use client";

import { useRouter } from "next/navigation";
import { motion } from "framer-motion";

export default function HomePage() {
  const router = useRouter();

  return (
    <div className="flex flex-col min-h-screen justify-center items-center bg-gradient-to-br from-blue-100 to-blue-300 text-gray-800 p-4">
      {/* Logo and Title */}
      <motion.div
        className="text-center mb-8"
        initial={{ opacity: 0, y: -30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
      >
        <h1 className="text-5xl font-extrabold mb-4 text-blue-700">PrepTalk 🎙️</h1>
        <p className="text-lg text-gray-700 max-w-xl">
          A real-time collaborative platform designed for students and job seekers to enhance their group discussion and interview skills.
        </p>
      </motion.div>

      {/* Buttons */}
      <motion.div
        className="flex space-x-6 mb-10"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.3 }}
      >
        <button
          onClick={() => router.push("/register")}
          className="bg-blue-600 text-white px-6 py-3 rounded-lg shadow hover:bg-blue-700 hover:scale-105 transition transform"
        >
          Get Started
        </button>
        <button
          onClick={() => router.push("/login")}
          className="bg-white text-blue-600 px-6 py-3 rounded-lg border border-blue-600 shadow hover:bg-blue-50 hover:scale-105 transition transform"
        >
          Login
        </button>
      </motion.div>

      {/* Features */}
      <motion.div
        className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center max-w-5xl"
        initial="hidden"
        animate="visible"
        variants={{
          hidden: {},
          visible: {
            transition: {
              staggerChildren: 0.2,
            },
          },
        }}
      >
        {[
          {
            title: "Role-Based Access 🔑",
            description: "Join as Moderator, Participant, or Evaluator and experience tailored dashboards and features.",
          },
          {
            title: "Real-Time Discussion 💬",
            description: "Engage in live group discussions with instant messaging powered by Socket.IO.",
          },
          {
            title: "Post-Session Feedback 📝",
            description: "Receive and give constructive feedback after sessions to improve communication skills.",
          },
        ].map((feature, index) => (
          <motion.div
            key={index}
            className="bg-white p-6 rounded shadow hover:shadow-lg transition transform hover:scale-105"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: index * 0.3 }}
          >
            <h3 className="text-xl font-bold text-blue-600 mb-2">{feature.title}</h3>
            <p>{feature.description}</p>
          </motion.div>
        ))}
      </motion.div>

      {/* Footer */}
      <motion.div
        className="mt-16 text-gray-600 text-sm"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2 }}
      >
        © {new Date().getFullYear()} PrepTalk. Made with ❤️ at the TicTacToe by TechCravers.
      </motion.div>
    </div>
  );
}
