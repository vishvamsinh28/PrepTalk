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
    <main className="relative z-10 mx-auto w-full max-w-7xl overflow-x-hidden text-sm">
      <button onClick={onBack} className="mb-4 inline-flex items-center gap-2 rounded-lg border border-rule bg-black/5 px-3 py-2 text-sm font-bold text-ink">
        <FaArrowLeft />
        Create assessment
      </button>
      <section className="grid min-w-0 overflow-visible rounded-xl border border-rule bg-white shadow-xl lg:h-[calc(100vh-11rem)] lg:max-h-[43rem] lg:grid-cols-[minmax(0,1.45fr)_minmax(22rem,0.85fr)] lg:overflow-hidden">
        <div className="flex min-h-0 min-w-0 flex-col p-3 sm:p-4 lg:p-5">
          <h1 className="text-2xl font-semibold leading-tight text-ink sm:text-3xl">Start from a template or blank assessment</h1>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-ink-soft">Choose Custom Assessment for anything not covered by the templates. Everything remains editable in the builder.</p>
          <button
            onClick={() => onChooseTemplate(roleTemplates.find((template) => template.id === "custom") || roleTemplates[0])}
            className={`mt-4 flex w-full items-center gap-3 rounded-lg border p-3 text-left sm:p-4 ${
              selectedTemplateId === "custom" ? "border-accent bg-accent/10" : "border-accent bg-accent/10 hover:bg-accent/10"
            }`}
          >
            <span className="grid h-10 w-10 shrink-0 place-items-center rounded-lg border border-accent bg-accent/10 text-accent">
              <FaPlus />
            </span>
            <span className="min-w-0">
              <span className="block text-base font-semibold text-ink">Create custom template</span>
              <span className="mt-1 block text-sm leading-5 text-ink-soft">Start blank for another role, skill, prompt style, or test format.</span>
            </span>
          </button>
          <label className="mt-4 flex items-center gap-3 rounded-lg border border-rule bg-white px-4 py-3 text-base">
            <FaSearch className="text-accent" />
            <input value={roleQuery} onChange={(event) => setRoleQuery(event.target.value)} className="w-full bg-transparent text-ink outline-none placeholder:text-ink-soft" placeholder="Search roles" />
          </label>
          <p className="mt-4 text-xs font-bold uppercase tracking-[0.18em] text-amber-700">Available templates</p>
          <div className="mt-3 grid min-h-0 flex-1 content-start gap-2 pr-1 lg:overflow-y-auto lg:overscroll-contain">
            {visibleRoleTemplates.map((template) => (
              <button
                key={template.id}
                onClick={() => onChooseTemplate(template)}
                className={`grid min-w-0 grid-cols-[2.75rem_minmax(0,1fr)] gap-2.5 rounded-md p-2.5 text-left ${
                  selectedTemplateId === template.id ? "border border-accent bg-accent/10" : "border border-rule bg-black/5 hover:bg-black/5"
                }`}
              >
                <span className="grid h-9 w-9 place-items-center rounded-lg border border-accent bg-accent/10 text-accent">
                  <TemplateIcon name={template.icon} />
                </span>
                <span className="min-w-0">
                  <span className="block text-sm font-semibold text-ink sm:text-base">{template.title}</span>
                  <span className="mt-0.5 block text-xs leading-5 text-ink-soft sm:text-sm">{template.summary}</span>
                </span>
              </button>
            ))}
            {visibleRoleTemplates.length === 0 && <p className="rounded-lg border border-rule bg-black/5 p-4 text-ink-soft">No matching role templates. Use the custom template above to build one from scratch.</p>}
          </div>
        </div>

        <aside className="min-w-0 border-t border-rule bg-white p-3 sm:p-4 lg:overflow-y-auto lg:border-l lg:border-t-0 lg:p-5">
          <div className="flex items-center justify-between gap-4">
            <h2 className="text-2xl font-semibold text-ink">Preview</h2>
            <button onClick={onContinue} className="rounded-lg bg-ink px-5 py-2.5 font-semibold text-canvas">Continue</button>
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
    <div className="mt-4 rounded-xl border border-rule bg-black/5 p-3 sm:p-4">
      <h3 className="text-lg font-semibold leading-tight text-ink">{form.title}</h3>
      <p className="mt-3 text-sm text-ink-soft"><FaClock className="mr-2 inline" />{totalProblemMinutes} mins</p>
      <div className="mt-5 grid gap-4">
        {form.problems.slice(0, 3).map((problem, index) => (
          <div key={`${problem.title || "problem"}-${index}`} className="flex min-w-0 items-center gap-3">
            <SkillIcon index={index} />
            <div className="min-w-0">
              <p className="truncate font-semibold text-ink">{sectionName(problem, index)}</p>
              <p className="mt-0.5 text-sm text-ink-soft">{problem.tests.length} test cases</p>
            </div>
          </div>
        ))}
      </div>
      <p className="mt-5 rounded-lg border border-amber-600/40 bg-amber-50 p-3 text-sm text-amber-700">Next step opens the editable builder.</p>
    </div>
  );
}

function TemplateIcon({ name }) {
  if (name === "globe") return <FaGlobe />;
  if (name === "puzzle") return <FaPuzzlePiece />;
  if (name === "code") return <FaCode />;
  return <FaCode />;
}
