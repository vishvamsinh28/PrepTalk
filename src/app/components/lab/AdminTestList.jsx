"use client";

import { FaCalendarAlt, FaChevronRight, FaClock, FaDownload, FaPlus, FaSearch, FaTags, FaTrash } from "react-icons/fa";
import { formatDate, formatDateTime } from "./adminUtils";

export default function AdminTestList({ assessments, query, setQuery, onCreate, onDelete, onExport, onOpen }) {
  return (
    <main className="relative z-10 mx-auto max-w-7xl">
      <section className="glass-panel rounded-xl p-6">
        <div>
          <div className="text-sm font-bold text-cyan-200">Lab <FaChevronRight className="mx-2 inline text-xs text-slate-500" /> Assessments</div>
          <div className="mt-6 flex flex-wrap items-end justify-between gap-4">
            <div>
              <h1 className="text-4xl font-black tracking-tight gradient-text">Lab assessments</h1>
              <p className="mt-3 max-w-2xl text-slate-300">Create and manage timed coding screens for assigned candidates.</p>
            </div>
            <div className="flex gap-3">
              <button onClick={onExport} className="inline-flex items-center gap-2 rounded-lg border border-white/10 bg-white/8 px-5 py-3 font-bold text-slate-100">
                <FaDownload />
                Export
              </button>
              <button onClick={onCreate} className="inline-flex items-center gap-2 rounded-lg bg-linear-to-r from-cyan-300 via-emerald-300 to-blue-400 px-6 py-3 font-black text-slate-950">
                <FaPlus />
                Create assessment
              </button>
            </div>
          </div>
        </div>
      </section>

      <section className="mt-6 grid gap-6 lg:grid-cols-[22rem_minmax(0,1fr)]">
        <aside className="glass-panel rounded-xl p-5">
          <h2 className="mb-6 text-lg font-black text-white">Find assessments</h2>
          <label className="block">
            <span className="mb-3 block text-sm font-medium text-slate-300">Search by title or candidate</span>
            <span className="flex items-center gap-3 rounded-lg border border-white/10 bg-slate-950/45 px-4 py-3">
              <FaSearch className="text-cyan-200" />
              <input value={query} onChange={(event) => setQuery(event.target.value)} className="w-full bg-transparent text-slate-100 outline-none placeholder:text-slate-500" placeholder="Search assessments" />
            </span>
          </label>
          <div className="mt-6 rounded-lg border border-cyan-300/15 bg-cyan-300/10 p-4 text-sm leading-6 text-slate-300">
            Showing {assessments.length} matching assessment{assessments.length === 1 ? "" : "s"}.
          </div>
        </aside>

        <section className="flex max-h-[34rem] min-h-[18rem] flex-col overflow-hidden rounded-xl border border-white/10 bg-slate-950/45 shadow-xl shadow-black/20">
          <div className="grid shrink-0 grid-cols-[minmax(0,1fr)_8rem_8rem_4rem] bg-white/5 px-5 py-5 text-sm font-black text-slate-200">
            <span>Assessment</span>
            <span>Pending</span>
            <span>Completed</span>
            <span />
          </div>
          <div className="min-h-0 flex-1 divide-y divide-white/10 overflow-auto">
            {assessments.map((assessment) => (
              <TestRow key={assessment._id} assessment={assessment} onOpen={() => onOpen(assessment._id)} onDelete={() => onDelete(assessment._id)} />
            ))}
            {assessments.length === 0 && <div className="p-8 text-slate-400">No assessments match your search.</div>}
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
    <article className="grid grid-cols-[minmax(0,1fr)_8rem_8rem_4rem] items-center px-5 py-6 text-slate-200">
      <button onClick={onOpen} className="min-w-0 text-left">
        <div className="flex items-center gap-4">
          <div className="min-w-0">
            <h2 className="truncate text-xl font-black text-white">{assessment.title}</h2>
            <p className="mt-2 text-slate-400">{assessment.description || "No candidate instructions added."}</p>
            <p className="mt-3 flex flex-wrap gap-5 text-sm text-slate-400">
              <span><FaTags className="mr-2 inline" />{assessment.problems?.length || 0}</span>
              <span><FaClock className="mr-2 inline" />{assessment.durationMinutes}m</span>
              <span><FaCalendarAlt className="mr-2 inline" />{formatDate(assessment.createdAt)}</span>
              <span>Due {formatDateTime(assessment.deadlineAt)}</span>
            </p>
          </div>
        </div>
      </button>
      <span>{notAttempted}</span>
      <span>{completed}</span>
      <button onClick={onDelete} className="text-rose-200" title="Delete assessment"><FaTrash /></button>
    </article>
  );
}
