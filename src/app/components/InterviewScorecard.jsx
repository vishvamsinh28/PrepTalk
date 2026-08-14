"use client";

import { useMemo, useState } from "react";
import { postJson } from "@/lib/clientApi";
import ScorecardSelect from "./ui/ScorecardSelect";

/** @file The interviewer's scorecard, rendered in-room at the bottom of a session. */

/**
 * The five score dimensions as `[key, label]`.
 * Keys must match `SCORE_KEYS` in the reports route — the server rejects the
 * whole submission if any is missing.
 */
const scoreFields = [
  ["communication", "Communication"],
  ["technicalDepth", "Technical depth"],
  ["problemSolving", "Problem solving"],
  ["confidence", "Confidence"],
  ["roleFit", "Role fit"],
];

/**
 * Scorecard for five dimensions, a recommendation, notes, and an AI summary.
 * Scores default to 3 (mid-scale) so a submitted card always carries a complete
 * set — the API rejects partial scores outright rather than defaulting them.
 * The AI summary is a two-step flow by design: the report must be saved first,
 * since `/api/reports/summary` works from the stored record rather than the
 * form, which is what keeps a candidate's feedback un-steerable from the client.
 * `openSelect` is held here and passed down so only one `ScorecardSelect`
 * dropdown can be open at a time.
 * Submitting twice edits rather than duplicates — the endpoint upserts on
 * (session, interviewee).
 * @param {object} props - Component props.
 * @param {string} props.sessionId - Session being scored.
 * @param {object} props.session - Serialized session, supplying the interviewee list.
 * @returns {JSX.Element} The scorecard form.
 */
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

  /**
   * Controlled-input handler for top-level fields, keyed on `name`.
   * @param {React.ChangeEvent} event - Change event.
   * @returns {void}
   */
  const updateField = (event) => {
    setFormData((current) => ({ ...current, [event.target.name]: event.target.value }));
  };

  /**
   * Updates one score dimension, leaving the other four alone.
   * @param {string} name - Score key, e.g. `"communication"`.
   * @param {number} value - New score, 1-5.
   * @returns {void}
   */
  const updateScore = (name, value) => {
    setFormData((current) => ({
      ...current,
      scores: { ...current.scores, [name]: value },
    }));
  };

  /**
   * Saves the scorecard and keeps the returned report for the summary step.
   * The form is not cleared on success, so the interviewer can revise and
   * resubmit — the endpoint upserts, so that edits rather than duplicates.
   * @param {React.FormEvent} event - Submit event.
   * @returns {Promise<void>}
   */
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
      <div className="rounded-[4px] border border-amber-600/40 bg-amber-50 p-4 text-sm text-amber-700">
        Add at least one interviewee to this session before submitting a report.
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 text-left">
      {message && (
        <p
          role={isError ? "alert" : "status"}
          className={`border-l-2 px-4 py-3 text-sm ${
            isError
              ? "border-accent bg-accent/5 text-accent"
              : "border-emerald-700 bg-emerald-50 text-emerald-700"
          }`}
        >
          {message}
        </p>
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

      <div className="grid grid-cols-1 gap-x-6 gap-y-4 sm:grid-cols-5">
        {scoreFields.map(([name, label]) => (
          <label key={name} className="block">
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
          className="rounded-[4px] bg-ink px-7 py-4 font-semibold text-canvas shadow-lg transition hover:-translate-y-0.5"
        >
          Save Report
        </button>
        <button
          type="button"
          onClick={generateSummary}
          disabled={!savedReport?._id || summaryLoading}
          className="rounded-[4px] border border-rule bg-black/5 px-7 py-4 font-bold text-ink transition disabled:cursor-not-allowed disabled:opacity-50"
        >
          {summaryLoading ? "Generating summary..." : "Generate AI Summary"}
        </button>
      </div>

      {savedReport?.aiSummary && (
        <div className="rounded-[4px] border border-accent bg-accent/10 p-5">
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
