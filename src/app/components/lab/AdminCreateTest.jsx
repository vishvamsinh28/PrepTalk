"use client";

import { useState } from "react";
import { FaArrowLeft, FaClock, FaCode, FaGlobe, FaPlus, FaPuzzlePiece, FaSearch } from "react-icons/fa";
import { SkillIcon } from "./AdminShared";
import { sectionName, toWholeNumber } from "./adminUtils";

export default function AdminCreateTest({ form, roleTemplates, selectedTemplateId, onBack, onChooseTemplate, onContinue }) {
  const [roleQuery, setRoleQuery] = useState("");
  const visibleTemplates = roleTemplates.filter((template) => `${template.title} ${template.summary}`.toLowerCase().includes(roleQuery.toLowerCase()));
  const visibleRoleTemplates = visibleTemplates.filter((template) => template.id !== "custom");

  return (
    <main className="relative z-10 mx-auto max-w-7xl">
      <button onClick={onBack} className="mb-6 inline-flex items-center gap-3 rounded-lg border border-white/10 bg-white/8 px-4 py-3 font-bold text-slate-100">
        <FaArrowLeft />
        Create assessment
      </button>
      <section className="grid overflow-hidden rounded-xl border border-white/10 bg-slate-950/45 shadow-xl shadow-black/20 lg:grid-cols-[minmax(0,1.45fr)_minmax(25rem,0.95fr)]">
        <div className="p-8 lg:p-12">
          <h1 className="text-3xl font-black text-white">Start from a template or blank assessment</h1>
          <p className="mt-3 text-slate-300">Choose Custom Assessment for anything not covered by the templates. Everything remains editable in the builder.</p>
          <button
            onClick={() => onChooseTemplate(roleTemplates.find((template) => template.id === "custom") || roleTemplates[0])}
            className={`mt-7 flex w-full items-center gap-4 rounded-lg border p-5 text-left ${
              selectedTemplateId === "custom" ? "border-cyan-300/45 bg-cyan-300/12" : "border-cyan-300/25 bg-cyan-300/8 hover:bg-cyan-300/12"
            }`}
          >
            <span className="grid h-12 w-12 shrink-0 place-items-center rounded-lg border border-cyan-300/35 bg-cyan-300/12 text-cyan-100">
              <FaPlus />
            </span>
            <span className="min-w-0">
              <span className="block text-lg font-black text-white">Create custom template</span>
              <span className="mt-1 block text-sm leading-6 text-slate-300">Start blank for another role, skill, prompt style, or test format.</span>
            </span>
          </button>
          <label className="mt-8 flex items-center gap-5 rounded-lg border border-white/10 bg-slate-950/45 px-5 py-4 text-lg">
            <FaSearch className="text-cyan-200" />
            <input value={roleQuery} onChange={(event) => setRoleQuery(event.target.value)} className="w-full bg-transparent text-slate-100 outline-none placeholder:text-slate-500" placeholder="Search roles" />
          </label>
          <p className="mt-10 text-sm font-bold uppercase tracking-[0.18em] text-amber-200">Available templates</p>
          <div className="mt-8 grid gap-4">
            {visibleRoleTemplates.map((template) => (
              <button
                key={template.id}
                onClick={() => onChooseTemplate(template)}
                className={`grid grid-cols-[4.5rem_minmax(0,1fr)] gap-4 rounded-md p-5 text-left ${
                  selectedTemplateId === template.id ? "border border-cyan-300/35 bg-cyan-300/10" : "border border-white/10 bg-white/5 hover:bg-white/8"
                }`}
              >
                <span className="grid h-14 w-14 place-items-center rounded-xl border border-cyan-300/25 bg-cyan-300/10 text-cyan-100">
                  <TemplateIcon name={template.icon} />
                </span>
                <span>
                  <span className="block text-lg font-black text-white">{template.title}</span>
                  <span className="mt-2 block leading-7 text-slate-300">{template.summary}</span>
                </span>
              </button>
            ))}
            {visibleRoleTemplates.length === 0 && <p className="rounded-lg border border-white/10 bg-white/5 p-4 text-slate-400">No matching role templates. Use the custom template above to build one from scratch.</p>}
          </div>
        </div>

        <aside className="border-l border-white/10 bg-slate-950/35 p-8 lg:p-12">
          <div className="flex items-center justify-between gap-4">
            <h2 className="text-3xl font-black text-white">Preview</h2>
            <button onClick={onContinue} className="rounded-lg bg-linear-to-r from-cyan-300 via-emerald-300 to-blue-400 px-6 py-4 font-black text-slate-950">Continue</button>
          </div>
          <PreviewCard form={form} />
        </aside>
      </section>
    </main>
  );
}

function PreviewCard({ form }) {
  const totalProblemMinutes = form.problems.reduce((total, problem) => total + toWholeNumber(problem.timeLimitMinutes, 0), 0);

  return (
    <div className="mt-10 rounded-xl border border-white/10 bg-white/5 p-8">
      <h3 className="text-xl font-black text-white">{form.title}</h3>
      <p className="mt-4 text-slate-300"><FaClock className="mr-2 inline" />{totalProblemMinutes} mins</p>
      <div className="mt-10 grid gap-8">
        {form.problems.slice(0, 3).map((problem, index) => (
          <div key={problem.title} className="flex items-center gap-4">
            <SkillIcon index={index} />
            <div>
              <p className="font-black text-white">{sectionName(problem, index)}</p>
              <p className="mt-1 text-slate-400">{problem.tests.length} test cases</p>
            </div>
          </div>
        ))}
      </div>
      <p className="mt-10 rounded-lg border border-amber-300/20 bg-amber-300/10 p-4 text-amber-100">Next step opens the editable builder.</p>
    </div>
  );
}

function TemplateIcon({ name }) {
  if (name === "globe") return <FaGlobe />;
  if (name === "puzzle") return <FaPuzzlePiece />;
  if (name === "code") return <FaCode />;
  return <FaCode />;
}
