"use client";

import { useState } from "react";
import { postJson } from "@/lib/clientApi";
import { motion } from "framer-motion";

const defaultAgenda = "Warm-up - 5 min\nCore questions - 35 min\nCandidate questions - 10 min\nFeedback - 10 min";
const levels = ["Entry", "Mid", "Senior"];
const interviewTypes = ["Technical", "Behavioral", "Mixed"];

function buildInviteDetails(session) {
  if (!session || typeof window === "undefined") {
    return { inviteUrl: "", emailBody: "", mailtoHref: "" };
  }

  const inviteUrl = `${window.location.origin}/session/${session._id}`;
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
  });
  const [message, setMessage] = useState("");
  const [isError, setIsError] = useState(false);
  const [createdSession, setCreatedSession] = useState(null);
  const [copied, setCopied] = useState("");

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const autoGrow = (event, maxHeight = 220) => {
    event.currentTarget.style.height = "auto";
    const nextHeight = Math.min(event.currentTarget.scrollHeight, maxHeight);
    event.currentTarget.style.height = `${nextHeight}px`;
    event.currentTarget.style.overflowY = event.currentTarget.scrollHeight > maxHeight ? "auto" : "hidden";
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
      };

      const response = await postJson("/api/session", payload);
      setMessage(response.message);
      setIsError(false);
      setCreatedSession(response.session);
      window.dispatchEvent(new CustomEvent("preptalk:sessions-updated"));

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
      className="w-full"
    >
      <div className="mb-8 border-b border-rule pb-6">
        <p className="app-eyebrow">New interview</p>
        <h2 className="app-h2 mt-3">Create session</h2>
        <p className="mt-3 max-w-[58ch] text-sm leading-[1.7] text-ink-soft">
          Set up the interview, schedule, agenda, and invite package.
        </p>
      </div>

      {message && (
        <p
          role={isError ? "alert" : "status"}
          className={`mb-6 border-l-2 px-4 py-3 text-sm ${
            isError
              ? "border-accent bg-accent/5 text-accent"
              : "border-emerald-700 bg-emerald-50 text-emerald-700"
          }`}
        >
          {message}
        </p>
      )}

      {createdSession && (
        <div className="mb-8 border-l-2 border-emerald-700 bg-emerald-50/60 px-5 py-5">
          <div className="flex flex-wrap items-baseline justify-between gap-3">
            <p className="app-h3">Session ready</p>
            {copied && <span className="app-eyebrow">Copied {copied}</span>}
          </div>
          <p className="mt-2 max-w-[58ch] text-sm leading-[1.7] text-ink-soft">
            Send this link only to assigned interviewees — anyone else is blocked from
            opening the room.
          </p>

          <div className="mt-4 flex flex-wrap items-center gap-3">
            <input
              readOnly
              value={inviteDetails.inviteUrl}
              className="field-surface min-w-0 flex-1 rounded-[4px] px-3 py-2.5 text-sm"
            />
            <a href={inviteDetails.mailtoHref} className="btn-ink shrink-0">
              Send email
            </a>
          </div>

          <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2 text-[13px]">
            <button
              type="button"
              onClick={() => copyText("link", inviteDetails.inviteUrl)}
              className="text-ink-soft underline decoration-rule decoration-1 underline-offset-4 transition-colors hover:text-ink hover:decoration-ink"
            >
              Copy link
            </button>
            <button
              type="button"
              onClick={() => copyText("email", inviteDetails.emailBody)}
              className="text-ink-soft underline decoration-rule decoration-1 underline-offset-4 transition-colors hover:text-ink hover:decoration-ink"
            >
              Copy email text
            </button>
          </div>

          <details className="mt-4">
            <summary className="app-eyebrow cursor-pointer">Preview email</summary>
            <textarea
              readOnly
              value={inviteDetails.emailBody}
              className="field-surface mt-3 min-h-44 w-full rounded-[4px] p-3 text-sm leading-6"
            />
          </details>
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
            onChange={(event) => {
              handleChange(event);
              autoGrow(event);
            }}
            placeholder="What this interview will focus on"
            className="field-surface field-control max-h-56 min-h-24 transition"
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
            <SegmentedControl
              name="level"
              value={formData.level}
              options={levels}
              onChange={(value) => setFormData({ ...formData, level: value })}
            />
          </label>

          <label className="field-group">
            <span className="field-label">Interview type</span>
            <SegmentedControl
              name="interviewType"
              value={formData.interviewType}
              options={interviewTypes}
              onChange={(value) => setFormData({ ...formData, interviewType: value })}
            />
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
            onChange={(event) => {
              handleChange(event);
              autoGrow(event, 260);
            }}
            placeholder="Warm-up - 5 min"
            className="field-surface field-control max-h-64 min-h-32 transition"
          />
        </label>

        <div className="mt-3 border-t border-rule pt-6 lg:col-span-2">
          <button type="submit" className="btn-ink w-full">
            Create session
          </button>
        </div>
      </form>
    </motion.div>
  );
}

function SegmentedControl({ name, value, options, onChange }) {
  return (
    <div className="inline-flex w-full overflow-hidden rounded-[4px] border border-rule">
      {options.map((option, index) => {
        const isActive = value === option;
        return (
          <button
            key={option}
            type="button"
            aria-pressed={isActive}
            onClick={() => onChange(option)}
            className={`min-h-11 flex-1 px-3 text-sm transition-colors ${
              index > 0 ? "border-l border-rule" : ""
            } ${
              isActive
                ? "bg-ink font-medium text-canvas"
                : "bg-transparent text-ink-soft hover:bg-black/[0.03] hover:text-ink"
            }`}
          >
            {option}
          </button>
        );
      })}
      <input type="hidden" name={name} value={value} readOnly />
    </div>
  );
}
