"use client";

import { useState } from "react";
import { postJson } from "@/lib/clientApi";
import { motion } from "framer-motion";
import InvitePackage from "./InvitePackage";
import { buildSessionPayload, emptySessionForm } from "@/lib/sessionForm";
import SegmentedControl from "./ui/SegmentedControl";

const levels = ["Entry", "Mid", "Senior"];
const interviewTypes = ["Technical", "Behavioral", "Mixed"];

/**
 * Create-session form: title, schedule, agenda, and invitees. On
 * success shows the InvitePackage and notifies the session list.
 */
export default function CreateSessionForm() {
  const [formData, setFormData] = useState(emptySessionForm);
  const [message, setMessage] = useState("");
  const [isError, setIsError] = useState(false);
  const [createdSession, setCreatedSession] = useState(null);

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

    try {
      const payload = buildSessionPayload(formData);

      const response = await postJson("/api/session", payload);
      setMessage(response.message);
      setIsError(false);
      setCreatedSession(response.session);
      window.dispatchEvent(new CustomEvent("preptalk:sessions-updated"));

      setFormData(emptySessionForm);
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

      {createdSession && <InvitePackage session={createdSession} />}

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
