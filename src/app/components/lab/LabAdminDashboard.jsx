"use client";

import { useEffect, useState } from "react";
import { FaClipboard, FaEnvelope, FaPlus, FaRocket, FaTrash } from "react-icons/fa";
import { deleteJson, getJson, postJson } from "@/lib/clientApi";

const starterProblem = {
  title: "",
  difficulty: "Easy",
  timeLimitMinutes: 10,
  points: 100,
  prompt: "",
  starterCode: "function solve(input) {\n  return null;\n}",
  tests: [
    { name: "sample", inputJson: "[1,2,3]", expectedJson: "6", visible: true },
    { name: "hidden", inputJson: "[4,5]", expectedJson: "9", visible: false },
  ],
};

export default function LabAdminDashboard() {
  const [assessments, setAssessments] = useState([]);
  const [form, setForm] = useState({
    title: "",
    description: "",
    candidates: "",
    durationMinutes: 45,
    problems: [starterProblem],
  });
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const totalProblemMinutes = form.problems.reduce(
    (total, problem) => total + toWholeNumber(problem.timeLimitMinutes, 0),
    0
  );
  const assignedCandidateCount = form.candidates.split(",").map((email) => email.trim()).filter(Boolean).length;
  const assessmentMinutes = toWholeNumber(form.durationMinutes, 0);
  const timerStatus = totalProblemMinutes === assessmentMinutes ? "Matches" : "Does not match";
  const totalPoints = form.problems.reduce((total, problem) => total + toWholeNumber(problem.points, 0), 0);
  const allDraftTests = form.problems.flatMap((problem) => problem.tests || []);
  const visibleDraftTests = allDraftTests.filter((test) => test.visible).length;
  const hiddenDraftTests = allDraftTests.length - visibleDraftTests;

  useEffect(() => {
    loadAssessments();
  }, []);

  const loadAssessments = async () => {
    const data = await getJson("/api/lab/assessments");
    setAssessments(data.assessments || []);
  };

  const createAssessment = async (event) => {
    event.preventDefault();
    setMessage("");
    setError("");

    try {
      const validationError = validateAssessmentForm(form);
      if (validationError) {
        setError(validationError);
        return;
      }

      setIsSubmitting(true);
      const payload = {
        ...form,
        candidates: form.candidates.split(",").map((email) => email.trim()).filter(Boolean),
        durationMinutes: toWholeNumber(form.durationMinutes, 45),
        problems: form.problems.map((problem) => ({
          ...problem,
          points: toWholeNumber(problem.points, 100),
          timeLimitMinutes: toWholeNumber(problem.timeLimitMinutes, 10),
        })),
      };
      const data = await postJson("/api/lab/assessments", payload);
      setMessage(data.message || "Assessment created");
      setForm({ title: "", description: "", candidates: "", durationMinutes: 45, problems: [starterProblem] });
      await loadAssessments();
    } catch (err) {
      setError(err.message || "Could not create assessment");
    } finally {
      setIsSubmitting(false);
    }
  };

  const updateProblem = (index, patch) => {
    setForm((previous) => ({
      ...previous,
      problems: previous.problems.map((problem, problemIndex) => (
        problemIndex === index ? { ...problem, ...patch } : problem
      )),
    }));
  };

  const updateTest = (problemIndex, testIndex, patch) => {
    setForm((previous) => ({
      ...previous,
      problems: previous.problems.map((problem, currentProblemIndex) => (
        currentProblemIndex === problemIndex
          ? {
              ...problem,
              tests: problem.tests.map((test, currentTestIndex) => (
                currentTestIndex === testIndex ? { ...test, ...patch } : test
              )),
            }
          : problem
      )),
    }));
  };

  const addProblem = () => {
    setForm((previous) => ({
      ...previous,
      problems: [...previous.problems, { ...starterProblem, tests: starterProblem.tests.map((test) => ({ ...test })) }],
    }));
  };

  const removeProblem = (problemIndex) => {
    setForm((previous) => ({
      ...previous,
      problems: previous.problems.filter((_, index) => index !== problemIndex),
    }));
  };

  const addTest = (problemIndex) => {
    updateProblem(problemIndex, {
      tests: [
        ...form.problems[problemIndex].tests,
        { name: "case", inputJson: "[]", expectedJson: "null", visible: true },
      ],
    });
  };

  const removeTest = (problemIndex, testIndex) => {
    updateProblem(problemIndex, {
      tests: form.problems[problemIndex].tests.filter((_, index) => index !== testIndex),
    });
  };

  const deleteAssessment = async (assessmentId) => {
    setMessage("");
    setError("");

    try {
      const data = await deleteJson(`/api/lab/assessments/${assessmentId}`);
      setMessage(data.message || "Assessment deleted");
      await loadAssessments();
    } catch (err) {
      setError(err.message || "Could not delete assessment");
    }
  };

  return (
    <div className="app-shell relative min-h-screen overflow-hidden px-5 pb-16 pt-24">
      <div className="soft-grid absolute inset-0 z-0 opacity-60" />
      <div className="relative z-10 mx-auto max-w-7xl">
        <header className="mb-8 rounded-xl border border-white/10 bg-slate-950/45 p-6 shadow-xl shadow-black/20">
          <div>
            <p className="mb-2 text-xs font-bold uppercase tracking-[0.2em] text-cyan-200">PrepTalk Lab</p>
            <h1 className="text-4xl font-black tracking-tight gradient-text sm:text-5xl">Lab assessments</h1>
            <p className="mt-3 max-w-2xl text-slate-300">{assessments.length} assessments created.</p>
          </div>
        </header>

        <div className="grid gap-6 xl:grid-cols-[minmax(0,1.05fr)_minmax(22rem,0.8fr)]">
          <form onSubmit={createAssessment} noValidate className="rounded-xl border border-white/10 bg-slate-950/50 p-5 shadow-xl shadow-black/20">
            <div className="mb-5 flex items-center justify-between border-b border-white/10 pb-4">
              <div>
                <p className="text-sm font-bold uppercase tracking-[0.18em] text-amber-200">Create</p>
                <h2 className="text-2xl font-black">Assessment</h2>
              </div>
              <FaRocket className="text-2xl text-cyan-200" />
            </div>

            {message && <p className="mb-4 rounded-lg border border-emerald-300/25 bg-emerald-300/10 p-3 text-sm text-emerald-100">{message}</p>}
            {error && <p className="mb-4 rounded-lg border border-rose-300/25 bg-rose-400/10 p-3 text-sm text-rose-100">{error}</p>}

            <div className="grid gap-5">
              <section className="rounded-xl border border-white/10 bg-white/5 p-4">
                <div className="mb-4">
                  <p className="text-sm font-black text-white">Assessment setup</p>
                  <p className="mt-1 text-xs text-slate-400">Title, instructions, candidates, and total time.</p>
                </div>
                <div className="grid gap-4">
                  <label className="field-group">
                    <span className="field-label">Assessment title</span>
                    <input required value={form.title} onChange={(event) => setForm({ ...form, title: event.target.value })} placeholder="Frontend screening round" className="field-surface field-control" />
                  </label>
                  <label className="field-group">
                    <span className="field-label">Candidate instructions</span>
                    <textarea value={form.description} onChange={(event) => setForm({ ...form, description: event.target.value })} placeholder="Instructions candidates will read before starting" className="field-surface field-control min-h-24" />
                  </label>
                </div>
              </section>

              <section className="rounded-xl border border-white/10 bg-white/5 p-4">
                <div className="mb-4">
                  <p className="text-sm font-black text-white">Assignment and timer</p>
                  <p className="mt-1 text-xs text-slate-400">Only registered Interviewee emails are accepted.</p>
                </div>
                <div className="grid gap-4 md:grid-cols-2">
                <label className="field-group">
                  <span className="field-label">
                    Assign candidates
                    <span className="field-hint">Comma separated emails</span>
                  </span>
                  <input value={form.candidates} onChange={(event) => setForm({ ...form, candidates: event.target.value })} placeholder="candidate@email.com, another@email.com" className="field-surface field-control" />
                </label>
                <label className="field-group">
                  <span className="field-label">
                    Assessment timer
                    <span className="field-hint">Whole minutes</span>
                  </span>
                  <input type="number" inputMode="numeric" min="1" max="120" step="1" value={form.durationMinutes} onChange={(event) => setForm({ ...form, durationMinutes: sanitizeWholeNumberInput(event.target.value) })} className="field-surface field-control" />
                </label>
                </div>
              </section>

              {form.problems.map((problem, problemIndex) => (
                <section key={problemIndex} className="overflow-hidden rounded-xl border border-cyan-300/15 bg-[#0b1423]/80 shadow-xl shadow-black/20">
                  <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 bg-cyan-300/10 px-4 py-3">
                    <div>
                      <h3 className="font-black text-white">Coding problem {problemIndex + 1}</h3>
                      <p className="mt-1 text-xs text-slate-300">{problem.tests.length} test cases · {problem.timeLimitMinutes || 0} min · {problem.points || 0} pts</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button type="button" onClick={() => addTest(problemIndex)} className="rounded-md border border-white/10 bg-white/8 px-3 py-2 text-xs font-bold text-white">Add test case</button>
                      {form.problems.length > 1 && (
                        <button type="button" onClick={() => removeProblem(problemIndex)} className="inline-flex items-center gap-2 rounded-md border border-rose-300/25 bg-rose-400/10 px-3 py-2 text-xs font-bold text-rose-100">
                          <FaTrash />
                          Delete problem
                        </button>
                      )}
                    </div>
                  </div>
                  <div className="grid gap-4 p-4">
                    <label className="field-group">
                      <span className="field-label">Problem title</span>
                      <input required value={problem.title} onChange={(event) => updateProblem(problemIndex, { title: event.target.value })} placeholder="Pair Sum Signal" className="field-surface field-control" />
                    </label>
                    <label className="field-group">
                      <span className="field-label">Problem statement</span>
                      <textarea required value={problem.prompt} onChange={(event) => updateProblem(problemIndex, { prompt: event.target.value })} placeholder="Describe what the solve function should return" className="field-surface field-control min-h-24" />
                    </label>
                    <label className="field-group">
                      <span className="field-label">Starter code</span>
                      <textarea value={problem.starterCode} onChange={(event) => updateProblem(problemIndex, { starterCode: event.target.value })} className="field-surface field-control min-h-32 font-mono" />
                    </label>
                    <div className="grid gap-3 md:grid-cols-3">
                      <label className="field-group">
                        <span className="field-label">Difficulty</span>
                        <SegmentedControl value={problem.difficulty} options={["Easy", "Medium", "Hard"]} onChange={(value) => updateProblem(problemIndex, { difficulty: value })} />
                      </label>
                      <label className="field-group">
                        <span className="field-label">
                          Problem timer
                          <span className="field-hint">Whole minutes</span>
                        </span>
                        <input type="number" inputMode="numeric" min="1" step="1" value={problem.timeLimitMinutes} onChange={(event) => updateProblem(problemIndex, { timeLimitMinutes: sanitizeWholeNumberInput(event.target.value) })} className="field-surface field-control" />
                      </label>
                      <label className="field-group">
                        <span className="field-label">Points</span>
                        <input type="number" inputMode="numeric" min="1" step="1" value={problem.points} onChange={(event) => updateProblem(problemIndex, { points: sanitizeWholeNumberInput(event.target.value) })} className="field-surface field-control" />
                      </label>
                    </div>
                    <div>
                      <div className="mb-3 flex items-center justify-between">
                        <p className="text-sm font-black text-white">Test cases</p>
                        <p className="text-xs font-bold text-slate-400">{problem.tests.length} cases</p>
                      </div>
                      <div className="grid gap-3">
                    {problem.tests.map((test, testIndex) => (
                      <div key={testIndex} className="grid gap-2 rounded-lg border border-white/10 bg-slate-950/45 p-3 md:grid-cols-[1fr_1fr_1fr_auto]">
                        <label className="field-group">
                          <span className="field-label">Test case name</span>
                          <input value={test.name} onChange={(event) => updateTest(problemIndex, testIndex, { name: event.target.value })} placeholder="Sample 1" className="field-surface field-control" />
                        </label>
                        <label className="field-group">
                          <span className="field-label">Input JSON</span>
                          <input value={test.inputJson} onChange={(event) => updateTest(problemIndex, testIndex, { inputJson: event.target.value })} placeholder="[1,2,3]" className="field-surface field-control font-mono" />
                        </label>
                        <label className="field-group">
                          <span className="field-label">Expected JSON</span>
                          <input value={test.expectedJson} onChange={(event) => updateTest(problemIndex, testIndex, { expectedJson: event.target.value })} placeholder="6" className="field-surface field-control font-mono" />
                        </label>
                        <label className="flex items-center gap-2 text-sm font-bold text-slate-200">
                          <input type="checkbox" checked={test.visible} onChange={(event) => updateTest(problemIndex, testIndex, { visible: event.target.checked })} className="field-toggle" />
                          Visible
                        </label>
                        {problem.tests.length > 1 && (
                          <button type="button" onClick={() => removeTest(problemIndex, testIndex)} className="inline-flex items-center justify-center gap-2 rounded-md border border-rose-300/25 bg-rose-400/10 px-3 py-2 text-sm font-bold text-rose-100 md:col-span-4">
                            <FaTrash />
                            Delete test
                          </button>
                        )}
                      </div>
                    ))}
                      </div>
                    </div>
                  </div>
                </section>
              ))}

              <button type="button" onClick={addProblem} className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/15 bg-white/8 px-4 py-3 font-bold text-white">
                <FaPlus />
                Add coding problem
              </button>
              <button disabled={isSubmitting} className="rounded-xl bg-linear-to-r from-cyan-300 via-emerald-300 to-blue-400 px-5 py-3 font-black text-slate-950 disabled:cursor-not-allowed disabled:opacity-60">
                {isSubmitting ? "Creating assessment..." : "Create assessment"}
              </button>
            </div>
          </form>

          <aside className="grid gap-4 self-start xl:sticky xl:top-24">
            <DraftSummary
              assessmentMinutes={assessmentMinutes}
              assignedCandidateCount={assignedCandidateCount}
              hiddenDraftTests={hiddenDraftTests}
              timerStatus={timerStatus}
              totalPoints={totalPoints}
              totalProblemMinutes={totalProblemMinutes}
              totalTests={allDraftTests.length}
              visibleDraftTests={visibleDraftTests}
            />
            <section className="rounded-xl border border-white/10 bg-slate-950/50 p-4 shadow-xl shadow-black/20">
              <div className="mb-3 flex items-center justify-between">
                <h2 className="font-black text-white">Created assessments</h2>
                <span className="rounded-md bg-cyan-300/10 px-2 py-1 text-xs font-bold text-cyan-100">{assessments.length}</span>
              </div>
              <div className="grid gap-4">
                {assessments.map((assessment) => <AssessmentCard key={assessment._id} assessment={assessment} onDelete={deleteAssessment} />)}
                {assessments.length === 0 && <div className="rounded-lg border border-white/10 bg-slate-950/40 p-4 text-sm text-slate-300">No assessments created.</div>}
              </div>
            </section>
          </aside>
        </div>
      </div>
    </div>
  );
}

