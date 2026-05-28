"use client";

import { useEffect, useMemo, useState } from "react";
import { FaArrowLeft, FaClock, FaPlay, FaStop } from "react-icons/fa";
import { getJson, postJson } from "@/lib/clientApi";
import CodeEditorPanel from "./CodeEditorPanel";
import ProblemPanel from "./ProblemPanel";
import ResultsSidebar from "./ResultsSidebar";
import { runUserCodeInWorker } from "./sandboxRunner";
import { createResults, deepEqual, fallbackInsight, formatTime } from "./resultUtils";

export default function LabCandidateDashboard() {
  const [assessments, setAssessments] = useState([]);
  const [activeAssessment, setActiveAssessment] = useState(null);
  const [activeProblemId, setActiveProblemId] = useState("");
  const [codeByProblem, setCodeByProblem] = useState({});
  const [resultsByProblem, setResultsByProblem] = useState({});
  const [submittedProblems, setSubmittedProblems] = useState({});
  const [isRunning, setIsRunning] = useState(false);
  const [isExplaining, setIsExplaining] = useState(false);
  const [explanationError, setExplanationError] = useState("");
  const [submitMessage, setSubmitMessage] = useState("");
  const [secondsRemaining, setSecondsRemaining] = useState(0);
  const [hasAutoSubmitted, setHasAutoSubmitted] = useState(false);

  useEffect(() => {
    loadAssessments();
  }, []);

  const loadAssessments = async () => {
    const data = await getJson("/api/lab/assessments");
    setAssessments(data.assessments || []);
  };

  const problems = useMemo(() => (
    activeAssessment ? activeAssessment.problems.map(toRunnableProblem) : []
  ), [activeAssessment]);
  const activeProblem = problems.find((problem) => problem.id === activeProblemId) || problems[0];
  const currentCode = activeProblem ? codeByProblem[activeProblem.id] || activeProblem.starter : "";
  const currentResults = activeProblem ? resultsByProblem[activeProblem.id] || createResults(activeProblem) : [];
  const visibleResults = activeProblem && submittedProblems[activeProblem.id]
    ? currentResults
    : currentResults.filter((result) => result.visible);
  const currentPassed = currentResults.filter((result) => result.status === "passed").length;
  const failedResults = currentResults.filter((result) => result.status === "failed");
  const lineNumbers = currentCode.split("\n").map((_, index) => index + 1);

  const startAssessment = (assessment) => {
    const nextProblems = assessment.problems.map(toRunnableProblem);
    setActiveAssessment(assessment);
    setActiveProblemId(nextProblems[0]?.id || "");
    setCodeByProblem(Object.fromEntries(nextProblems.map((problem) => [problem.id, problem.starter])));
    setResultsByProblem(Object.fromEntries(nextProblems.map((problem) => [problem.id, createResults(problem)])));
    setSubmittedProblems({});
    setSecondsRemaining(Math.max(Number(assessment.durationMinutes) || 1, 1) * 60);
    setHasAutoSubmitted(false);
    setSubmitMessage("");
  };

  const stopAssessment = () => {
    setActiveAssessment(null);
    setActiveProblemId("");
    setCodeByProblem({});
    setResultsByProblem({});
    setSubmittedProblems({});
    setSecondsRemaining(0);
    setHasAutoSubmitted(false);
    setSubmitMessage("");
    setExplanationError("");
  };

  useEffect(() => {
    if (!activeAssessment || secondsRemaining <= 0 || submitMessage) return undefined;

    const timer = window.setInterval(() => {
      setSecondsRemaining((seconds) => Math.max(0, seconds - 1));
    }, 1000);

    return () => window.clearInterval(timer);
  }, [activeAssessment, secondsRemaining, submitMessage]);

  useEffect(() => {
    if (!activeAssessment || secondsRemaining !== 0 || hasAutoSubmitted || submitMessage) return;

    setHasAutoSubmitted(true);
    submitFullAssessment("Time is up. Assessment submitted automatically.");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeAssessment, secondsRemaining, hasAutoSubmitted, submitMessage]);

  const explainFailedTests = async (nextResults) => {
    const failedCases = nextResults.filter((result) => result.status === "failed");
    if (failedCases.length === 0) return;

    setIsExplaining(true);
    setExplanationError("");
    try {
      const response = await postJson("/api/lab/explain", {
        assessmentId: activeAssessment._id,
        problem: { title: activeProblem.title, prompt: activeProblem.prompt },
        code: currentCode,
        failedCases,
      });
      const insightByName = new Map((response.explanations || []).map((item) => [item.name, item.explanation]));
      setResultsByProblem((previous) => ({
        ...previous,
        [activeProblem.id]: (previous[activeProblem.id] || nextResults).map((result) => (
          result.status === "failed" ? { ...result, insight: insightByName.get(result.name) || result.insight } : result
        )),
      }));
    } catch (error) {
      setExplanationError(error.message || "Could not generate AI explanations.");
    } finally {
      setIsExplaining(false);
    }
  };

  const runTests = async (includeHidden = false) => {
    if (!activeProblem) return;

    if (includeHidden) {
      await submitFullAssessment();
      return;
    }

    setIsRunning(true);
    setExplanationError("");

    try {
      const nextResults = [];
      for (const test of activeProblem.tests) {
        if (!test.visible) {
          nextResults.push({ ...test, duration: null, error: "", output: null, status: "idle", insight: "" });
          continue;
        }
        const result = await runUserCodeInWorker(currentCode, test.input);
        nextResults.push(toTestResult(test, result));
      }
      setResultsByProblem((previous) => ({ ...previous, [activeProblem.id]: nextResults }));
      await explainFailedTests(nextResults);

    } finally {
      setIsRunning(false);
    }
  };

  const submitFullAssessment = async (successMessage = "Lab assessment submitted") => {
    if (!activeAssessment || problems.length === 0) return;

    setIsRunning(true);
    setExplanationError("");

    try {
      const nextResultsByProblem = {};

      for (const problem of problems) {
        const nextResults = [];
        const code = codeByProblem[problem.id] || problem.starter;

        for (const test of problem.tests) {
          const result = await runUserCodeInWorker(code, test.input);
          nextResults.push(toTestResult(test, result));
        }

        nextResultsByProblem[problem.id] = nextResults;
      }

      setSubmittedProblems(Object.fromEntries(problems.map((problem) => [problem.id, true])));
      setResultsByProblem(nextResultsByProblem);
      await submitAssessment(nextResultsByProblem, successMessage);
    } finally {
      setIsRunning(false);
    }
  };

  const submitAssessment = async (nextResultsByProblem, successMessage = "Lab assessment submitted") => {
    const allResults = Object.values(nextResultsByProblem).flat();
    const maxScore = problems.reduce((total, problem) => total + problem.points, 0);
    const score = problems.reduce((total, problem) => {
      const results = nextResultsByProblem[problem.id] || [];
      const passed = results.filter((result) => result.status === "passed").length;
      return total + Math.round((passed / problem.tests.length) * problem.points);
    }, 0);

    const response = await postJson(`/api/lab/assessments/${activeAssessment._id}/submit`, {
      score,
      maxScore,
      passedTests: allResults.filter((result) => result.status === "passed").length,
      totalTests: allResults.length,
      runtimeMs: allResults.reduce((total, result) => total + (Number(result.duration) || 0), 0),
    });
    setSubmitMessage(successMessage || response.message || "Submitted");
    await loadAssessments();
    setActiveAssessment(null);
    setActiveProblemId("");
    setCodeByProblem({});
    setResultsByProblem({});
    setSubmittedProblems({});
    setSecondsRemaining(0);
  };

  if (activeAssessment && activeProblem) {
    return (
      <div className="app-shell relative min-h-screen overflow-hidden px-5 pb-16 pt-24">
        <div className="soft-grid absolute inset-0 z-0 opacity-60" />
        <div className="relative z-10 mx-auto max-w-7xl">
          <div className="mb-5 rounded-xl border border-white/10 bg-slate-950/55 p-4 shadow-xl shadow-black/20">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.2em] text-cyan-200">Active assessment</p>
                <h1 className="mt-1 text-2xl font-black text-white">{activeAssessment.title}</h1>
              </div>
              <div className="inline-flex items-center gap-3 rounded-lg border border-cyan-300/25 bg-cyan-300/10 px-4 py-2 font-bold text-cyan-100">
                <FaClock />
                Assessment timer: <span className="font-mono text-white">{formatTime(secondsRemaining)}</span>
              </div>
            </div>
            <div className="mt-4 flex flex-wrap items-center gap-3">
              <button onClick={() => setActiveAssessment(null)} className="inline-flex items-center gap-2 rounded-lg border border-white/10 bg-white/8 px-4 py-2 font-bold text-white">
                <FaArrowLeft />
                Back to assigned labs
              </button>
              <button onClick={stopAssessment} className="inline-flex items-center gap-2 rounded-lg border border-rose-300/25 bg-rose-400/10 px-4 py-2 font-bold text-rose-100">
                <FaStop />
                Stop assessment
              </button>
            </div>
          </div>
          {submitMessage && <p className="mb-4 rounded-lg border border-emerald-300/25 bg-emerald-300/10 p-3 text-sm text-emerald-100">{submitMessage}</p>}
          <div className="grid gap-4 lg:grid-cols-[17rem_minmax(0,1fr)]">
            <ProblemSwitcher activeAssessment={activeAssessment} problems={problems} activeProblemId={activeProblem.id} onSelect={setActiveProblemId} resultsByProblem={resultsByProblem} />
            <div className="grid gap-4 xl:grid-cols-[minmax(0,1.08fr)_23rem]">
              <main className="grid gap-4">
                <ProblemPanel problem={activeProblem} />
                <CodeEditorPanel activeProblemId={activeProblem.id} code={currentCode} isRunning={isRunning} lineNumbers={lineNumbers} runTests={runTests} setCodeByProblem={setCodeByProblem} />
              </main>
              <ResultsSidebar activeProblem={activeProblem} currentPassed={currentPassed} explanationError={explanationError} failedResults={failedResults} isExplaining={isExplaining} submittedProblems={submittedProblems} visibleResults={visibleResults} />
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="app-shell relative min-h-screen overflow-hidden px-5 pb-16 pt-24">
      <div className="soft-grid absolute inset-0 z-0 opacity-60" />
      <div className="relative z-10 mx-auto max-w-7xl">
        <header className="mb-8 rounded-xl border border-white/10 bg-slate-950/45 p-6 shadow-xl shadow-black/20">
          <p className="mb-2 text-xs font-bold uppercase tracking-[0.2em] text-cyan-200">PrepTalk Lab</p>
          <h1 className="text-4xl font-black tracking-tight gradient-text sm:text-5xl">Assigned assessments</h1>
          <p className="mt-3 max-w-2xl text-slate-300">{assessments.length} assessments assigned.</p>
        </header>
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {assessments.map((assessment) => (
            <article key={assessment._id} className="rounded-xl border border-white/10 bg-slate-950/50 p-5 shadow-xl shadow-black/20 transition hover:border-cyan-300/35 hover:bg-slate-950/65">
              <div className="flex items-center justify-between gap-3">
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-amber-200">{assessment.durationMinutes} min</p>
                <span className="rounded-md bg-cyan-300/10 px-2 py-1 text-xs font-bold text-cyan-100">{assessment.problems?.length || 0} problems</span>
              </div>
              <h2 className="mt-2 text-2xl font-black text-white">{assessment.title}</h2>
              {assessment.description && <p className="mt-2 min-h-12 text-sm text-slate-300">{assessment.description}</p>}
              <p className="mt-4 text-sm font-bold text-cyan-100">{assessment.submissions?.length || 0} completed attempts</p>
              <button onClick={() => startAssessment(assessment)} className="mt-5 inline-flex items-center gap-2 rounded-xl bg-linear-to-r from-cyan-300 via-emerald-300 to-blue-400 px-5 py-3 font-black text-slate-950">
                <FaPlay />
                Start assessment
              </button>
            </article>
          ))}
          {assessments.length === 0 && <div className="rounded-xl border border-white/10 bg-slate-950/50 p-5 text-slate-300 shadow-xl shadow-black/20">No assigned assessments.</div>}
        </div>
      </div>
    </div>
  );
}

