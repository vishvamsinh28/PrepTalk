"use client";

import { useState } from "react";
import { SkillIcon } from "./AdminShared";
import { sectionName, toWholeNumber } from "./adminUtils";

export default function AdminCreateTest({ form, roleTemplates, selectedTemplateId, onBack, onChooseTemplate, onContinue }) {
  const [roleQuery, setRoleQuery] = useState("");
  const visibleTemplates = roleTemplates.filter((template) => `${template.title} ${template.summary}`.toLowerCase().includes(roleQuery.toLowerCase()));
  const visibleRoleTemplates = visibleTemplates.filter((template) => template.id !== "custom");

  return (
    <main className="relative z-10 mx-auto w-full max-w-7xl overflow-x-hidden text-sm">
      <button
        onClick={onBack}
        className="mb-6 text-sm text-ink-soft transition-colors hover:text-ink"
      >
        &larr; Back to assessments
      </button>
      <section className="grid min-w-0 overflow-visible rounded-[4px] border border-rule bg-white shadow-xl lg:h-[calc(100vh-11rem)] lg:max-h-[43rem] lg:grid-cols-[minmax(0,1.45fr)_minmax(22rem,0.85fr)] lg:overflow-hidden">
        <div className="flex min-h-0 min-w-0 flex-col p-3 sm:p-4 lg:p-5">
          <p className="app-eyebrow">New assessment</p>
          <h1 className="app-h2 mt-3">Start from a template, or blank</h1>
          <p className="mt-3 max-w-[60ch] text-sm leading-[1.7] text-ink-soft">
            Pick the closest role and edit it in the builder, or start from scratch.
            Nothing here is locked in.
          </p>

          <button
            onClick={() => onChooseTemplate(roleTemplates.find((template) => template.id === "custom") || roleTemplates[0])}
            className={`mt-6 flex w-full items-baseline justify-between gap-4 border-b border-t border-rule py-4 text-left transition-colors ${
              selectedTemplateId === "custom" ? "bg-accent/5" : "hover:bg-black/[0.02]"
            }`}
          >
            <span className="min-w-0">
              <span className="app-h3 block">Custom assessment</span>
              <span className="mt-1 block text-sm leading-[1.6] text-ink-soft">
                Start blank for another role, skill, or test format.
              </span>
            </span>
            <span aria-hidden="true" className="text-accent">
              +
            </span>
          </button>

          <label className="mt-6 block">
            <span className="sr-only">Search roles</span>
            <input
              value={roleQuery}
              onChange={(event) => setRoleQuery(event.target.value)}
              className="field-surface w-full rounded-[4px] px-4 py-3 text-sm"
              placeholder="Search roles"
            />
          </label>

          <p className="app-eyebrow mt-8">Available templates</p>
          <div className="mt-3 min-h-0 flex-1 pr-1 lg:overflow-y-auto lg:overscroll-contain">
            {visibleRoleTemplates.map((template) => (
              <button
                key={template.id}
                onClick={() => onChooseTemplate(template)}
                className={`row-hair block w-full px-1 py-4 text-left ${
                  selectedTemplateId === template.id ? "bg-accent/5" : ""
                }`}
              >
                <span className="flex items-baseline justify-between gap-4">
                  <span className="app-h3">{template.title}</span>
                  {selectedTemplateId === template.id && (
                    <span className="app-eyebrow shrink-0 text-accent">Selected</span>
                  )}
                </span>
                <span className="mt-1 block text-sm leading-[1.6] text-ink-soft">
                  {template.summary}
                </span>
              </button>
            ))}
            {visibleRoleTemplates.length === 0 && (
              <p className="border-y border-rule py-10 text-center text-sm text-ink-soft">
                No matching roles. Use the custom assessment above to build one from scratch.
              </p>
            )}
          </div>
        </div>

        <aside className="min-w-0 border-t border-rule bg-white p-3 sm:p-4 lg:overflow-y-auto lg:border-l lg:border-t-0 lg:p-5">
          <div className="flex items-center justify-between gap-4 border-b border-rule pb-4">
            <div>
              <p className="app-eyebrow">Preview</p>
              <h2 className="app-h2 mt-3">Selected</h2>
            </div>
            <button onClick={onContinue} className="btn-ink shrink-0">
              Continue
            </button>
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
    <div className="mt-6">
      <h3 className="app-h3">{form.title}</h3>
      <p className="app-eyebrow mt-2">{totalProblemMinutes} minutes</p>

      <ul className="mt-6">
        {form.problems.slice(0, 3).map((problem, index) => (
          <li
            key={`${problem.title || "problem"}-${index}`}
            className="row-hair flex min-w-0 gap-4 px-1 py-3.5"
          >
            <SkillIcon index={index} />
            <div className="min-w-0">
              <p className="truncate text-sm font-medium text-ink">
                {sectionName(problem, index)}
              </p>
              <p className="mt-0.5 text-[13px] text-ink-soft">
                {problem.tests.length} test cases
              </p>
            </div>
          </li>
        ))}
      </ul>

      <p className="mt-6 text-[13px] text-ink-soft">
        Continue opens the editable builder.
      </p>
    </div>
  );
}
