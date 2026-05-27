"use client";

import { useState } from "react";
import { postJson } from "@/lib/clientApi";
import { motion } from "framer-motion";
import { FaCheckCircle, FaClipboard, FaEnvelope, FaExclamationTriangle, FaLink, FaRocket } from "react-icons/fa";

const defaultAgenda = "Warm-up - 5 min\nCore questions - 35 min\nCandidate questions - 10 min\nFeedback - 10 min";

function buildInviteDetails(session) {
  if (!session || typeof window === "undefined") {
    return { inviteUrl: "", emailBody: "", mailtoHref: "" };
  }

  const inviteUrl = session.inviteCode
    ? `${window.location.origin}/session/${session._id}?invite=${session.inviteCode}`
    : `${window.location.origin}/session/${session._id}`;
  const interviewees = session.interviewees || [];
  const scheduledText = session.scheduledAt
    ? `Time: ${new Date(session.scheduledAt).toLocaleString()}\n`
    : "";
  const emailBody = `Hi,\n\nYou are invited to a PrepTalk interview session.\n\nSession: ${session.title}\nRole: ${session.role || "General"}\nLevel: ${session.level || "Entry"}\nType: ${session.interviewType || "Mixed"}\n${scheduledText}Join link: ${inviteUrl}\n\nPlease use the link above to join the session.\n\nThanks.`;

  return {
    inviteUrl,
    emailBody,
    mailtoHref: `mailto:${interviewees.join(",")}?subject=${encodeURIComponent(`PrepTalk interview: ${session.title}`)}&body=${encodeURIComponent(emailBody)}`,
  };
}