function DraftSummary({
  assessmentMinutes,
  assignedCandidateCount,
  hiddenDraftTests,
  timerStatus,
  totalPoints,
  totalProblemMinutes,
  totalTests,
  visibleDraftTests,
}) {
  return (
    <section className="rounded-xl border border-white/10 bg-slate-950/50 p-4 shadow-xl shadow-black/20">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="font-black text-white">Draft summary</h2>
        <span className={`rounded-md px-2 py-1 text-xs font-bold ${timerStatus === "Matches" ? "bg-emerald-300/10 text-emerald-100" : "bg-amber-300/10 text-amber-100"}`}>
          {timerStatus}
        </span>
      </div>
      <div className="grid grid-cols-2 gap-2 text-xs font-bold text-slate-300">
        <Metric label="Assessment timer" value={`${assessmentMinutes} min`} />
        <Metric label="Problem timers" value={`${totalProblemMinutes} min`} />
        <Metric label="Candidates" value={assignedCandidateCount} />
        <Metric label="Points" value={totalPoints} />
        <Metric label="Visible tests" value={visibleDraftTests} />
        <Metric label="Hidden tests" value={hiddenDraftTests} />
      </div>
      <p className="mt-3 text-xs font-semibold text-slate-400">{totalTests} total test cases.</p>
    </section>
  );
}

