"use client";

import { useState } from "react";
import { FaChevronRight } from "react-icons/fa";
import { Metric, SkillIcon } from "./AdminShared";
/** @file Step two of creating an assessment: edit sections and tests, then create. */

import { sanitizeWholeNumberInput, sectionName, toWholeNumber } from "./adminUtils";

/**
 * Assessment builder: collapsible sections, their test cases, and assignment settings.
 * Fully controlled — `LabAdminDashboard` owns `form` and every mutation goes
 * back through a callback, so there's no draft copy here to fall out of sync.
 * Total duration and test count are derived on each render rather than tracked
 * in state, which is what keeps the summary honest as sections are edited.
 * Validation happens on submit via `validateAssessmentForm`, not per keystroke,
 * so a half-typed section doesn't flash errors.
 * @param {object} props - Component props.
 * @param {object} props.form - Builder form state.
 * @param {boolean} props.isSubmitting - Disables create while in flight.
 * @param {Function} props.onAddProblem - Appends a blank section.
 * @param {Function} props.onAddTest - Appends a test case to a section.
 * @param {Function} props.onBack - Returns to the template picker.
 * @param {Function} props.onCreate - Validates and submits the assessment.
 * @param {Function} props.onRemoveProblem - Removes a section by index.
 * @param {Function} props.onRemoveTest - Removes a test case.
 * @param {Function} props.onSetForm - Replaces top-level form fields.
 * @param {Function} props.onUpdateProblem - Merges a patch into one section.
 * @param {Function} props.onUpdateTest - Merges a patch into one test case.
 * @returns {JSX.Element} The builder.
 */
export default function AdminTestBuilder({
  form,
  isSubmitting,
  onAddProblem,
  onAddTest,
  onBack,
  onCreate,
  onRemoveProblem,
  onRemoveTest,
  onSetForm,
  onUpdateProblem,
  onUpdateTest,
}) {
  const totalProblemMinutes = form.problems.reduce((total, problem) => total + toWholeNumber(problem.timeLimitMinutes, 0), 0);
  const totalTests = form.problems.reduce((total, problem) => total + problem.tests.length, 0);

  return (
    <main className="relative z-10 mx-auto w-full max-w-7xl overflow-x-hidden text-sm [&_.field-control]:min-h-10 [&_.field-control]:px-3 [&_.field-control]:py-2 [&_textarea.field-control]:min-h-20">
      <BuilderHeader title={form.title} onBack={onBack} onCreate={onCreate} isSubmitting={isSubmitting} />
      <section className="grid min-w-0 gap-4 lg:grid-cols-[minmax(0,1fr)_24rem] lg:items-start">
        <div className="flex min-w-0 flex-col lg:h-[calc(100vh-15rem)] lg:max-h-[44rem]">
          <div className="shrink-0 flex flex-col gap-3 border-b border-rule px-4 py-4 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between sm:px-8 sm:py-5">
            <div className="flex flex-wrap items-baseline gap-3">
              <span className="app-eyebrow">Duration</span>
              <span className="text-sm text-ink">{totalProblemMinutes} minutes</span>
            </div>
            <span className="app-eyebrow inline-flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-accent" /> Draft
            </span>
          </div>

          <div className="flex min-h-0 flex-1 flex-col p-3 sm:p-5">
            <div className="mb-4 shrink-0 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <h2 className="app-h2">Sections ({form.problems.length})</h2>
              <button
                onClick={onAddProblem}
                className="btn-quiet w-full py-2 text-sm sm:w-auto"
              >
                Add section
              </button>
            </div>
            <div className="grid min-h-0 flex-1 content-start gap-2 pr-1 sm:pr-2 lg:overflow-y-auto lg:overscroll-contain">
              {form.problems.map((problem, problemIndex) => (
                <ProblemBuilder
                  key={problemIndex}
                  problem={problem}
                  problemIndex={problemIndex}
                  canDelete={form.problems.length > 1}
                  onAddTest={() => onAddTest(problemIndex)}
                  onRemove={() => onRemoveProblem(problemIndex)}
                  onRemoveTest={(testIndex) => onRemoveTest(problemIndex, testIndex)}
                  onUpdate={(patch) => onUpdateProblem(problemIndex, patch)}
                  onUpdateTest={(testIndex, patch) => onUpdateTest(problemIndex, testIndex, patch)}
                />
              ))}
            </div>
          </div>
        </div>

        <aside className="min-w-0 self-start overflow-x-hidden border-t border-rule pt-6 lg:border-l lg:border-t-0 lg:pl-10 lg:pt-0 lg:sticky lg:top-28 lg:h-[calc(100vh-15rem)] lg:max-h-[44rem] lg:overflow-y-auto">
          <label className="field-group">
            <span className="field-label">Role</span>
            <input value={form.title.replace(" Hiring Test", "")} onChange={(event) => onSetForm({ ...form, title: `${event.target.value} Hiring Test` })} className="field-surface field-control" />
          </label>
          <label className="field-group mt-4">
            <span className="field-label">Candidate emails</span>
            <textarea value={form.candidates} onChange={(event) => onSetForm({ ...form, candidates: event.target.value })} placeholder="candidate@email.com, another@email.com" className="field-surface field-control min-h-24" />
          </label>
          <label className="field-group mt-4">
            <span className="field-label">Deadline</span>
            <input
              type="datetime-local"
              value={form.deadlineAt}
              onChange={(event) => onSetForm({ ...form, deadlineAt: event.target.value })}
              className="field-surface field-control"
            />
          </label>
          <label className="field-group mt-4">
            <span className="field-label">
              Core skills
              <span className="field-hint">Comma separated</span>
            </span>
            <textarea
              value={form.coreSkills}
              onChange={(event) => onSetForm({ ...form, coreSkills: event.target.value })}
              placeholder="Problem Solving, REST API, SQL"
              className="field-surface field-control min-h-20"
            />
          </label>
          {form.coreSkills?.trim() && (
            <div className="mt-3 flex flex-wrap gap-2">
              {form.coreSkills.split(",").map((skill) => skill.trim()).filter(Boolean).slice(0, 12).map((skill) => (
                <span key={skill} className="chip">{skill}</span>
              ))}
            </div>
          )}
          <div className="mt-6 grid grid-cols-3 border-y border-rule">
            <Metric label="Questions" value={form.problems.length} />
            <Metric label="Tests" value={totalTests} />
            <Metric label="Minutes" value={totalProblemMinutes} />
          </div>
        </aside>
      </section>
    </main>
  );
}

