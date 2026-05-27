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
      <div className="bg-yellow-500/10 border border-yellow-500/40 text-yellow-200 p-4 rounded-lg text-sm">
        Add at least one interviewee to this session before submitting a report.
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5 text-left">
      {message && (
        <div
          className={`flex items-center gap-2 text-sm p-3 rounded-lg ${
            isError
              ? "bg-red-500/10 border border-red-500/50 text-red-300"
              : "bg-green-500/10 border border-green-500/50 text-green-300"
          }`}
        >
          {isError ? <FaExclamationTriangle /> : <FaCheckCircle />}
          {message}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <label className="space-y-2">
          <span className="text-sm text-gray-300">Interviewee</span>
          <select
            name="intervieweeEmail"
            value={formData.intervieweeEmail}
            onChange={updateField}
            className="bg-gray-700 border border-gray-600 text-gray-100 w-full p-3 rounded-lg focus:outline-none focus:border-sky-500"
          >
            {interviewees.map((email) => (
              <option key={email} value={email}>{email}</option>
            ))}
          </select>
        </label>

        <label className="space-y-2">
          <span className="text-sm text-gray-300">Recommendation</span>
          <select
            name="recommendation"
            value={formData.recommendation}
            onChange={updateField}
            className="bg-gray-700 border border-gray-600 text-gray-100 w-full p-3 rounded-lg focus:outline-none focus:border-sky-500"
          >
            <option value="Strong hire">Strong hire</option>
            <option value="Hire">Hire</option>
            <option value="Needs more practice">Needs more practice</option>
            <option value="No hire">No hire</option>
          </select>
        </label>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-5 gap-3">
        {scoreFields.map(([name, label]) => (
          <label key={name} className="space-y-2">
            <span className="block text-xs text-gray-300 min-h-8">{label}</span>
            <select
              name={name}
              value={formData.scores[name]}
              onChange={updateScore}
              className="bg-gray-700 border border-gray-600 text-gray-100 w-full p-3 rounded-lg focus:outline-none focus:border-sky-500"
            >
              {[1, 2, 3, 4, 5].map((score) => (
                <option key={score} value={score}>{score}</option>
              ))}
            </select>
          </label>
        ))}
      </div>

      <textarea
        name="strengths"
        value={formData.strengths}
        onChange={updateField}
        placeholder="Strengths observed"
        className="bg-gray-700 border border-gray-600 text-gray-100 w-full p-3 rounded-lg min-h-24 focus:outline-none focus:border-sky-500"
        required
      />

      <textarea
        name="improvements"
        value={formData.improvements}
        onChange={updateField}
        placeholder="What to improve next"
        className="bg-gray-700 border border-gray-600 text-gray-100 w-full p-3 rounded-lg min-h-24 focus:outline-none focus:border-sky-500"
        required
      />

      <textarea
        name="notes"
        value={formData.notes}
        onChange={updateField}
        placeholder="Private notes or evidence from the interview"
        className="bg-gray-700 border border-gray-600 text-gray-100 w-full p-3 rounded-lg min-h-20 focus:outline-none focus:border-sky-500"
      />

      <button
        type="submit"
        className="bg-gradient-to-r from-sky-500 to-blue-500 hover:from-sky-600 hover:to-blue-600 text-white px-6 py-3 rounded-lg font-medium transition"
      >
        Save Report
      </button>
    </form>
  );
}