function AssessmentCard({ assessment, onDelete }) {
  const submissions = assessment.submissions || [];
  const candidates = assessment.candidates || [];
  const passRate = submissions.length
    ? Math.round((submissions.filter((submission) => submission.score >= submission.maxScore * 0.7).length / submissions.length) * 100)
    : 0;
  const inviteLink = typeof window === "undefined" ? "" : `${window.location.origin}/lab`;
  const emailBody = `Hi,

You are invited to a PrepTalk Lab coding assessment.

Assessment: ${assessment.title}
Duration: ${assessment.durationMinutes} minutes
Problems: ${assessment.problems?.length || 0}

Open your assigned Lab here:
${inviteLink}

Please sign in with the email this invite was sent to.

Thanks.`;
  const mailtoHref = `mailto:${candidates.join(",")}?subject=${encodeURIComponent(`PrepTalk Lab assessment: ${assessment.title}`)}&body=${encodeURIComponent(emailBody)}`;

  return (
    <article className="rounded-xl border border-white/10 bg-slate-950/50 p-5 shadow-xl shadow-black/20 transition hover:border-cyan-300/35">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-cyan-200">Assessment</p>
          <h2 className="mt-2 text-2xl font-black text-white">{assessment.title}</h2>
          <p className="mt-2 text-sm text-slate-300">{candidates.length} candidates · {assessment.problems?.length || 0} problems · {assessment.durationMinutes} min</p>
        </div>
        <div className="flex items-center gap-2">
          <button type="button" onClick={() => navigator.clipboard?.writeText(inviteLink)} className="rounded-md border border-white/10 bg-white/8 p-3 text-cyan-100" title="Copy candidate Lab link">
            <FaClipboard />
          </button>
          <button type="button" onClick={() => onDelete(assessment._id)} className="rounded-md border border-rose-300/25 bg-rose-400/10 p-3 text-rose-100" title="Delete assessment">
            <FaTrash />
          </button>
        </div>
      </div>
      {candidates.length > 0 && (
        <div className="mt-4 flex flex-wrap gap-2">
          {candidates.map((candidate) => (
            <span key={candidate} className="rounded-md border border-cyan-300/20 bg-cyan-300/10 px-2 py-1 text-xs font-bold text-cyan-100">
              {candidate}
            </span>
          ))}
        </div>
      )}
      {candidates.length > 0 && (
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <button
            type="button"
            onClick={() => navigator.clipboard?.writeText(emailBody)}
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/8 px-4 py-3 text-sm font-bold text-white"
          >
            <FaClipboard />
            Copy invite email
          </button>
          <a
            href={mailtoHref}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-linear-to-r from-cyan-300 via-emerald-300 to-blue-400 px-4 py-3 text-sm font-black text-slate-950"
          >
            <FaEnvelope />
            Send email invite
          </a>
        </div>
      )}
      <div className="mt-4 grid grid-cols-3 gap-2 text-center text-xs font-bold text-slate-300">
        <Metric label="Submissions" value={submissions.length} />
        <Metric label="Pass rate" value={`${passRate}%`} />
        <Metric label="Attempts" value={submissions.reduce((total, item) => total + item.attempts, 0)} />
      </div>
      <div className="mt-4 grid gap-2">
        {submissions.slice(-5).reverse().map((submission) => (
          <div key={`${submission.candidateEmail}-${submission.submittedAt}`} className="rounded-lg border border-white/10 bg-slate-950/35 p-3 text-sm text-slate-300">
            <span className="font-bold text-white">{submission.candidateEmail}</span> scored {submission.score}/{submission.maxScore} · {submission.runtimeMs}ms · attempt {submission.attempts}
          </div>
        ))}
      </div>
    </article>
  );
}

