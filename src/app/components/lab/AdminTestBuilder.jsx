"use client";

import { useState } from "react";
import { FaChevronRight, FaClock, FaPlus, FaTrash } from "react-icons/fa";
import { Metric, SkillIcon } from "./AdminShared";
import { sanitizeWholeNumberInput, sectionName, toWholeNumber } from "./adminUtils";

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
        <div className="flex min-w-0 flex-col rounded-xl border border-white/10 bg-slate-950/45 shadow-xl shadow-black/20 lg:h-[calc(100vh-15rem)] lg:max-h-[44rem]">
          <div className="shrink-0 flex flex-col gap-3 border-b border-white/10 px-4 py-4 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between sm:px-8 sm:py-5">
            <div className="flex flex-wrap items-center gap-3">
              <span className="text-base font-black text-white">Assessment duration:</span>
              <span className="rounded-md border border-emerald-300/20 bg-emerald-300/10 px-3 py-1.5 text-sm font-black text-emerald-100 sm:text-base">
                {totalProblemMinutes} mins
              </span>
            </div>
            <span className="inline-flex items-center gap-2 text-slate-300"><span className="h-3 w-3 rounded-full bg-amber-300" /> Draft</span>
          </div>

          <div className="flex min-h-0 flex-1 flex-col p-3 sm:p-5">
            <div className="mb-4 shrink-0 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <h2 className="text-xl font-black text-white sm:text-2xl">Sections ({form.problems.length})</h2>
              <button onClick={onAddProblem} className="inline-flex w-full items-center justify-center gap-2 rounded-lg border border-cyan-300/25 bg-cyan-300/10 px-3 py-2 text-sm font-bold text-cyan-100 sm:w-auto"><FaPlus /> Add section</button>
            </div>
            <div className="grid min-h-0 flex-1 content-start gap-2 overflow-y-auto overscroll-contain pr-1 sm:pr-2">
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

        <aside className="glass-panel min-w-0 self-start overflow-x-hidden rounded-xl p-4 sm:p-5 lg:sticky lg:top-28 lg:h-[calc(100vh-15rem)] lg:max-h-[44rem] lg:overflow-y-auto">
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
                <span key={skill} className="rounded-full border border-white/10 bg-white/8 px-2.5 py-1 text-xs font-semibold text-slate-200">{skill}</span>
              ))}
            </div>
          )}
          <div className="mt-5 grid gap-2 text-center text-sm sm:grid-cols-3">
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
      <button onClick={onBack} className="mb-4 text-cyan-200">Templates <FaChevronRight className="mx-2 inline text-xs text-slate-500" /> Builder</button>
      <div className="flex flex-col items-start gap-4 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
        <h1 className="max-w-full text-2xl font-black leading-tight text-white sm:text-3xl lg:text-4xl">{title}</h1>
        <div className="flex w-full items-center gap-3 sm:w-auto">
          <button onClick={onCreate} disabled={isSubmitting} className="w-full rounded-lg bg-linear-to-r from-cyan-300 via-emerald-300 to-blue-400 px-4 py-2.5 font-black text-slate-950 disabled:opacity-60 sm:w-auto sm:px-6">
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
    <section className="min-w-0 border-b border-white/10 py-3">
      <div className="flex w-full min-w-0 items-start gap-3 sm:items-center sm:gap-4">
        <button onClick={() => setOpen(!open)} className="flex min-w-0 flex-1 items-start gap-3 text-left sm:items-center sm:gap-4">
          <FaChevronRight className={open ? "shrink-0 rotate-90 text-cyan-200 transition" : "shrink-0 text-slate-500 transition"} />
          <SkillIcon index={problemIndex} />
          <span className="min-w-0 flex-1">
            <span className="block text-base font-semibold leading-snug text-white sm:truncate">{sectionName(problem, problemIndex)}</span>
            <span className="text-sm text-slate-400">{problem.tests.length} test cases configured</span>
          </span>
          <span className="hidden shrink-0 text-slate-300 sm:inline"><FaClock className="mr-2 inline" />{problem.timeLimitMinutes} mins</span>
        </button>
        {canDelete && (
          <button onClick={onRemove} className="grid h-9 w-9 shrink-0 place-items-center rounded-md border border-rose-300/20 bg-rose-400/10 text-rose-100" title="Delete section">
            <FaTrash />
          </button>
        )}
      </div>
      {open && (
        <div className="mt-4 grid min-w-0 gap-3 overflow-x-hidden rounded-lg border border-white/10 bg-slate-950/35 p-3 sm:p-4">
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
            <h3 className="font-black text-white">Test cases</h3>
            <button onClick={onAddTest} className="inline-flex items-center gap-2 font-bold text-cyan-100"><FaPlus /> Add case</button>
          </div>
          <div className="grid min-w-0 gap-2">
            {problem.tests.map((test, testIndex) => (
              <div key={testIndex} className="grid min-w-0 gap-2 rounded-lg border border-white/10 bg-white/5 p-3 xl:grid-cols-[1fr_1.15fr_1.15fr_auto_auto]">
                <label className="field-group">
                  <span className="field-label">Case name</span>
                  <input value={test.name} onChange={(event) => onUpdateTest(testIndex, { name: event.target.value })} className="field-surface field-control" />
                </label>
                <label className="field-group">
                  <span className="field-label">Input JSON</span>
                  <input value={test.inputJson} onChange={(event) => onUpdateTest(testIndex, { inputJson: event.target.value })} className="field-surface field-control font-mono" />
                </label>
                <label className="field-group">
                  <span className="field-label">Expected JSON</span>
                  <input value={test.expectedJson} onChange={(event) => onUpdateTest(testIndex, { expectedJson: event.target.value })} className="field-surface field-control font-mono" />
                </label>
                <label className="flex items-center gap-3 rounded-md border border-white/10 bg-slate-950/30 px-3 py-2 text-xs font-bold text-slate-200 xl:mt-6">
                  <input type="checkbox" checked={test.visible} onChange={(event) => onUpdateTest(testIndex, { visible: event.target.checked })} className="field-toggle" />
                  Visible to candidate
                </label>
                {problem.tests.length > 1 && (
                  <button onClick={() => onRemoveTest(testIndex)} className="grid h-10 w-10 place-items-center rounded-md border border-rose-300/20 bg-rose-400/10 text-rose-100 xl:mt-6" title="Delete test case">
                    <FaTrash />
                  </button>
                )}
              </div>
            ))}
          </div>
          {canDelete && <button onClick={onRemove} className="justify-self-start rounded-md border border-rose-300/20 bg-rose-400/10 px-4 py-2 text-sm font-bold text-rose-100">Delete section</button>}
        </div>
      )}
    </section>
  );
}
