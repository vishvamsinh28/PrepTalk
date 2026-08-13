"use client";

import { useEffect, useMemo, useState } from "react";
import {
  FaCheck,
  FaClock,
  FaListOl,
  FaPlay,
  FaTimes,
} from "react-icons/fa";
import { getJson, postJson } from "@/lib/clientApi";
import CodeEditorPanel from "./CodeEditorPanel";
import ProblemPanel from "./ProblemPanel";
import ResultsSidebar from "./ResultsSidebar";
import { runUserCodeInWorker } from "./sandboxRunner";
import { createResults, deepEqual, fallbackInsight, formatTime } from "./resultUtils";

export default function LabCandidateDashboard({ initialAssessmentId = "" }) {
  const [assessments, setAssessments] = useState([]);
  const [activeAssessment, setActiveAssessment] = useState(null);
  const [activeProblemId, setActiveProblemId] = useState("");
  const [codeByProblem, setCodeByProblem] = useState({});
  const [resultsByProblem, setResultsByProblem] = useState({});
  const [isRunning, setIsRunning] = useState(false);
  const [isExplaining, setIsExplaining] = useState(false);
  const [explanationError, setExplanationError] = useState("");
  const [submitMessage, setSubmitMessage] = useState("");
  const [submissionError, setSubmissionError] = useState("");
  const [secondsRemaining, setSecondsRemaining] = useState(0);
  const [hasAutoSubmitted, setHasAutoSubmitted] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [problemPanelWidth, setProblemPanelWidth] = useState(560);

  useEffect(() => {
    loadAssessments();
  }, []);

  const loadAssessments = async () => {
    const data = await getJson("/api/lab/assessments");
    setAssessments(data.assessments || []);
  };
  const sortedAssessments = useMemo(() => {
    if (!initialAssessmentId) return assessments;
    return [...assessments].sort((left, right) => {
      if (left._id === initialAssessmentId) return -1;
      if (right._id === initialAssessmentId) return 1;
      return 0;
    });
  }, [assessments, initialAssessmentId]);

  const problems = useMemo(() => (
    activeAssessment ? activeAssessment.problems.map(toRunnableProblem) : []
  ), [activeAssessment]);
  const activeProblem = problems.find((problem) => problem.id === activeProblemId) || problems[0];
  const currentCode = activeProblem ? codeByProblem[activeProblem.id] || activeProblem.starter : "";
  const currentResults = activeProblem ? resultsByProblem[activeProblem.id] || createResults(activeProblem) : [];
  const visibleResults = currentResults.filter((result) => result.visible);
  const failedResults = currentResults.filter((result) => result.status === "failed");
  const lineNumbers = currentCode.split("\n").map((_, index) => index + 1);

  const startResize = (event) => {
    event.preventDefault();
    const startX = event.clientX;
    const startWidth = problemPanelWidth;
    const onPointerMove = (moveEvent) => {
      const nextWidth = Math.min(760, Math.max(360, startWidth + moveEvent.clientX - startX));
      setProblemPanelWidth(nextWidth);
    };
    const onPointerUp = () => {
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("pointerup", onPointerUp);
    };
    window.addEventListener("pointermove", onPointerMove);
    window.addEventListener("pointerup", onPointerUp);
  };

  const startAssessment = (assessment) => {
    const nextProblems = assessment.problems.map(toRunnableProblem);
    setActiveAssessment(assessment);
    setActiveProblemId(nextProblems[0]?.id || "");
    setCodeByProblem(Object.fromEntries(nextProblems.map((problem) => [problem.id, problem.starter])));
    setResultsByProblem(Object.fromEntries(nextProblems.map((problem) => [problem.id, createResults(problem)])));
    setSecondsRemaining(Math.max(Number(assessment.durationMinutes) || 1, 1) * 60);
    setHasAutoSubmitted(false);
    setSubmitMessage("");
    setSubmissionError("");
    setShowResults(false);
  };

  const stopAssessment = () => {
    setActiveAssessment(null);
    setActiveProblemId("");
    setCodeByProblem({});
    setResultsByProblem({});
    setSecondsRemaining(0);
    setHasAutoSubmitted(false);
    setSubmitMessage("");
    setSubmissionError("");
    setExplanationError("");
    setShowResults(false);
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

  const runTests = async () => {
    if (!activeProblem) return;

    setIsRunning(true);
    setExplanationError("");
    setShowResults(true);

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
    setShowResults(true);

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

      setResultsByProblem(nextResultsByProblem);
      await submitAssessment(successMessage);
    } catch (error) {
      setSubmissionError(error.message || "Could not submit this assessment.");
    } finally {
      setIsRunning(false);
    }
  };

  const submitAssessment = async (successMessage = "Lab assessment submitted") => {
    const response = await postJson(`/api/lab/assessments/${activeAssessment._id}/submit`, {
      solutions: problems.map((problem) => ({
        problemIndex: problem.index,
        title: problem.title,
        code: codeByProblem[problem.id] || problem.starter,
      })),
    });
    setSubmitMessage(successMessage || response.message || "Submitted");
    await loadAssessments();
    setActiveAssessment(null);
    setActiveProblemId("");
    setCodeByProblem({});
    setResultsByProblem({});
    setSecondsRemaining(0);
  };

  if (activeAssessment && activeProblem) {
    return (
      <div className="app-shell relative min-h-screen overflow-x-hidden px-3 pb-5 pt-24 text-ink sm:px-5 lg:overflow-hidden">
        <div className="soft-grid absolute inset-0 opacity-60" />
        {submissionError && (
          <div className="relative z-10 mx-auto mb-4 max-w-[96rem] rounded-lg border border-rose-600/40 bg-rose-50 px-5 py-3 font-bold text-rose-700">
            {submissionError}
          </div>
        )}
        <div className="relative z-10 mx-auto grid max-w-[96rem] overflow-visible rounded-xl border border-[#2b2620] bg-[#151311] shadow-lg lg:h-[calc(100vh-7rem)] lg:grid-cols-[5.75rem_1fr] lg:overflow-hidden">
          <ProblemRail problems={problems} activeProblemId={activeProblem.id} onSelect={setActiveProblemId} resultsByProblem={resultsByProblem} />
          <main
            className="grid min-h-0 min-w-0 lg:grid-cols-[var(--problem-panel-width)_0.5rem_minmax(0,1fr)]"
            style={{ "--problem-panel-width": `${problemPanelWidth}px` }}
          >
            <ProblemPanel problem={activeProblem} panelWidth={problemPanelWidth} />
            <button
              onPointerDown={startResize}
              className="hidden cursor-col-resize border-x border-white/10 bg-[#1e1a17] transition hover:bg-accent/30 lg:block"
              aria-label="Resize problem and editor panels"
              title="Drag to resize panels"
            />
            <section className="grid min-h-0 min-w-0 grid-rows-[auto_auto] overflow-visible lg:grid-rows-[minmax(0,1fr)_auto] lg:overflow-hidden">
              <CodeEditorPanel
                activeProblemId={activeProblem.id}
                code={currentCode}
                formattedTime={formatTime(secondsRemaining)}
                isRunning={isRunning}
                lineNumbers={lineNumbers}
                onExit={stopAssessment}
                onSubmit={() => submitFullAssessment()}
                runTests={runTests}
                setCodeByProblem={setCodeByProblem}
              />
              <ResultsSidebar
                activeProblem={activeProblem}
                explanationError={explanationError}
                failedResults={failedResults}
                isExplaining={isExplaining}
                isOpen={showResults}
                onToggle={() => setShowResults(!showResults)}
                visibleResults={visibleResults}
              />
            </section>
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className="app-shell relative min-h-screen overflow-hidden px-5 pb-16 pt-24 text-ink">
      <div className="soft-grid absolute inset-0 opacity-60" />
      <main className="relative z-10 mx-auto max-w-6xl">
        <section className="glass-panel rounded-xl p-6">
          <p className="text-sm font-bold uppercase tracking-[0.2em] text-accent">PrepTalk Lab</p>
          <h1 className="mt-2 text-4xl font-semibold gradient-text">Assigned assessments</h1>
          <p className="mt-3 text-ink-soft">Start an assigned coding assessment when you are ready.</p>
        </section>
        {submitMessage && <p className="mt-5 rounded-lg border border-emerald-600/40 bg-emerald-50 p-4 text-emerald-700">{submitMessage}</p>}
        <div className="mt-8 max-h-[calc(100vh-22rem)] min-h-[18rem] overflow-auto pr-2">
          <div className="grid gap-5">
          {initialAssessmentId && !assessments.some((assessment) => assessment._id === initialAssessmentId) && (
            <div className="rounded-xl border border-amber-600/40 bg-amber-50 p-5 font-semibold text-amber-700">
              The invited assessment was not found for this account. Make sure you are logged in with the assigned candidate email.
            </div>
          )}
          {sortedAssessments.map((assessment) => (
            <article key={assessment._id} className="rounded-xl border border-rule bg-white p-6 shadow-xl">
              <div className="flex flex-wrap items-center justify-between gap-5">
                <div>
                  <p className="font-semibold text-emerald-700"><FaClock className="mr-2 inline" />{assessment.durationMinutes} mins</p>
                  <h2 className="mt-3 text-2xl font-semibold text-ink">{assessment.title}</h2>
                  <p className="mt-2 text-ink-soft">{assessment.problems?.length || 0} sections · {assessment.submissions?.length || 0} completed attempts · Due {formatCandidateDeadline(assessment.deadlineAt)}</p>
                  <CandidateStatus assessment={assessment} />
                </div>
                <button onClick={() => startAssessment(assessment)} className="inline-flex items-center gap-2 rounded-lg bg-ink px-5 py-3 font-semibold text-canvas">
                  <FaPlay />
                  {(assessment.submissions?.length || 0) > 0 ? "Retry assessment" : "Start assessment"}
                </button>
              </div>
            </article>
          ))}
          {assessments.length === 0 && <div className="rounded-xl border border-rule bg-white p-6 text-ink-soft">No assigned assessments.</div>}
          </div>
        </div>
      </main>
    </div>
  );
}

function CandidateStatus({ assessment }) {
  const latest = [...(assessment.submissions || [])].sort((left, right) => new Date(right.submittedAt) - new Date(left.submittedAt))[0];

  if (!latest) {
    return <span className="mt-4 inline-flex rounded-full border border-amber-600/40 bg-amber-50 px-3 py-1 text-sm font-bold text-amber-700">Pending</span>;
  }

  const passed = Number(latest.passedTests) || 0;
  const total = Number(latest.totalTests) || 0;
  const allPassed = total > 0 && passed === total;

  return (
    <span className={`mt-4 inline-flex rounded-full border px-3 py-1 text-sm font-bold ${allPassed ? "border-emerald-600/40 bg-emerald-50 text-emerald-700" : "border-rose-600/40 bg-rose-50 text-rose-700"}`}>
      Submitted · {passed}/{total} tests passed
    </span>
  );
}

function formatCandidateDeadline(value) {
  if (!value) return "no deadline";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "no deadline";
  return date.toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" });
}

function ProblemRail({ problems, activeProblemId, onSelect, resultsByProblem }) {
  return (
    <aside className="border-b border-white/10 bg-[#1e1a17] lg:grid lg:grid-rows-[4rem_1fr] lg:border-b-0 lg:border-r">
      <div className="hidden place-items-center border-b border-white/10 px-4 lg:grid">
        <span className="grid h-10 w-10 place-items-center rounded-md border border-accent bg-accent/20 text-[#e4633f]" title="Questions">
          <FaListOl />
        </span>
      </div>
      <div className="flex gap-2 overflow-x-auto px-3 py-3 text-center lg:grid lg:content-start lg:gap-3 lg:overflow-visible lg:py-5">
        {problems.map((problem, index) => {
          const results = resultsByProblem[problem.id] || [];
          const failed = results.some((result) => result.status === "failed");
          const passed = results.length > 0 && results.every((result) => result.status === "passed");
          return (
            <div key={problem.id}>
              <button
                onClick={() => onSelect(problem.id)}
                className={`grid h-10 min-w-14 place-items-center rounded-md border px-3 text-sm font-semibold lg:h-12 lg:w-full lg:min-w-0 lg:px-0 ${
                  activeProblemId === problem.id ? "border-accent bg-accent/20 text-white" : "border-transparent text-white/60 hover:border-white/20 hover:bg-white/5"
                }`}
              >
                {passed ? <FaCheck className="text-emerald-400" /> : failed ? <FaTimes className="text-rose-400" /> : `Q${index + 1}`}
              </button>
            </div>
          );
        })}
      </div>
    </aside>
  );
}

function toRunnableProblem(problem, index) {
  return {
    id: problem._id || `${problem.title}-${index}`,
    index,
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
