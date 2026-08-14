"use client";

import { useEffect, useState } from "react";
import { formatDateTime, toWholeNumber } from "./adminUtils";
import { buildAssessmentReport, createReportPdf, slugify, toDateTimeLocalValue, parseRecipientList, cloneAssessmentProblems } from "./assessmentReport";
import EditableSection from "./EditableSection";
import ReportViewer from "./ReportViewer";

/**
 * Assessment detail: header actions (report, PDF, link, delete),
 * editable sections, and assignment settings.
 * @param {{ assessment: object, notice: string, onBack: Function,
 *   onDelete: Function, onUpdate: Function }} props
 */
export default function AdminAssessmentDetail({ assessment, notice, onBack, onDelete, onUpdate }) {
  const inviteLink = typeof window === "undefined" ? "" : `${window.location.origin}/lab?assessment=${assessment._id}`;
  const candidates = assessment.candidates || [];
  const coreSkills = assessment.coreSkills || [];
  const submissions = assessment.submissions || [];
  const [showReport, setShowReport] = useState(false);
  const [settings, setSettings] = useState(() => ({
    candidates: candidates.join(", "),
    coreSkills: coreSkills.join(", "),
    deadlineAt: toDateTimeLocalValue(assessment.deadlineAt),
  }));
  const [draftProblems, setDraftProblems] = useState(() => cloneAssessmentProblems(assessment.problems));
  const inviteRecipients = parseRecipientList(settings.candidates);
  const report = buildAssessmentReport(assessment);

  useEffect(() => {
    setSettings({
      candidates: (assessment.candidates || []).join(", "),
      coreSkills: (assessment.coreSkills || []).join(", "),
      deadlineAt: toDateTimeLocalValue(assessment.deadlineAt),
    });
    setDraftProblems(cloneAssessmentProblems(assessment.problems));
  }, [assessment]);

  const updateProblem = (problemIndex, patch) => {
    setDraftProblems((previous) => previous.map((problem, index) => (
      index === problemIndex ? { ...problem, ...patch } : problem
    )));
  };

  const updateTest = (problemIndex, testIndex, patch) => {
    setDraftProblems((previous) => previous.map((problem, index) => (
      index === problemIndex
        ? {
            ...problem,
            tests: (problem.tests || []).map((test, currentTestIndex) => (
              currentTestIndex === testIndex ? { ...test, ...patch } : test
            )),
          }
        : problem
    )));
  };

  const addTest = (problemIndex) => {
    setDraftProblems((previous) => previous.map((problem, index) => (
      index === problemIndex
        ? {
            ...problem,
            tests: [
              ...(problem.tests || []),
              { name: `Test Case ${(problem.tests || []).length + 1}`, inputJson: "[]", expectedJson: "null", visible: true },
            ],
          }
        : problem
    )));
  };

  const removeTest = (problemIndex, testIndex) => {
    setDraftProblems((previous) => previous.map((problem, index) => (
      index === problemIndex
        ? { ...problem, tests: (problem.tests || []).filter((_, currentTestIndex) => currentTestIndex !== testIndex) }
        : problem
    )));
  };

  const saveChanges = () => {
    onUpdate(assessment._id, {
      ...settings,
      problems: draftProblems.map((problem) => ({
        ...problem,
        points: toWholeNumber(problem.points, 100),
        timeLimitMinutes: toWholeNumber(problem.timeLimitMinutes, 30),
      })),
    });
  };

  const exportPdf = () => {
    const blob = createReportPdf(report);
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${slugify(assessment.title)}-lab-report.pdf`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <main className="relative z-10 mx-auto w-full max-w-7xl min-w-0 overflow-x-hidden text-sm [&_.field-control]:min-h-10 [&_.field-control]:px-3 [&_.field-control]:py-2 [&_textarea.field-control]:min-h-20">
      <div>
        <button onClick={onBack} className="mb-6 text-sm text-ink-soft transition-colors hover:text-ink">&larr; Assessments</button>
        <div className="flex min-w-0 flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <h1 className="app-title max-w-4xl">{assessment.title}</h1>
          <div className="grid w-full grid-cols-2 gap-2 sm:flex sm:w-auto sm:flex-wrap sm:items-center sm:gap-2 lg:justify-end">
            <button
              onClick={() => setShowReport(!showReport)}
              aria-expanded={showReport}
              className="btn-quiet px-4 py-2 text-sm"
            >
              {showReport ? "Hide report" : "View report"}
            </button>
            <button onClick={exportPdf} className="btn-quiet px-4 py-2 text-sm">
              Export PDF
            </button>
            <button
              onClick={() => navigator.clipboard?.writeText(inviteLink)}
              className="px-2 text-[13px] text-ink-soft underline decoration-rule decoration-1 underline-offset-4 transition-colors hover:text-ink hover:decoration-ink"
            >
              Copy link
            </button>
            <button
              onClick={onDelete}
              className="px-2 text-[13px] text-ink-soft underline decoration-rule decoration-1 underline-offset-4 transition-colors hover:text-accent hover:decoration-accent"
            >
              Delete
            </button>
          </div>
        </div>
        {notice && (
          <div className="mt-4 border-l-2 border-emerald-700 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
            {notice}
          </div>
        )}
        <section className="mt-5 grid min-w-0 items-start gap-4 lg:mt-6 lg:grid-cols-[minmax(0,1fr)_24rem]">
          <div className="flex min-w-0 flex-col lg:h-[calc(100vh-15rem)] lg:max-h-[44rem]">
            <div className="shrink-0 flex flex-col gap-3 border-b border-rule px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6 sm:py-5">
              <div>
                <p><span className="font-semibold text-ink">Duration:</span> <span className="ml-3 text-base text-ink-soft">{draftProblems.reduce((total, problem) => total + toWholeNumber(problem.timeLimitMinutes, 0), 0)} mins</span></p>
                <p className="mt-1.5 text-xs font-semibold text-ink-soft sm:text-sm">Deadline: {formatDateTime(assessment.deadlineAt)}</p>
              </div>
              <span className="app-eyebrow inline-flex items-center gap-2"><span className="h-1.5 w-1.5 rounded-full bg-emerald-700" /> Active</span>
            </div>
            <div className="min-h-0 flex-1 overflow-auto p-3 sm:p-5">
              <h2 className="app-h2 mb-5">Sections ({draftProblems.length})</h2>
              {draftProblems.map((problem, index) => (
                <EditableSection
                  key={index}
                  problem={problem}
                  problemIndex={index}
                  onAddTest={() => addTest(index)}
                  onRemoveTest={(testIndex) => removeTest(index, testIndex)}
                  onUpdate={(patch) => updateProblem(index, patch)}
                  onUpdateTest={(testIndex, patch) => updateTest(index, testIndex, patch)}
                />
              ))}
            </div>
          </div>
          <aside className="min-w-0 overflow-auto border-t border-rule pt-6 lg:border-l lg:border-t-0 lg:pl-10 lg:pt-0 lg:sticky lg:top-28 lg:h-[calc(100vh-15rem)] lg:max-h-[44rem]">
            <h2 className="app-h3">Role</h2>
            <p className="mt-2 text-ink-soft">{assessment.title.replace(" Hiring Test", "")}</p>
            <section className="mt-8 border-t border-rule pt-6">
              <h2 className="app-h3">Assignment settings</h2>
              <label className="field-group mt-4">
                <span className="field-label">Candidate emails</span>
                <textarea
                  value={settings.candidates}
                  onChange={(event) => setSettings({ ...settings, candidates: event.target.value })}
                  className="field-surface field-control min-h-20"
                />
              </label>
              <label className="field-group mt-4">
                <span className="field-label">Deadline</span>
                <input
                  type="datetime-local"
                  value={settings.deadlineAt}
                  onChange={(event) => setSettings({ ...settings, deadlineAt: event.target.value })}
                  className="field-surface field-control"
                />
              </label>
              <label className="field-group mt-4">
                <span className="field-label">Core skills</span>
                <textarea
                  value={settings.coreSkills}
                  onChange={(event) => setSettings({ ...settings, coreSkills: event.target.value })}
                  className="field-surface field-control min-h-20"
                />
              </label>
              <button
                onClick={saveChanges}
                className="mt-4 w-full rounded-[4px] border border-accent bg-accent/10 px-4 py-2.5 font-semibold text-accent"
              >
                Save changes
              </button>
              {inviteRecipients.length > 0 && (
                <a href={`mailto:${inviteRecipients.join(",")}?subject=${encodeURIComponent(`PrepTalk Lab assessment: ${assessment.title}`)}&body=${encodeURIComponent(`Open your assigned Lab here:\n${inviteLink}`)}`} className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-[4px] bg-ink px-4 py-2.5 font-semibold text-canvas">
                  Send invite to all
                </a>
              )}
            </section>
            <h2 className="mt-5 font-semibold text-ink">Core skills</h2>
            <div className="mt-3 flex flex-wrap gap-2">
              {coreSkills.map((skill) => <span key={skill} className="chip">{skill}</span>)}
              {coreSkills.length === 0 && <span className="text-sm text-ink-soft">No core skills added.</span>}
            </div>
            <h2 className="mt-5 font-semibold text-ink">Candidates</h2>
            <div className="mt-3 border-t border-rule pt-4">
              <div className="text-3xl font-semibold text-ink">{candidates.length}</div>
              <div className="mt-1 text-sm font-semibold text-ink-soft">assigned candidate{candidates.length === 1 ? "" : "s"}</div>
            </div>
            <h2 className="mt-5 font-semibold text-ink">Submissions</h2>
            <div className="mt-3 border-t border-rule pt-4">
              <div className="text-3xl font-semibold text-ink">{submissions.length}</div>
              <div className="mt-1 text-sm font-semibold text-ink-soft">submission{submissions.length === 1 ? "" : "s"} received</div>
            </div>
          </aside>
        </section>
        {showReport && <ReportViewer report={report} />}
      </div>
    </main>
  );
}
