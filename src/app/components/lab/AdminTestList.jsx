"use client";

import { FaCalendarAlt, FaChevronRight, FaClock, FaDownload, FaPlus, FaSearch, FaTags, FaTrash } from "react-icons/fa";
import { formatDate, formatDateTime } from "./adminUtils";

export default function AdminTestList({ assessments, query, setQuery, onCreate, onDelete, onExport, onOpen }) {
  return (
    <main className="relative z-10 mx-auto flex min-h-0 max-w-7xl flex-col lg:h-[calc(100svh-8rem)]">
      <section className="panel rounded-[4px] p-4 sm:p-5">
        <div>
          <div className="text-sm font-bold text-accent">Lab <FaChevronRight className="mx-2 inline text-xs text-ink-soft" /> Assessments</div>
          <div className="mt-4 flex flex-wrap items-end justify-between gap-4">
            <div>
              <h1 className="app-title">Lab assessments</h1>
              <p className="mt-2 max-w-2xl text-sm text-ink-soft sm:text-base">Create and manage timed coding screens for assigned candidates.</p>
            </div>
            <div className="grid w-full grid-cols-2 gap-3 sm:flex sm:w-auto">
              <button onClick={onExport} className="inline-flex items-center justify-center gap-2 rounded-[4px] border border-rule bg-black/5 px-4 py-3 font-bold text-ink">
                <FaDownload />
                Export
              </button>
              <button onClick={onCreate} className="inline-flex items-center justify-center gap-2 rounded-[4px] bg-ink px-4 py-3 font-semibold text-canvas sm:px-5">
                <FaPlus />
                Create assessment
              </button>
            </div>
          </div>
        </div>
      </section>

      <section className="mt-4 grid min-h-0 flex-1 gap-4 lg:grid-cols-[20rem_minmax(0,1fr)]">
        <aside className="panel rounded-[4px] p-4 lg:self-stretch">
          <h2 className="mb-4 text-lg font-semibold text-ink">Find assessments</h2>
          <label className="block">
            <span className="mb-3 block text-sm font-medium text-ink-soft">Search by title or candidate</span>
            <span className="flex items-center gap-3 rounded-[4px] border border-rule bg-white px-4 py-3">
              <FaSearch className="text-accent" />
              <input value={query} onChange={(event) => setQuery(event.target.value)} className="w-full bg-transparent text-ink outline-none placeholder:text-ink-soft" placeholder="Search assessments" />
            </span>
          </label>
          <div className="mt-4 rounded-[4px] border border-accent bg-accent/10 p-4 text-sm leading-6 text-ink-soft">
            Showing {assessments.length} matching assessment{assessments.length === 1 ? "" : "s"}.
          </div>
        </aside>

        <section className="flex min-h-[18rem] flex-col overflow-hidden rounded-[4px] border border-rule bg-white shadow-xl lg:min-h-0">
          <div className="hidden shrink-0 grid-cols-[minmax(0,1fr)_6.5rem_6.5rem_5rem] bg-black/5 px-5 py-4 text-sm font-semibold text-ink md:grid">
            <span>Assessment</span>
            <span className="text-center">Pending</span>
            <span className="text-center">Completed</span>
            <span className="text-center">Delete</span>
          </div>
          <div className="min-h-0 flex-1 divide-y divide-white/10 overflow-auto">
            {assessments.map((assessment) => (
              <TestRow key={assessment._id} assessment={assessment} onOpen={() => onOpen(assessment._id)} onDelete={() => onDelete(assessment._id)} />
            ))}
            {assessments.length === 0 && <div className="p-8 text-ink-soft">No assessments match your search.</div>}
          </div>
        </section>
      </section>
    </main>
  );
}

function TestRow({ assessment, onOpen, onDelete }) {
  const submissions = assessment.submissions || [];
  const completed = submissions.length;
  const candidates = assessment.candidates || [];
  const notAttempted = Math.max(candidates.length - completed, 0);

  return (
    <article className="grid gap-4 px-4 py-5 text-ink md:grid-cols-[minmax(0,1fr)_6.5rem_6.5rem_5rem] md:items-center md:px-5 md:py-4">
      <button onClick={onOpen} className="min-w-0 text-left">
        <div className="flex items-center gap-4">
          <div className="min-w-0">
            <h2 className="text-lg font-semibold leading-tight text-ink md:truncate md:text-xl">{assessment.title}</h2>
            <p className="mt-1 text-sm text-ink-soft md:truncate md:text-base">{assessment.description || "No candidate instructions added."}</p>
            <p className="mt-3 flex flex-wrap gap-x-5 gap-y-2 text-sm text-ink-soft">
              <span><FaTags className="mr-2 inline" />{assessment.problems?.length || 0}</span>
              <span><FaClock className="mr-2 inline" />{assessment.durationMinutes}m</span>
              <span><FaCalendarAlt className="mr-2 inline" />{formatDate(assessment.createdAt)}</span>
              <span>Due {formatDateTime(assessment.deadlineAt)}</span>
            </p>
          </div>
        </div>
      </button>
      <div className="grid grid-cols-3 gap-3 md:contents">
        <span className="rounded-[4px] border border-rule bg-black/5 px-3 py-2 text-sm md:border-0 md:bg-transparent md:px-0 md:py-0 md:text-center md:text-base">
          <span className="block text-xs font-bold uppercase text-ink-soft md:hidden">Pending</span>
          {notAttempted}
        </span>
        <span className="rounded-[4px] border border-rule bg-black/5 px-3 py-2 text-sm md:border-0 md:bg-transparent md:px-0 md:py-0 md:text-center md:text-base">
          <span className="block text-xs font-bold uppercase text-ink-soft md:hidden">Completed</span>
          {completed}
        </span>
        <button onClick={onDelete} className="rounded-[4px] border border-rose-200/20 bg-rose-200/5 px-3 py-2 text-left text-sm text-rose-700 md:border-0 md:bg-transparent md:px-0 md:py-0 md:text-center md:text-base" title="Delete assessment" aria-label={`Delete ${assessment.title}`}>
          <span className="block text-xs font-bold uppercase text-rose-700/60 md:hidden">Delete</span>
          <FaTrash className="mt-1 inline md:mt-0" />
        </button>
      </div>
    </article>
  );
}