function ProblemSwitcher({ activeAssessment, problems, activeProblemId, onSelect, resultsByProblem }) {
  const attempts = activeAssessment?.submissions?.length || 0;
  const submissions = activeAssessment?.submissions || [];

  return (
    <aside className="rounded-xl border border-white/10 bg-slate-950/50 p-3 shadow-xl shadow-black/20 lg:sticky lg:top-24 lg:self-start">
      <p className="mb-3 px-2 text-xs font-bold uppercase tracking-[0.18em] text-slate-400">Problems</p>
      <div className="grid gap-2">
        {problems.map((problem, index) => {
          const passed = (resultsByProblem[problem.id] || []).filter((result) => result.status === "passed").length;
          return (
            <button key={problem.id} onClick={() => onSelect(problem.id)} className={`rounded-lg border p-3 text-left transition ${problem.id === activeProblemId ? "border-cyan-300/45 bg-cyan-300/10" : "border-white/10 bg-slate-950/30 hover:border-white/20 hover:bg-white/8"}`}>
              <p className="text-xs font-black text-cyan-100">0{index + 1}</p>
              <h2 className="mt-2 font-black text-white">{problem.title}</h2>
              <p className="mt-2 text-xs font-bold text-slate-300">{problem.level} · {problem.points} pts · {passed}/{problem.tests.length}</p>
            </button>
          );
        })}
      </div>
      <div className="mt-3 rounded-lg border border-white/10 bg-slate-950/45 p-3">
        <p className="mb-3 text-xs font-bold uppercase tracking-[0.18em] text-slate-400">Assessment</p>
        <div className="grid gap-2 text-sm">
          <Row label="Duration" value={`${activeAssessment?.durationMinutes || 0} min`} />
          <Row label="Attempts" value={attempts} />
        </div>
      </div>
      <div className="mt-3 rounded-lg border border-white/10 bg-slate-950/45 p-3">
        <p className="mb-3 text-xs font-bold uppercase tracking-[0.18em] text-slate-400">Submission history</p>
        <div className="grid gap-2">
          {submissions.slice(-4).reverse().map((submission) => (
            <div key={`${submission.candidateEmail}-${submission.submittedAt}`} className="rounded-md border border-white/10 bg-white/5 px-3 py-2 text-xs text-slate-300">
              <div className="flex items-center justify-between gap-3">
                <span className="font-black text-white">{submission.score}/{submission.maxScore}</span>
                <span className="font-bold text-cyan-100">Attempt {submission.attempts}</span>
              </div>
              <p className="mt-1 text-slate-400">{formatSubmissionDate(submission.submittedAt)}</p>
            </div>
          ))}
          {submissions.length === 0 && (
            <p className="rounded-md border border-white/10 bg-white/5 px-3 py-2 text-xs font-semibold text-slate-400">
              No submissions yet.
            </p>
          )}
        </div>
      </div>
    </aside>
  );
}

