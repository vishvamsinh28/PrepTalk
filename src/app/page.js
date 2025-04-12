"use client";

import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();

  return (
    <div className="flex flex-col min-h-screen justify-center items-center bg-gradient-to-br from-blue-100 to-blue-300 text-gray-800 p-4">
      {/* Logo and Title */}
      <div className="text-center mb-8">
        <h1 className="text-5xl font-extrabold mb-4 text-blue-700">PrepTalk 🎙️</h1>
        <p className="text-lg text-gray-700 max-w-xl">
          A real-time collaborative platform designed for students and job seekers to enhance their group discussion and interview skills.
        </p>
      </div>

      {/* Buttons */}
      <div className="flex space-x-6 mb-10">
        <button
          onClick={() => router.push("/register")}
          className="bg-blue-600 text-white px-6 py-3 rounded-lg shadow hover:bg-blue-700 transition"
        >
          Get Started
        </button>
        <button
          onClick={() => router.push("/login")}
          className="bg-white text-blue-600 px-6 py-3 rounded-lg border border-blue-600 shadow hover:bg-blue-50 transition"
        >
          Login
        </button>
      </div>

      {/* Features */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center max-w-5xl">
        <div className="bg-white p-6 rounded shadow hover:shadow-lg transition">
          <h3 className="text-xl font-bold text-blue-600 mb-2">Role-Based Access 🔑</h3>
          <p>Join as Moderator, Participant, or Evaluator and experience tailored dashboards and features.</p>
        </div>
        <div className="bg-white p-6 rounded shadow hover:shadow-lg transition">
          <h3 className="text-xl font-bold text-blue-600 mb-2">Real-Time Discussion 💬</h3>
          <p>Engage in live group discussions with instant messaging powered by Socket.IO.</p>
        </div>
        <div className="bg-white p-6 rounded shadow hover:shadow-lg transition">
          <h3 className="text-xl font-bold text-blue-600 mb-2">Post-Session Feedback 📝</h3>
          <p>Receive and give constructive feedback after sessions to improve communication skills.</p>
        </div>
      </div>

      {/* Footer */}
      <div className="mt-16 text-gray-600 text-sm">
        © {new Date().getFullYear()} PrepTalk. Made with ❤️ at the TicTacToe by TechCravers.
      </div>
    </div>
  );
}
