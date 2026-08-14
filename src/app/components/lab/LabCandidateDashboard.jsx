"use client";

import { useEffect, useMemo, useState } from "react";
import { getJson, postJson } from "@/lib/clientApi";
import { runUserCodeInWorker } from "./sandboxRunner";
import { toRunnableProblem, toTestResult } from "./candidateRunUtils";
import AssessmentPicker from "./AssessmentPicker";
import AssessmentScreen from "./AssessmentScreen";
import { createResults } from "./resultUtils";

/**
 * Candidate lab: assessment picker plus the timed in-assessment flow
 * (local runs, server-graded submit, auto-submit at 0:00).
 * @param {{ initialAssessmentId?: string }} props
 */
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
        problemIndex: activeProblem.index,
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
      <AssessmentScreen
        submissionError={submissionError}
        problems={problems}
        activeProblem={activeProblem}
        setActiveProblemId={setActiveProblemId}
        resultsByProblem={resultsByProblem}
        problemPanelWidth={problemPanelWidth}
        startResize={startResize}
        currentCode={currentCode}
        secondsRemaining={secondsRemaining}
        isRunning={isRunning}
        lineNumbers={lineNumbers}
        stopAssessment={stopAssessment}
        submitFullAssessment={submitFullAssessment}
        runTests={runTests}
        setCodeByProblem={setCodeByProblem}
        explanationError={explanationError}
        failedResults={failedResults}
        isExplaining={isExplaining}
        showResults={showResults}
        setShowResults={setShowResults}
        visibleResults={visibleResults}
      />
    );
  }

  return (
    <AssessmentPicker
      assessments={assessments}
      sortedAssessments={sortedAssessments}
      initialAssessmentId={initialAssessmentId}
      submitMessage={submitMessage}
      onStart={startAssessment}
    />
  );
}