function BuilderHeader({ title, onBack, onCreate, isSubmitting }) {
  return (
    <div className="mb-6 min-w-0">
      <button onClick={onBack} className="mb-6 text-sm text-ink-soft transition-colors hover:text-ink">&larr; Templates</button>
      <div className="flex flex-col items-start gap-4 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
        <h1 className="app-title max-w-full">{title}</h1>
        <div className="flex w-full items-center gap-3 sm:w-auto">
          <button onClick={onCreate} disabled={isSubmitting} className="btn-ink w-full sm:w-auto">
            {isSubmitting ? "Creating..." : "Create assessment"}
          </button>
        </div>
      </div>
    </div>
  );
}

function ProblemBuilder({ problem, problemIndex, canDelete, onAddTest, onRemove, onRemoveTest, onUpdate, onUpdateTest }) {
  const [open, setOpen] = useState(problemIndex === 0);

  return (
    <section className="min-w-0 border-b border-rule py-3">
      <div className="flex w-full min-w-0 items-start gap-3 sm:items-center sm:gap-4">
        <button onClick={() => setOpen(!open)} className="flex min-w-0 flex-1 items-start gap-3 text-left sm:items-center sm:gap-4">
          <FaChevronRight className={open ? "shrink-0 rotate-90 text-accent transition" : "shrink-0 text-ink-soft transition"} />
          <SkillIcon index={problemIndex} />
          <span className="min-w-0 flex-1">
            <span className="app-h3 block sm:truncate">{sectionName(problem, problemIndex)}</span>
            <span className="mt-0.5 block text-[13px] text-ink-soft">{problem.tests.length} test cases</span>
          </span>
          <span className="app-eyebrow hidden shrink-0 sm:inline">{problem.timeLimitMinutes} min</span>
        </button>
        {canDelete && (
          <button onClick={onRemove} className="shrink-0 text-[13px] text-ink-soft underline decoration-rule decoration-1 underline-offset-4 transition-colors hover:text-accent hover:decoration-accent" title="Delete section">Delete</button>
        )}
      </div>
      {open && (
        <div className="ml-1.5 mt-4 grid min-w-0 gap-4 overflow-x-hidden border-l border-rule pb-2 pl-6">
          <div className="grid min-w-0 gap-3 md:grid-cols-3">
            <label className="field-group md:col-span-2">
              <span className="field-label">Section name</span>
              <input value={problem.title} onChange={(event) => onUpdate({ title: event.target.value })} className="field-surface field-control" />
            </label>
            <label className="field-group">
              <span className="field-label">Minutes</span>
              <input type="number" min="1" value={problem.timeLimitMinutes} onChange={(event) => onUpdate({ timeLimitMinutes: sanitizeWholeNumberInput(event.target.value) })} className="field-surface field-control" />
            </label>
          </div>
          <label className="field-group">
            <span className="field-label">Problem statement</span>
            <textarea value={problem.prompt} onChange={(event) => onUpdate({ prompt: event.target.value })} className="field-surface field-control min-h-20" />
          </label>
          <label className="field-group">
            <span className="field-label">Starter code</span>
            <textarea value={problem.starterCode} onChange={(event) => onUpdate({ starterCode: event.target.value })} className="field-surface field-control min-h-24 font-mono" />
          </label>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <h3 className="font-semibold text-ink">Test cases</h3>
            <button onClick={onAddTest} className="text-[13px] text-ink-soft underline decoration-rule decoration-1 underline-offset-4 transition-colors hover:text-ink hover:decoration-ink">Add case</button>
          </div>
          <div className="grid min-w-0 gap-2">
            {/* One header row for the whole list — labels don't repeat per case */}
            <div className="hidden xl:grid xl:grid-cols-[1fr_1.15fr_1.15fr_8.5rem_3.5rem] xl:gap-3">
              <span className="app-eyebrow">Case name</span>
              <span className="app-eyebrow">Input JSON</span>
              <span className="app-eyebrow">Expected JSON</span>
              <span className="app-eyebrow">Visible</span>
              <span aria-hidden="true" />
            </div>
            {problem.tests.map((test, testIndex) => (
              <div key={testIndex} className="grid min-w-0 items-center gap-3 xl:grid-cols-[1fr_1.15fr_1.15fr_8.5rem_3.5rem]">
                <input
                  value={test.name}
                  onChange={(event) => onUpdateTest(testIndex, { name: event.target.value })}
                  aria-label="Case name"
                  className="field-surface min-h-11 w-full px-3 py-2 text-sm"
                />
                <input
                  value={test.inputJson}
                  onChange={(event) => onUpdateTest(testIndex, { inputJson: event.target.value })}
                  aria-label="Input JSON"
                  className="field-surface min-h-11 w-full px-3 py-2 font-mono text-sm"
                />
                <input
                  value={test.expectedJson}
                  onChange={(event) => onUpdateTest(testIndex, { expectedJson: event.target.value })}
                  aria-label="Expected JSON"
                  className="field-surface min-h-11 w-full px-3 py-2 font-mono text-sm"
                />
                <label className="flex items-center gap-2.5 text-xs font-medium text-ink">
                  <input
                    type="checkbox"
                    checked={test.visible}
                    onChange={(event) => onUpdateTest(testIndex, { visible: event.target.checked })}
                    className="field-toggle"
                  />
                  <span className="xl:hidden">Visible to candidate</span>
                </label>
                {problem.tests.length > 1 ? (
                  <button
                    onClick={() => onRemoveTest(testIndex)}
                    className="justify-self-start text-[13px] text-ink-soft underline decoration-rule decoration-1 underline-offset-4 transition-colors hover:text-accent hover:decoration-accent"
                    title="Delete test case"
                  >
                    Delete
                  </button>
                ) : (
                  <span aria-hidden="true" />
                )}
              </div>
            ))}
          </div>
          {canDelete && <button onClick={onRemove} className="justify-self-start text-[13px] text-ink-soft underline decoration-rule decoration-1 underline-offset-4 transition-colors hover:text-accent hover:decoration-accent">Delete section</button>}
        </div>
      )}
    </section>
  );
}
