"use client";

import CodeEditorPanel from "./CodeEditorPanel";
import ProblemPanel from "./ProblemPanel";
import ProblemRail from "./ProblemRail";
import ResultsSidebar from "./ResultsSidebar";
import { formatTime } from "./resultUtils";

/* The in-assessment layout — extracted verbatim from LabCandidateDashboard. */
export default function AssessmentScreen(props) {
  const {
    submissionError, problems, activeProblem, setActiveProblemId, resultsByProblem,
    problemPanelWidth, startResize, currentCode, secondsRemaining, isRunning,
    lineNumbers, stopAssessment, submitFullAssessment, runTests, setCodeByProblem,
    explanationError, failedResults, isExplaining, showResults, setShowResults,
    visibleResults,
  } = props;

  return (
      <div className="app-shell relative min-h-screen overflow-x-hidden px-3 pb-5 pt-24 text-ink sm:px-5 lg:overflow-hidden">
        <div className="soft-grid absolute inset-0 opacity-60" />
        {submissionError && (
          <div className="relative z-10 mx-auto mb-4 max-w-[96rem] rounded-[4px] border border-rose-600/40 bg-rose-50 px-5 py-3 font-bold text-rose-700">
            {submissionError}
          </div>
        )}
        <div className="relative z-10 mx-auto grid max-w-[96rem] overflow-visible rounded-[4px] border border-rule lg:h-[calc(100vh-7rem)] lg:grid-cols-[5.75rem_1fr] lg:overflow-hidden">
          <ProblemRail problems={problems} activeProblemId={activeProblem.id} onSelect={setActiveProblemId} resultsByProblem={resultsByProblem} />
          <main
            className="grid min-h-0 min-w-0 lg:grid-cols-[var(--problem-panel-width)_0.5rem_minmax(0,1fr)]"
            style={{ "--problem-panel-width": `${problemPanelWidth}px` }}
          >
            <ProblemPanel problem={activeProblem} panelWidth={problemPanelWidth} />
            <button
              onPointerDown={startResize}
              className="hidden cursor-col-resize border-x border-rule transition hover:bg-accent/10 lg:block"
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
