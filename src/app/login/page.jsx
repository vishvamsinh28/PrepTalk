"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { postJson } from "@/lib/clientApi";
import { motion } from "framer-motion";
import { FaEnvelope, FaEye, FaEyeSlash, FaKey, FaLock } from "react-icons/fa";

export default function LoginPage() {
  const router = useRouter();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setIsLoading(true);

    try {
      const response = await postJson("/api/login", formData);
      setSuccess(response.message);
      setTimeout(() => {
        router.push("/dashboard");
      }, 1000);
    } catch (err) {
      setError(err.message || "Login failed");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="app-shell relative flex min-h-screen items-center justify-center overflow-hidden px-5 py-10">
      <div className="soft-grid absolute inset-0 opacity-60"></div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="glass-panel relative z-10 w-full max-w-md space-y-6 rounded-2xl p-8"
      >
        <div className="text-center mb-6">
          <div className="flex justify-center mb-4">
            <div className="grid h-16 w-16 place-items-center rounded-2xl bg-gradient-to-br from-cyan-300 via-emerald-300 to-blue-400 shadow-lg shadow-cyan-500/20">
              <FaKey className="text-2xl text-slate-950" />
            </div>
          </div>
          <h2 className="text-4xl font-black tracking-tight gradient-text">Welcome back</h2>
          <p className="mt-3 text-slate-300">Sign in to continue your PrepTalk journey.</p>
        </div>

        {error && (
          <div className="rounded-2xl border border-red-300/30 bg-red-500/10 p-3 text-sm text-red-100">
            {error}
          </div>
        )}
        
        {success && (
          <div className="rounded-2xl border border-emerald-300/30 bg-emerald-500/10 p-3 text-sm text-emerald-100">
            {success}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="relative">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4 text-cyan-200/80">
              <FaEnvelope />
            </div>
            <input
              type="email"
              name="email"
              placeholder="Email"
              value={formData.email}
              onChange={handleChange}
              className="field-surface w-full rounded-2xl p-4 pl-12 transition"
              required
            />
          </div>
          
          <div className="relative">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4 text-cyan-200/80">
              <FaLock />
            </div>
            <input
              type={showPassword ? "text" : "password"}
              name="password"
              placeholder="Password"
              value={formData.password}
              onChange={handleChange}
              className="field-surface w-full rounded-2xl p-4 pl-12 pr-12 transition"
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword((current) => !current)}
              className="absolute inset-y-0 right-0 flex items-center px-4 text-slate-300 transition hover:text-white"
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? <FaEyeSlash /> : <FaEye />}
            </button>
          </div>
          
          <button 
            type="submit"
            disabled={isLoading}
            className="w-full rounded-2xl bg-gradient-to-r from-cyan-300 via-emerald-300 to-blue-400 p-4 font-black text-slate-950 shadow-lg shadow-cyan-500/20 transition hover:-translate-y-0.5 disabled:opacity-70"
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

        <div className="text-center text-sm text-slate-300">
          <p>
            Don&apos;t have an account?{" "}
            <button 
              onClick={() => router.push("/register")}
              className="font-bold text-cyan-200 transition hover:text-white"
            >
              Create account
            </button>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
