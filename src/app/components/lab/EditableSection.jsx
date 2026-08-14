"use client";

import { useState } from "react";
import { FaChevronRight } from "react-icons/fa";
import { sectionName, sanitizeWholeNumberInput } from "./adminUtils";
/** @file One collapsible section (problem) in the assessment editor. */

import { SkillIcon } from "./AdminShared";

/**
 * Collapsible editor for one section: name, minutes, prompt, starter code, tests.
 * Only the first section starts expanded, so a long assessment opens as a
 * scannable list rather than a wall of forms.
 * Fully controlled — every edit goes up through `onUpdate`/`onUpdateTest`, so
 * the parent holds the single source of truth and this keeps no draft copy that
 * could drift.
 * Numeric input is filtered through `sanitizeWholeNumberInput`, which permits a
 * transiently empty field while the user retypes.
 * @param {object} props - Component props.
 * @param {object} props.problem - Section being edited.
 * @param {number} props.problemIndex - Position, used for the label and default open state.
 * @param {Function} props.onAddTest - Appends a blank test case.
 * @param {Function} props.onRemoveTest - Removes a test case by index.
 * @param {Function} props.onUpdate - Merges a partial patch into the section.
 * @param {Function} props.onUpdateTest - Merges a partial patch into one test case.
 * @returns {JSX.Element} The section editor.
 */
export default function EditableSection({ problem, problemIndex, onAddTest, onRemoveTest, onUpdate, onUpdateTest }) {
  const [open, setOpen] = useState(problemIndex === 0);
  const tests = problem.tests || [];

  return (
    <section className="min-w-0 border-b border-rule py-3">
      <button onClick={() => setOpen(!open)} className="flex w-full min-w-0 items-center gap-3 text-left sm:gap-4">
        <FaChevronRight className={open ? "shrink-0 rotate-90 text-accent transition" : "shrink-0 text-ink-soft transition"} />
        <SkillIcon index={problemIndex} />
        <span className="min-w-0 flex-1">
          <span className="block truncate text-base font-semibold text-ink">{sectionName(problem, problemIndex)}</span>
          <span className="text-sm text-ink-soft">{tests.length} test case{tests.length === 1 ? "" : "s"}</span>
        </span>
        <span className="hidden shrink-0 text-ink-soft sm:inline">{problem.timeLimitMinutes} mins</span>
      </button>
      {open && (
        <div className="ml-1.5 mt-4 grid min-w-0 gap-4 overflow-x-hidden border-l border-rule pb-2 pl-6">
          <div className="grid min-w-0 gap-3 md:grid-cols-3">
            <label className="field-group md:col-span-2">
              <span className="field-label">Section name</span>
              <input value={problem.title || ""} onChange={(event) => onUpdate({ title: event.target.value })} className="field-surface field-control" />
            </label>
            <label className="field-group">
              <span className="field-label">Minutes</span>
              <input type="number" min="1" value={problem.timeLimitMinutes || ""} onChange={(event) => onUpdate({ timeLimitMinutes: sanitizeWholeNumberInput(event.target.value) })} className="field-surface field-control" />
            </label>
          </div>
          <label className="field-group">
            <span className="field-label">Problem statement</span>
            <textarea value={problem.prompt || ""} onChange={(event) => onUpdate({ prompt: event.target.value })} className="field-surface field-control min-h-20" />
          </label>
          <label className="field-group">
            <span className="field-label">Starter code</span>
            <textarea value={problem.starterCode || ""} onChange={(event) => onUpdate({ starterCode: event.target.value })} className="field-surface field-control min-h-24 font-mono" />
          </label>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h3 className="font-semibold text-ink">Test cases</h3>
            <button
              onClick={onAddTest}
              className="text-[13px] text-ink-soft underline decoration-rule decoration-1 underline-offset-4 transition-colors hover:text-ink hover:decoration-ink"
            >
              Add case
            </button>
          </div>
          <div className="max-h-[24rem] overflow-auto pr-1">
            <div className="grid min-w-0 gap-2">
              {/* One header row for the whole list — labels don't repeat per case */}
              <div className="hidden xl:grid xl:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)_minmax(0,1.1fr)_8.5rem_3.5rem] xl:gap-3">
                <span className="app-eyebrow">Case name</span>
                <span className="app-eyebrow">Input JSON</span>
                <span className="app-eyebrow">Expected JSON</span>
                <span className="app-eyebrow">Visible</span>
                <span aria-hidden="true" />
              </div>
              {tests.map((test, testIndex) => (
                <div key={testIndex} className="grid min-w-0 items-center gap-3 xl:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)_minmax(0,1.1fr)_8.5rem_3.5rem]">
                  <input
                    value={test.name || ""}
                    onChange={(event) => onUpdateTest(testIndex, { name: event.target.value })}
                    aria-label="Case name"
                    className="field-surface min-h-11 w-full min-w-0 px-3 py-2 text-sm"
                  />
                  <input
                    value={test.inputJson || ""}
                    onChange={(event) => onUpdateTest(testIndex, { inputJson: event.target.value })}
                    aria-label="Input JSON"
                    className="field-surface min-h-11 w-full min-w-0 px-3 py-2 font-mono text-sm"
                  />
                  <input
                    value={test.expectedJson || ""}
                    onChange={(event) => onUpdateTest(testIndex, { expectedJson: event.target.value })}
                    aria-label="Expected JSON"
                    className="field-surface min-h-11 w-full min-w-0 px-3 py-2 font-mono text-sm"
                  />
                  <label className="flex items-center gap-2.5 text-xs font-medium text-ink">
                    <input
                      type="checkbox"
                      checked={Boolean(test.visible)}
                      onChange={(event) => onUpdateTest(testIndex, { visible: event.target.checked })}
                      className="field-toggle"
                    />
                    <span className="xl:hidden">Visible</span>
                  </label>
                  {tests.length > 1 ? (
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
          </div>
        </div>
      )}
    </section>
  );
}
