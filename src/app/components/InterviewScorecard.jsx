"use client";

import { useMemo, useState } from "react";
import { postJson } from "@/lib/clientApi";
import { FaCheckCircle, FaChevronDown, FaExclamationTriangle } from "react-icons/fa";

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
  const [savedReport, setSavedReport] = useState(null);
  const [summaryLoading, setSummaryLoading] = useState(false);
  const [openSelect, setOpenSelect] = useState("");

  const updateField = (event) => {
    setFormData((current) => ({ ...current, [event.target.name]: event.target.value }));
  };

  const updateScore = (name, value) => {
    setFormData((current) => ({
      ...current,
      scores: { ...current.scores, [name]: value },
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setMessage("");
    setIsError(false);

    try {
      const response = await postJson("/api/reports", { sessionId, ...formData });
      setSavedReport(response.report);
      setMessage("Interview report saved.");
      setIsError(false);
    } catch (error) {
      setMessage(error.message || "Could not save interview report.");
      setIsError(true);
    }
  };

  const generateSummary = async () => {
    if (!savedReport?._id) return;
    setSummaryLoading(true);
    setMessage("");
    try {
      const response = await postJson("/api/reports/summary", { reportId: savedReport._id });
      setSavedReport(response.report);
      setMessage("AI feedback summary generated.");
      setIsError(false);
    } catch (error) {
      setMessage(error.message || "Could not generate summary.");
      setIsError(true);
    } finally {
      setSummaryLoading(false);
    }
  };

  if (interviewees.length === 0) {
    return (
      <div className="rounded-2xl border border-amber-600/40 bg-amber-50 p-4 text-sm text-amber-700">
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
              : "border border-emerald-600/40 bg-emerald-500/10 text-emerald-700"
          }`}
        >
          {isError ? <FaExclamationTriangle /> : <FaCheckCircle />}
          {message}
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <label className="field-group">
          <span className="field-label">Interviewee</span>
          <ScorecardSelect
            id="intervieweeEmail"
            value={formData.intervieweeEmail}
            options={interviewees}
            openSelect={openSelect}
            setOpenSelect={setOpenSelect}
            onChange={(value) => setFormData((current) => ({ ...current, intervieweeEmail: value }))}
          />
        </label>

        <label className="field-group">
          <span className="field-label">Recommendation</span>
          <ScorecardSelect
            id="recommendation"
            value={formData.recommendation}
            options={["Strong hire", "Hire", "Needs more practice", "No hire"]}
            openSelect={openSelect}
            setOpenSelect={setOpenSelect}
            onChange={(value) => setFormData((current) => ({ ...current, recommendation: value }))}
          />
        </label>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-5">
        {scoreFields.map(([name, label]) => (
          <label key={name} className="rounded-lg border border-rule bg-white p-3">
            <span className="field-label min-h-8 text-xs">{label}</span>
            <ScorecardSelect
              id={name}
              value={formData.scores[name]}
              options={[1, 2, 3, 4, 5]}
              openSelect={openSelect}
              setOpenSelect={setOpenSelect}
              onChange={(value) => updateScore(name, value)}
              compact
            />
          </label>
        ))}
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <label className="field-group">
          <span className="field-label">Strengths</span>
          <textarea
            name="strengths"
            value={formData.strengths}
            onChange={updateField}
            placeholder="Strengths observed"
            className="field-surface field-control min-h-32 transition"
            required
          />
        </label>

        <label className="field-group">
          <span className="field-label">Next improvements</span>
          <textarea
            name="improvements"
            value={formData.improvements}
            onChange={updateField}
            placeholder="What to improve next"
            className="field-surface field-control min-h-32 transition"
            required
          />
        </label>
      </div>

      <label className="field-group">
        <span className="field-label">Private notes</span>
        <textarea
          name="notes"
          value={formData.notes}
          onChange={updateField}
          placeholder="Private notes or evidence from the interview"
          className="field-surface field-control min-h-24 transition"
        />
      </label>

      <div className="flex flex-wrap gap-3">
        <button
          type="submit"
          className="rounded-xl bg-ink px-7 py-4 font-semibold text-canvas shadow-lg transition hover:-translate-y-0.5"
        >
          Save Report
        </button>
        <button
          type="button"
          onClick={generateSummary}
          disabled={!savedReport?._id || summaryLoading}
          className="rounded-xl border border-rule bg-black/5 px-7 py-4 font-bold text-ink transition disabled:cursor-not-allowed disabled:opacity-50"
        >
          {summaryLoading ? "Generating summary..." : "Generate AI Summary"}
        </button>
      </div>

      {savedReport?.aiSummary && (
        <div className="rounded-2xl border border-accent bg-accent/10 p-5">
          <p className="mb-2 text-lg font-semibold text-accent">AI feedback summary</p>
          <p className="whitespace-pre-wrap leading-7 text-ink">{savedReport.aiSummary}</p>
          {savedReport.actionItems?.length > 0 && (
            <ul className="mt-4 space-y-2 text-sm text-ink">
              {savedReport.actionItems.map((item) => <li key={item}>- {item}</li>)}
            </ul>
          )}
        </div>
      )}
    </form>
  );
}

function ScorecardSelect({ id, value, options, onChange, openSelect, setOpenSelect, compact = false }) {
  const isOpen = openSelect === id;

  const chooseValue = (nextValue) => {
    onChange(nextValue);
    setOpenSelect("");
  };

  return (
    <div className={compact ? "relative mt-2" : "relative"}>
      <button
        type="button"
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        onClick={() => setOpenSelect(isOpen ? "" : id)}
        onBlur={(event) => {
          if (!event.currentTarget.parentElement?.contains(event.relatedTarget)) {
            setOpenSelect("");
          }
        }}
        className={`field-surface field-control flex items-center justify-between gap-3 text-left transition ${
          compact ? "min-h-11 py-2.5" : ""
        }`}
      >
        <span className="min-w-0 truncate">{value}</span>
        <FaChevronDown className={`shrink-0 text-xs text-accent transition ${isOpen ? "rotate-180" : ""}`} />
      </button>

      {isOpen && (
        <div
          role="listbox"
          tabIndex={-1}
          className="absolute left-0 right-0 top-[calc(100%+0.35rem)] z-50 overflow-hidden rounded-lg border border-accent bg-white shadow-2xl"
        >
          {options.map((option) => {
            const isSelected = option === value;

            return (
              <button
                key={option}
                type="button"
                role="option"
                aria-selected={isSelected}
                onMouseDown={(event) => event.preventDefault()}
                onClick={() => chooseValue(option)}
                className={`block w-full px-4 py-3 text-left text-sm font-bold transition ${
                  isSelected
                    ? "bg-accent/10 text-accent"
                    : "text-ink hover:bg-black/5 hover:text-ink"
                }`}
              >
                {option}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