function Row({ label, value }) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-md border border-white/10 bg-white/5 px-3 py-2">
      <span className="font-semibold text-slate-400">{label}</span>
      <span className="font-black text-white">{value}</span>
    </div>
  );
}

function toRunnableProblem(problem, index) {
  return {
    id: problem._id || `${problem.title}-${index}`,
    title: problem.title,
    level: problem.difficulty,
    points: problem.points,
    time: `${problem.timeLimitMinutes} min`,
    prompt: problem.prompt,
    starter: problem.starterCode,
    tests: (problem.tests || []).map((test) => ({
      name: test.name,
      input: parseJsonValue(test.inputJson),
      expected: parseJsonValue(test.expectedJson),
      visible: test.visible,
    })),
  };
}

function formatSubmissionDate(value) {
  if (!value) return "No timestamp";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Invalid timestamp";
  return date.toLocaleString([], {
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    month: "short",
  });
}

function parseJsonValue(value) {
  try {
    return JSON.parse(value);
  } catch {
    return value;
  }
}

function toTestResult(test, result) {
  if (!result.ok) {
    return { ...test, duration: result.duration, error: result.error || "Runtime error", output: null, status: "failed", insight: fallbackInsight(test, null, result.error) };
  }
  const passed = deepEqual(result.output, test.expected);
  return { ...test, duration: result.duration, error: "", output: result.output, status: passed ? "passed" : "failed", insight: passed ? "" : fallbackInsight(test, result.output, "") };
}
