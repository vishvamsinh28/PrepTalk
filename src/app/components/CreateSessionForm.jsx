"use client";

import { useState } from "react";
import { postJson } from "@/lib/clientApi";
import { motion } from "framer-motion";
import { FaRocket, FaCheckCircle, FaExclamationTriangle } from "react-icons/fa";

export default function CreateSessionForm() {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    interviewees: "",
    role: "",
    level: "Entry",
    interviewType: "Technical",
    skills: "",
  });
  const [message, setMessage] = useState("");
  const [isError, setIsError] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    setIsError(false);

    try {
      const payload = {
        title: formData.title,
        description: formData.description,
        role: formData.role,
        level: formData.level,
        interviewType: formData.interviewType,
        skills: formData.skills
          .split(",")
          .map((skill) => skill.trim())
          .filter(Boolean),
        interviewees: formData.interviewees
          .split(",")
          .map((email) => email.trim())
          .filter(Boolean),
      };

      const response = await postJson("/api/session", payload);
      setMessage(response.message);
      setIsError(false);

      setFormData({
        title: "",
        description: "",
        interviewees: "",
        role: "",
        level: "Entry",
        interviewType: "Technical",
        skills: "",
      });
    } catch (error) {
      setMessage(error.message || "Session creation failed");
      setIsError(true);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="glass-panel relative z-10 mx-auto w-full max-w-2xl rounded-[2rem] p-8"
    >
      <div className="text-center mb-6">
        <div className="mb-4 inline-grid h-14 w-14 place-items-center rounded-3xl bg-gradient-to-br from-rose-400 via-amber-300 to-cyan-300">
          <FaRocket className="text-xl text-slate-950" />
        </div>
        <h2 className="mb-2 text-3xl font-black tracking-tight text-white">Create New Session</h2>
        <p className="text-sm text-slate-300">Invite interviewees and start a practice session.</p>
      </div>

      {message && (
        <div
          className={`mb-4 flex items-center rounded-2xl p-3 text-sm ${
            isError
              ? "border border-red-300/30 bg-red-500/10 text-red-100"
              : "border border-emerald-300/30 bg-emerald-500/10 text-emerald-100"
          }`}
        >
          {isError ? (
            <FaExclamationTriangle className="mr-2" />
          ) : (
            <FaCheckCircle className="mr-2" />
          )}
          {message}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        <input
          name="title"
          value={formData.title}
          onChange={handleChange}
          placeholder="Session Title"
          className="field-surface w-full rounded-2xl p-4 transition"
          required
        />

        <textarea
          name="description"
          value={formData.description}
          onChange={handleChange}
          placeholder="Session Description"
          className="field-surface min-h-28 w-full rounded-2xl p-4 transition"
        ></textarea>

        <input
          name="role"
          value={formData.role}
          onChange={handleChange}
          placeholder="Target role (Frontend Engineer, Product Manager...)"
          className="field-surface w-full rounded-2xl p-4 transition"
          required
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <select
            name="level"
            value={formData.level}
            onChange={handleChange}
            className="field-surface w-full rounded-2xl p-4 transition"
          >
            <option value="Entry">Entry</option>
            <option value="Mid">Mid</option>
            <option value="Senior">Senior</option>
          </select>

          <select
            name="interviewType"
            value={formData.interviewType}
            onChange={handleChange}
            className="field-surface w-full rounded-2xl p-4 transition"
          >
            <option value="Technical">Technical</option>
            <option value="Behavioral">Behavioral</option>
            <option value="Mixed">Mixed</option>
          </select>
        </div>

        <input
          name="skills"
          value={formData.skills}
          onChange={handleChange}
          placeholder="Skills to assess (React, APIs, System Design)"
          className="field-surface w-full rounded-2xl p-4 transition"
        />

        <input
          name="interviewees"
          value={formData.interviewees}
          onChange={handleChange}
          placeholder="Interviewee emails (comma separated)"
          className="field-surface w-full rounded-2xl p-4 transition"
        />

        <button
          type="submit"
          className="w-full rounded-2xl bg-gradient-to-r from-rose-400 via-amber-300 to-cyan-300 p-4 font-black text-slate-950 shadow-lg shadow-cyan-500/20 transition hover:-translate-y-0.5"
        >
          Create Session
        </button>
      </form>
    </motion.div>
  );
}
