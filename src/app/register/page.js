"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { motion } from "framer-motion";
import { FaUser, FaEnvelope, FaLock, FaUsersCog } from "react-icons/fa";

export default function RegisterPage() {
  const router = useRouter();

  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    role: "Participant",
  });

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setIsLoading(true);

    try {
      const response = await axios.post("/api/register", formData);
      setSuccess(response.data.message);
      setTimeout(() => {
        router.push("/login");
      }, 1500);
    } catch (err) {
      setError(err.response?.data?.message || "Registration failed");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen justify-center items-center bg-gray-900 text-gray-100">
      <div className="absolute inset-0 bg-[url('/images/pattern.svg')] bg-repeat opacity-5"></div>
      
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="bg-gray-800 p-8 rounded-xl shadow-2xl border border-gray-700 w-full max-w-md space-y-6 relative z-10"
      >
        <div className="text-center mb-6">
          <div className="flex justify-center mb-4">
            <div className="bg-sky-500/20 p-3 rounded-full">
              <span className="text-3xl">🚀</span>
            </div>
          </div>
          <h2 className="text-3xl font-bold text-sky-300">Create Your Account</h2>
          <p className="text-gray-400 mt-2">Join PrepTalk and elevate your skills today</p>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/50 text-red-400 p-3 rounded-lg text-sm">
            {error}
          </div>
        )}
        
        {success && (
          <div className="bg-green-500/10 border border-green-500/50 text-green-400 p-3 rounded-lg text-sm">
            {success}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-gray-500">
              <FaUser />
            </div>
            <input
              type="text"
              name="username"
              placeholder="Username"
              value={formData.username}
              onChange={handleChange}
              className="bg-gray-700 border border-gray-600 w-full p-3 pl-10 rounded-lg focus:outline-none focus:border-sky-500 transition-colors"
              required
            />
          </div>
          
          <div className="relative">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-gray-500">
              <FaEnvelope />
            </div>
            <input
              type="email"
              name="email"
              placeholder="Email"
              value={formData.email}
              onChange={handleChange}
              className="bg-gray-700 border border-gray-600 w-full p-3 pl-10 rounded-lg focus:outline-none focus:border-sky-500 transition-colors"
              required
            />
          </div>
          
          <div className="relative">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-gray-500">
              <FaLock />
            </div>
            <input
              type="password"
              name="password"
              placeholder="Password"
              value={formData.password}
              onChange={handleChange}
              className="bg-gray-700 border border-gray-600 w-full p-3 pl-10 rounded-lg focus:outline-none focus:border-sky-500 transition-colors"
              required
            />
          </div>
          
          <div className="relative">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-gray-500">
              <FaUsersCog />
            </div>
            <select 
              name="role" 
              value={formData.role} 
              onChange={handleChange} 
              className="bg-gray-700 border border-gray-600 w-full p-3 pl-10 rounded-lg focus:outline-none focus:border-sky-500 transition-colors appearance-none"
            >
              <option value="Participant">Participant</option>
              <option value="Moderator">Moderator</option>
              <option value="Evaluator">Evaluator</option>
            </select>
          </div>

          <button 
            type="submit" 
            disabled={isLoading}
            className="bg-gradient-to-r from-sky-400 to-blue-500 text-white w-full p-3 rounded-lg font-medium hover:from-sky-500 hover:to-blue-600 transition-all transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-opacity-50 shadow-lg hover:shadow-sky-500/30 disabled:opacity-70"
          >
            {isLoading ? (
              <span className="flex items-center justify-center">
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Processing...
              </span>
            ) : "Create Account"}
          </button>
        </form>

        <div className="text-center text-gray-400 text-sm">
          <p>
            Already have an account?{" "}
            <button 
              onClick={() => router.push("/login")}
              className="text-sky-400 hover:text-sky-300 font-medium transition-colors"
            >
              Sign in
            </button>
          </p>
        </div>
        
        <div className="border-t border-gray-700 pt-5 mt-6">
          <p className="text-xs text-center text-gray-500">
            By registering, you agree to PrepTalk's Terms of Service and Privacy Policy
          </p>
        </div>
      </motion.div>
    </div>
  );
}