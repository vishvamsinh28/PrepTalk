"use client";

/** @file The interviewer's assessments index — the Lab admin landing view. */

import { formatDate, formatDateTime } from "./adminUtils";

/**
 * Assessments index with search, counts, and per-row actions.
 * Fully controlled: `assessments` arrives already filtered by the parent, and
 * `query`/`setQuery` are lifted so Export can operate on exactly what's on
 * screen rather than the unfiltered set.
 * @param {object} props - Component props.
 * @param {object[]} props.assessments - Assessments to render, already filtered.
 * @param {string} props.query - Current search text.
 * @param {Function} props.setQuery - Search setter.
 * @param {Function} props.onCreate - Starts the create flow.
 * @param {Function} props.onDelete - Deletes an assessment.
 * @param {Function} props.onExport - Exports the visible rows as CSV.
 * @param {Function} props.onOpen - Opens an assessment's detail view.
 * @returns {JSX.Element} The index.
 */
export default function AdminTestList({ assessments, query, setQuery, onCreate, onDelete, onExport, onOpen }) {
  return (
    <main className="relative z-10 mx-auto max-w-7xl">
      <header className="flex flex-wrap items-end justify-between gap-x-10 gap-y-5 border-b border-rule pb-8">
        <div>
          <p className="app-eyebrow">PrepTalk Lab</p>
          <h1 className="app-title mt-4">Assessments</h1>
          <p className="mt-4 max-w-[58ch] text-[15px] leading-[1.7] text-ink-soft">
            Create and manage timed coding screens for assigned candidates.
          </p>
        </div>
        <div className="flex items-center gap-6">
          <button
            onClick={onExport}
            className="text-sm text-ink-soft underline decoration-rule decoration-1 underline-offset-4 transition-colors hover:text-ink hover:decoration-ink"
          >
            Export
          </button>
          <button onClick={onCreate} className="btn-ink">
            Create assessment
          </button>
        </div>
      </header>

      <div className="mt-8 flex flex-wrap items-center justify-between gap-4">
        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          className="field-surface w-full max-w-sm rounded-[4px] px-4 py-2.5 text-sm"
          placeholder="Search by title or candidate"
          aria-label="Search assessments"
        />
        <p className="app-eyebrow">
          {assessments.length} matching assessment{assessments.length === 1 ? "" : "s"}
        </p>
      </div>

      <div className="mt-6">
        <div className="grid grid-cols-[minmax(0,1fr)_6.5rem_6.5rem_5rem] border-b border-rule pb-3">
          <span className="app-eyebrow">Assessment</span>
          <span className="app-eyebrow text-center">Pending</span>
          <span className="app-eyebrow text-center">Completed</span>
          <span aria-hidden="true" />
        </div>

        {assessments.map((assessment) => (
          <TestRow
            key={assessment._id}
            assessment={assessment}
            onOpen={() => onOpen(assessment._id)}
            onDelete={() => onDelete(assessment._id)}
          />
        ))}
        {assessments.length === 0 && (
          <p className="border-b border-rule py-14 text-center text-sm text-ink-soft">
            No assessments match your search.
          </p>
        )}
      </div>
    </main>
  );
}

function TestRow({ assessment, onOpen, onDelete }) {
  const submissions = assessment.submissions || [];
  const completed = submissions.length;
  const candidates = assessment.candidates || [];
  const notAttempted = Math.max(candidates.length - completed, 0);

  return (
    <article className="row-hair grid grid-cols-[minmax(0,1fr)_6.5rem_6.5rem_5rem] items-center px-1 py-5 first:border-t-0">
      <button onClick={onOpen} className="min-w-0 text-left">
        <h2 className="app-h3 truncate">{assessment.title}</h2>
        <p className="mt-1 truncate text-sm text-ink-soft">
          {assessment.description || "No candidate instructions added."}
        </p>
        <p className="app-eyebrow mt-2.5">
          {assessment.problems?.length || 0} sections · {assessment.durationMinutes} min ·{" "}
          {formatDate(assessment.createdAt)} · Due {formatDateTime(assessment.deadlineAt)}
        </p>
      </button>
      <span className="landing-serif text-center text-2xl text-ink">{notAttempted}</span>
      <span className="landing-serif text-center text-2xl text-ink">{completed}</span>
      <button
        onClick={onDelete}
        className="text-center text-[13px] text-ink-soft underline decoration-rule decoration-1 underline-offset-4 transition-colors hover:text-accent hover:decoration-accent"
        aria-label={`Delete ${assessment.title}`}
      >
        Delete
      </button>
    </article>
  );
}
