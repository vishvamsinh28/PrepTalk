"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { motion } from "framer-motion";
import { FaEnvelope, FaLock } from "react-icons/fa";

export default function LoginPage() {
  const router = useRouter();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
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
      const response = await axios.post("/api/login", formData);
      setSuccess(response.data.message);
      setTimeout(() => {
        router.push("/dashboard");
      }, 1000);
    } catch (err) {
      setError(err.response?.data?.message || "Login failed");
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
              <span className="text-3xl">🔑</span>
            </div>
          </div>
          <h2 className="text-3xl font-bold text-sky-300">Welcome Back</h2>
          <p className="text-gray-400 mt-2">Sign in to continue your PrepTalk journey</p>
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
          
          <div className="flex items-center justify-between">
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                className="form-checkbox h-4 w-4 text-sky-500 rounded focus:ring-sky-500 border-gray-600 bg-gray-700"
              />
              <span className="text-sm text-gray-400">Remember me</span>
            </label>
            <button 
              type="button"
              className="text-sm text-sky-400 hover:text-sky-300 transition-colors"
            >
              Forgot password?
            </button>
          </div>

          <button 
            type="submit"
            disabled={isLoading}
            className="bg-gradient-to-r from-sky-500 to-blue-600 text-white w-full p-3 rounded-lg font-medium hover:from-sky-600 hover:to-blue-700 transition-all transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-opacity-50 shadow-lg hover:shadow-sky-500/30 disabled:opacity-70"
          >
            {isLoading ? (
              <span className="flex items-center justify-center">
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Signing in...
              </span>
            ) : "Sign In"}
          </button>
        </form>

        <div className="text-center text-gray-400 text-sm">
          <p>
            Don&apos;t have an account?{" "}
            <button 
              onClick={() => router.push("/register")}
              className="text-sky-400 hover:text-sky-300 font-medium transition-colors"
            >
              Create account
            </button>
          </p>
        </div>
        
        <div className="relative my-8">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-700"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-4 bg-gray-800 text-gray-500">Or continue with</span>
          </div>
        </div>
        
        <div className="grid grid-cols-3 gap-3">
          <button className="flex justify-center items-center py-2 px-4 bg-gray-700 hover:bg-gray-600 rounded-lg border border-gray-600 transition-colors">
            <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
            </svg>
          </button>
          <button className="flex justify-center items-center py-2 px-4 bg-gray-700 hover:bg-gray-600 rounded-lg border border-gray-600 transition-colors">
            <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm-2.143 16.872H7.372v-7.565h2.485v7.565zM8.57 8.432c-.776 0-1.407-.63-1.407-1.406 0-.776.631-1.407 1.407-1.407.777 0 1.407.631 1.407 1.407 0 .776-.63 1.406-1.407 1.406zm10.857 8.44h-2.485v-3.676c0-1.152-.42-1.784-1.33-1.784-.957 0-1.37.676-1.37 1.784v3.676h-2.485v-7.565h2.485v1.077c.34-.676 1.045-1.241 2.16-1.241 1.53 0 2.954.957 2.954 2.994v4.735z"/>
            </svg>
          </button>
          <button className="flex justify-center items-center py-2 px-4 bg-gray-700 hover:bg-gray-600 rounded-lg border border-gray-600 transition-colors">
            <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 0C5.372 0 0 5.373 0 12s5.372 12 12 12c6.627 0 12-5.373 12-12S18.627 0 12 0zm.14 19.018c-3.868 0-7-3.14-7-7.018 0-3.878 3.132-7.018 7-7.018 1.89 0 3.47.697 4.682 1.829l-1.974 1.978c-.517-.545-1.425-1.18-2.708-1.18-2.31 0-4.187 1.9-4.187 4.39 0 2.492 1.877 4.39 4.187 4.39 2.7 0 3.7-1.928 3.86-2.928h-3.86V10.44h6.396c.058.332.106.648.106 1.073.01 3.9-2.62 7.505-6.5 7.505z"/>
            </svg>
          </button>
        </div>
      </motion.div>
    </div>
  );
}