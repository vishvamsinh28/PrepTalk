"use client";

import { useMemo, useState } from "react";
import { postJson } from "@/lib/clientApi";
import { FaCheckCircle, FaExclamationTriangle } from "react-icons/fa";

const scoreFields = [
  ["communication", "Communication"],
  ["technicalDepth", "Technical depth"],
  ["problemSolving", "Problem solving"],
  ["confidence", "Confidence"],
  ["roleFit", "Role fit"],
];

export default function InterviewScorecard({ sessionId, session }) {
  const interviewees = useMemo(() => session?.interviewees || [], [session]);
  const [formData, setFormData] = useState({
    intervieweeEmail: interviewees[0] || "",
    recommendation: "Hire",
    scores: {
      communication: 3,
      technicalDepth: 3,
      problemSolving: 3,
      confidence: 3,
      roleFit: 3,
    },
    strengths: "",
    improvements: "",
    notes: "",
  });
  const [message, setMessage] = useState("");
  const [isError, setIsError] = useState(false);

  const updateField = (event) => {
    setFormData((current) => ({ ...current, [event.target.name]: event.target.value }));
  };

  const updateScore = (event) => {
    const value = Number(event.target.value);
    setFormData((current) => ({
      ...current,
      scores: { ...current.scores, [event.target.name]: value },
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setMessage("");
    setIsError(false);

    try {
      await postJson("/api/reports", { sessionId, ...formData });
      setMessage("Interview report saved.");
      setIsError(false);
    } catch (error) {
      setMessage(error.message || "Could not save interview report.");
      setIsError(true);
    }
  };

  if (interviewees.length === 0) {
    return (
      <div className="rounded-2xl border border-amber-300/30 bg-amber-300/10 p-4 text-sm text-amber-100">
        Add at least one interviewee to this session before submitting a report.
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 text-left">
      {message && (
        <div
          className={`flex items-center gap-2 rounded-2xl p-3 text-sm ${
            isError
              ? "border border-red-300/30 bg-red-500/10 text-red-100"
              : "border border-emerald-300/30 bg-emerald-500/10 text-emerald-100"
          }`}
        >
          {isError ? <FaExclamationTriangle /> : <FaCheckCircle />}
          {message}
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <label className="space-y-2">
          <span className="text-sm font-bold text-slate-200">Interviewee</span>
          <select
            name="intervieweeEmail"
            value={formData.intervieweeEmail}
            onChange={updateField}
            className="field-surface w-full rounded-2xl p-4 transition"
          >
            {interviewees.map((email) => (
              <option key={email} value={email}>{email}</option>
            ))}
          </select>
        </label>

        <label className="space-y-2">
          <span className="text-sm font-bold text-slate-200">Recommendation</span>
          <select
            name="recommendation"
            value={formData.recommendation}
            onChange={updateField}
            className="field-surface w-full rounded-2xl p-4 transition"
          >
            <option value="Strong hire">Strong hire</option>
            <option value="Hire">Hire</option>
            <option value="Needs more practice">Needs more practice</option>
            <option value="No hire">No hire</option>
          </select>
        </label>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-5">
        {scoreFields.map(([name, label]) => (
          <label key={name} className="rounded-3xl border border-white/10 bg-slate-950/30 p-3">
            <span className="block min-h-8 text-xs font-bold text-slate-300">{label}</span>
            <select
              name={name}
              value={formData.scores[name]}
              onChange={updateScore}
              className="field-surface mt-2 w-full rounded-2xl p-3 transition"
            >
              {[1, 2, 3, 4, 5].map((score) => (
                <option key={score} value={score}>{score}</option>
              ))}
            </select>
          </label>
        ))}
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <label className="space-y-2">
          <span className="text-sm font-bold text-slate-200">Strengths</span>
          <textarea
            name="strengths"
            value={formData.strengths}
            onChange={updateField}
            placeholder="Strengths observed"
            className="field-surface min-h-32 w-full rounded-2xl p-4 transition"
            required
          />
        </label>

        <label className="space-y-2">
          <span className="text-sm font-bold text-slate-200">Next improvements</span>
          <textarea
            name="improvements"
            value={formData.improvements}
            onChange={updateField}
            placeholder="What to improve next"
            className="field-surface min-h-32 w-full rounded-2xl p-4 transition"
            required
          />
        </label>
      </div>

      <label className="block space-y-2">
        <span className="text-sm font-bold text-slate-200">Private notes</span>
        <textarea
          name="notes"
          value={formData.notes}
          onChange={updateField}
          placeholder="Private notes or evidence from the interview"
          className="field-surface min-h-24 w-full rounded-2xl p-4 transition"
        />
      </label>

      <button
        type="submit"
        className="rounded-full bg-gradient-to-r from-rose-400 via-amber-300 to-cyan-300 px-7 py-4 font-black text-slate-950 shadow-lg shadow-cyan-500/20 transition hover:-translate-y-0.5"
      >
        Save Report
      </button>
    </form>
  );
}