export default function CreateSessionForm() {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    interviewees: "",
    role: "",
    level: "Entry",
    interviewType: "Technical",
    skills: "",
    scheduledAt: "",
    durationMinutes: 60,
    agenda: defaultAgenda,
    publicInviteEnabled: true,
  });
  const [message, setMessage] = useState("");
  const [isError, setIsError] = useState(false);
  const [createdSession, setCreatedSession] = useState(null);
  const [copied, setCopied] = useState("");

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    setIsError(false);
    setCopied("");

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
        scheduledAt: formData.scheduledAt,
        durationMinutes: formData.durationMinutes,
        agenda: formData.agenda,
        publicInviteEnabled: formData.publicInviteEnabled,
      };

      const response = await postJson("/api/session", payload);
      setMessage(response.message);
      setIsError(false);
      setCreatedSession(response.session);

      setFormData({
        title: "",
        description: "",
        interviewees: "",
        role: "",
        level: "Entry",
        interviewType: "Technical",
        skills: "",
        scheduledAt: "",
        durationMinutes: 60,
        agenda: defaultAgenda,
        publicInviteEnabled: true,
      });
    } catch (error) {
      setMessage(error.message || "Session creation failed");
      setIsError(true);
    }
  };

  const inviteDetails = buildInviteDetails(createdSession);

  const copyText = async (label, text) => {
    if (!text) return;
    await navigator.clipboard?.writeText(text);
    setCopied(label);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="glass-panel relative z-10 mx-auto w-full rounded-2xl p-6 sm:p-8"
    >
      <div className="mb-8 flex flex-col gap-4 border-b border-white/10 pb-6 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="mb-2 text-sm font-bold uppercase tracking-[0.18em] text-cyan-200">New interview</p>
          <h2 className="text-3xl font-black tracking-tight text-white">Create session</h2>
          <p className="mt-2 text-sm text-slate-300">Set up the interview, schedule, agenda, and invite package.</p>
        </div>
        <div className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl bg-gradient-to-br from-cyan-300 via-emerald-300 to-blue-400">
          <FaRocket className="text-xl text-slate-950" />
        </div>
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

      {createdSession && (
        <div className="mb-6 rounded-2xl border border-emerald-300/25 bg-emerald-300/10 p-5">
          <div className="mb-4 flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
            <div>
              <p className="font-black text-emerald-100">Session ready</p>
              <p className="mt-1 text-sm text-slate-300">Send this invite link to interviewees. The email draft includes the same link.</p>
            </div>
            {copied && <span className="rounded-lg border border-white/10 bg-white/10 px-3 py-2 text-xs font-bold text-white">Copied {copied}</span>}
          </div>

          <div className="grid gap-3 lg:grid-cols-[1fr_auto_auto]">
            <input readOnly value={inviteDetails.inviteUrl} className="field-surface field-control min-w-0 text-sm" />
            <button type="button" onClick={() => copyText("link", inviteDetails.inviteUrl)} className="inline-flex items-center justify-center gap-2 rounded-xl border border-cyan-300/25 bg-cyan-300/10 px-4 py-3 font-bold text-cyan-100">
              <FaLink />
              Copy link
            </button>
            <a href={inviteDetails.mailtoHref} className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-cyan-300 via-emerald-300 to-blue-400 px-4 py-3 font-black text-slate-950">
              <FaEnvelope />
              Send email
            </a>
          </div>

          <div className="mt-4">
            <div className="mb-2 flex items-center justify-between gap-3">
              <p className="text-sm font-bold text-white">Email content</p>
              <button type="button" onClick={() => copyText("email", inviteDetails.emailBody)} className="inline-flex items-center gap-2 rounded-lg border border-white/10 bg-white/10 px-3 py-2 text-xs font-bold text-white">
                <FaClipboard />
                Copy email
              </button>
            </div>
            <textarea readOnly value={inviteDetails.emailBody} className="field-surface field-control min-h-44 text-sm leading-6" />
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="grid gap-5 lg:grid-cols-2">
        <label className="field-group lg:col-span-2">
          <span className="field-label">Session title</span>
          <input
            name="title"
            value={formData.title}
            onChange={handleChange}
            placeholder="Frontend mock interview"
            className="field-surface field-control transition"
            required
          />
        </label>

        <label className="field-group lg:col-span-2">
          <span className="field-label">Description</span>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            placeholder="What this interview will focus on"
            className="field-surface field-control min-h-24 transition"
          ></textarea>
        </label>

        <label className="field-group">
          <span className="field-label">Target role</span>
          <input
            name="role"
            value={formData.role}
            onChange={handleChange}
            placeholder="Frontend Engineer"
            className="field-surface field-control transition"
            required
          />
        </label>

        <label className="field-group">
          <span className="field-label">
            Interviewee emails
            <span className="field-hint">Comma separated</span>
          </span>
          <input
            name="interviewees"
            value={formData.interviewees}
            onChange={handleChange}
            placeholder="candidate@email.com"
            className="field-surface field-control transition"
          />
        </label>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:col-span-2">
          <label className="field-group">
            <span className="field-label">Level</span>
            <select
              name="level"
              value={formData.level}
              onChange={handleChange}
              className="field-surface field-control field-select transition"
            >
              <option value="Entry">Entry</option>
              <option value="Mid">Mid</option>
              <option value="Senior">Senior</option>
            </select>
          </label>

          <label className="field-group">
            <span className="field-label">Interview type</span>
            <select
              name="interviewType"
              value={formData.interviewType}
              onChange={handleChange}
              className="field-surface field-control field-select transition"
            >
              <option value="Technical">Technical</option>
              <option value="Behavioral">Behavioral</option>
              <option value="Mixed">Mixed</option>
            </select>
          </label>
        </div>

        <label className="field-group lg:col-span-2">
          <span className="field-label">
            Skills
            <span className="field-hint">Comma separated</span>
          </span>
          <input
            name="skills"
            value={formData.skills}
            onChange={handleChange}
            placeholder="React, APIs, System Design"
            className="field-surface field-control transition"
          />
        </label>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:col-span-2">
          <label className="field-group">
            <span className="field-label">Schedule</span>
            <input
              type="datetime-local"
              name="scheduledAt"
              value={formData.scheduledAt}
              onChange={handleChange}
              className="field-surface field-control transition"
            />
          </label>

          <label className="field-group">
            <span className="field-label">
              Duration
              <span className="field-hint">Minutes</span>
            </span>
            <input
              type="number"
              min="15"
              step="5"
              name="durationMinutes"
              value={formData.durationMinutes}
              onChange={handleChange}
              className="field-surface field-control transition"
            />
          </label>
        </div>

        <label className="field-group lg:col-span-2">
          <span className="field-label">Session agenda</span>
          <textarea
            name="agenda"
            value={formData.agenda}
            onChange={handleChange}
            placeholder="Warm-up - 5 min"
            className="field-surface field-control min-h-32 transition"
          />
        </label>

        <label className="flex items-center justify-between gap-4 rounded-lg border border-white/10 bg-slate-950/30 p-4 lg:col-span-2">
          <span>
            <span className="block text-sm font-bold text-white">Create public join link</span>
            <span className="text-xs text-slate-400">Useful for email invites and quick access.</span>
          </span>
          <input
            type="checkbox"
            name="publicInviteEnabled"
            checked={formData.publicInviteEnabled}
            onChange={(event) => setFormData({ ...formData, publicInviteEnabled: event.target.checked })}
            className="field-toggle"
          />
        </label>

        <button
          type="submit"
          className="w-full rounded-2xl bg-gradient-to-r from-cyan-300 via-emerald-300 to-blue-400 p-4 font-black text-slate-950 shadow-lg shadow-cyan-500/20 transition hover:-translate-y-0.5 lg:col-span-2"
        >
          Create Session
        </button>
      </form>
    </motion.div>
  );
}