function SegmentedControl({ value, options, onChange }) {
  return (
    <div className="grid grid-cols-3 gap-1 rounded-lg border border-white/10 bg-slate-950/35 p-1">
      {options.map((option) => (
        <button
          key={option}
          type="button"
          onClick={() => onChange(option)}
          className={`rounded-md px-3 py-2 text-sm font-black transition ${
            value === option
              ? "bg-cyan-300 text-slate-950"
              : "text-slate-300 hover:bg-white/8 hover:text-white"
          }`}
        >
          {option}
        </button>
      ))}
    </div>
  );
}

function sanitizeWholeNumberInput(value) {
  return String(value).replace(/[^\d]/g, "");
}

function toWholeNumber(value, fallback) {
  const parsed = Number.parseInt(value, 10);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function validateAssessmentForm(form) {
  if (!form.title.trim()) return "Assessment title is required.";
  if (!form.candidates.split(",").map((email) => email.trim()).filter(Boolean).length) {
    return "Assign at least one candidate email.";
  }

  const duration = toWholeNumber(form.durationMinutes, 0);
  if (duration < 1 || duration > 120) return "Assessment timer must be between 1 and 120 whole minutes.";

  if (!form.problems.length) return "Add at least one coding problem.";

  const totalProblemMinutes = form.problems.reduce(
    (total, problem) => total + toWholeNumber(problem.timeLimitMinutes, 0),
    0
  );

  if (totalProblemMinutes !== duration) {
    return `Problem timers must add up to the assessment timer. Current total is ${totalProblemMinutes} minutes, assessment timer is ${duration} minutes.`;
  }

  for (const [problemIndex, problem] of form.problems.entries()) {
    if (!problem.title.trim()) return `Problem ${problemIndex + 1} needs a title.`;
    if (!problem.prompt.trim()) return `Problem ${problemIndex + 1} needs a statement.`;
    if (toWholeNumber(problem.timeLimitMinutes, 0) < 1) return `Problem ${problemIndex + 1} timer must be at least 1 minute.`;
    if (toWholeNumber(problem.points, 0) < 1) return `Problem ${problemIndex + 1} points must be at least 1.`;
    if (!problem.tests.length) return `Problem ${problemIndex + 1} needs at least one test case.`;

    for (const [testIndex, test] of problem.tests.entries()) {
      if (!test.name.trim()) return `Problem ${problemIndex + 1}, test case ${testIndex + 1} needs a name.`;
      const inputError = validateJson(test.inputJson);
      if (inputError) return `Problem ${problemIndex + 1}, test case ${testIndex + 1} input must be valid JSON.`;
      const expectedError = validateJson(test.expectedJson);
      if (expectedError) return `Problem ${problemIndex + 1}, test case ${testIndex + 1} expected output must be valid JSON.`;
    }
  }

  return "";
}

function validateJson(value) {
  try {
    JSON.parse(value);
    return "";
  } catch {
    return "Invalid JSON";
  }
}

function Metric({ label, value }) {
  return (
    <div className="rounded-lg border border-white/10 bg-slate-950/35 px-2 py-3">
      <p className="text-lg font-black text-white">{value}</p>
      <p className="mt-1 uppercase tracking-wide">{label}</p>
    </div>
  );
}
