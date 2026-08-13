"use client";

import { useEffect, useState } from "react";
import { FaChevronRight, FaClock, FaDownload, FaEnvelope, FaPlus, FaShareAlt, FaTrash } from "react-icons/fa";
import { SkillIcon } from "./AdminShared";
import { formatDateTime, sanitizeWholeNumberInput, sectionName, toWholeNumber } from "./adminUtils";

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
        <button onClick={onBack} className="mb-4 text-sm text-accent">Assessments <FaChevronRight className="mx-2 inline text-xs text-ink-soft" /> {assessment.title}</button>
        <div className="flex min-w-0 flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <h1 className="max-w-4xl text-2xl font-semibold leading-tight text-ink sm:text-3xl lg:text-4xl">{assessment.title}</h1>
          <div className="grid w-full grid-cols-2 gap-2 sm:flex sm:w-auto sm:flex-wrap sm:items-center sm:gap-2 lg:justify-end">
            <button onClick={() => navigator.clipboard?.writeText(inviteLink)} className="inline-flex items-center justify-center gap-2 rounded-lg border border-rule bg-black/5 px-3 py-2 text-sm font-semibold text-ink"><FaShareAlt /> Copy link</button>
            <button
              onClick={() => setShowReport(!showReport)}
              aria-expanded={showReport}
              className={`inline-flex items-center justify-center gap-2 rounded-lg border px-3 py-2 text-sm font-semibold transition ${showReport ? "border-accent bg-accent/10 text-accent" : "border-rule bg-black/5 text-ink hover:border-rule"}`}
            >
              <span className={`h-2.5 w-2.5 rounded-full ${showReport ? "bg-cyan-200" : "bg-slate-500"}`} />
              {showReport ? "Hide report" : "View report"}
            </button>
            <button onClick={exportPdf} className="inline-flex items-center justify-center gap-2 rounded-lg border border-accent bg-accent/10 px-3 py-2 text-sm font-semibold text-accent"><FaDownload /> Export PDF</button>
            <button onClick={onDelete} className="grid place-items-center rounded-lg border border-rose-600/40 bg-rose-50 px-3 py-2 text-rose-700"><FaTrash /></button>
          </div>
        </div>
        {notice && (
          <div className="mt-4 rounded-lg border border-emerald-600/40 bg-emerald-50 px-4 py-3 font-bold text-emerald-700">
            {notice}
          </div>
        )}
        <section className="mt-5 grid min-w-0 items-start gap-4 lg:mt-6 lg:grid-cols-[minmax(0,1fr)_24rem]">
          <div className="flex min-w-0 flex-col rounded-xl border border-rule bg-white shadow-xl lg:h-[calc(100vh-15rem)] lg:max-h-[44rem]">
            <div className="shrink-0 flex flex-col gap-3 border-b border-rule px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6 sm:py-5">
              <div>
                <p><span className="font-semibold text-ink">Duration:</span> <span className="ml-3 text-base text-ink-soft">{draftProblems.reduce((total, problem) => total + toWholeNumber(problem.timeLimitMinutes, 0), 0)} mins</span></p>
                <p className="mt-1.5 text-xs font-semibold text-ink-soft sm:text-sm">Deadline: {formatDateTime(assessment.deadlineAt)}</p>
              </div>
              <span className="inline-flex items-center gap-2 text-emerald-700"><span className="h-3 w-3 rounded-full bg-emerald-300" /> Active</span>
            </div>
            <div className="min-h-0 flex-1 overflow-auto p-3 sm:p-5">
              <h2 className="mb-4 text-xl font-semibold text-ink sm:text-2xl">Sections ({draftProblems.length})</h2>
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
          <aside className="glass-panel min-w-0 overflow-auto rounded-xl p-4 sm:p-5 lg:sticky lg:top-28 lg:h-[calc(100vh-15rem)] lg:max-h-[44rem]">
            <h2 className="font-semibold text-ink">Role</h2>
            <p className="mt-2 text-ink-soft">{assessment.title.replace(" Hiring Test", "")}</p>
            <section className="mt-5 rounded-lg border border-rule bg-black/5 p-3 sm:p-4">
              <h2 className="font-semibold text-ink">Assignment settings</h2>
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
                className="mt-4 w-full rounded-lg border border-accent bg-accent/10 px-4 py-2.5 font-semibold text-accent"
              >
                Save changes
              </button>
              {inviteRecipients.length > 0 && (
                <a href={`mailto:${inviteRecipients.join(",")}?subject=${encodeURIComponent(`PrepTalk Lab assessment: ${assessment.title}`)}&body=${encodeURIComponent(`Open your assigned Lab here:\n${inviteLink}`)}`} className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-lg bg-ink px-4 py-2.5 font-semibold text-canvas">
                  <FaEnvelope /> Send invite to all
                </a>
              )}
            </section>
            <h2 className="mt-5 font-semibold text-ink">Core skills</h2>
            <div className="mt-3 flex flex-wrap gap-2">
              {coreSkills.map((skill) => <span key={skill} className="rounded-full border border-rule bg-black/5 px-2.5 py-1 text-xs font-semibold text-ink">{skill}</span>)}
              {coreSkills.length === 0 && <span className="text-sm text-ink-soft">No core skills added.</span>}
            </div>
            <h2 className="mt-5 font-semibold text-ink">Candidates</h2>
            <div className="mt-3 rounded-lg border border-rule bg-black/5 px-4 py-4">
              <div className="text-3xl font-semibold text-ink">{candidates.length}</div>
              <div className="mt-1 text-sm font-semibold text-ink-soft">assigned candidate{candidates.length === 1 ? "" : "s"}</div>
            </div>
            <h2 className="mt-5 font-semibold text-ink">Submissions</h2>
            <div className="mt-3 rounded-lg border border-rule bg-black/5 px-4 py-4">
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

function EditableSection({ problem, problemIndex, onAddTest, onRemoveTest, onUpdate, onUpdateTest }) {
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
        <span className="hidden shrink-0 text-ink-soft sm:inline"><FaClock className="mr-2 inline" />{problem.timeLimitMinutes} mins</span>
      </button>
      {open && (
        <div className="mt-4 grid min-w-0 gap-3 overflow-x-hidden rounded-lg border border-rule bg-white p-3 sm:p-4">
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
            <button onClick={onAddTest} className="inline-flex items-center gap-2 rounded-md border border-accent bg-accent/10 px-3 py-2 text-sm font-bold text-accent"><FaPlus /> Add case</button>
          </div>
          <div className="max-h-[24rem] overflow-auto pr-1">
            <div className="grid min-w-0 gap-2">
              {tests.map((test, testIndex) => (
                <div key={testIndex} className="grid min-w-0 gap-2 rounded-lg border border-rule bg-black/5 p-3 xl:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)_minmax(0,1.1fr)_auto_auto]">
                  <label className="field-group min-w-0">
                    <span className="field-label">Case name</span>
                    <input value={test.name || ""} onChange={(event) => onUpdateTest(testIndex, { name: event.target.value })} className="field-surface field-control" />
                  </label>
                  <label className="field-group min-w-0">
                    <span className="field-label">Input JSON</span>
                    <textarea value={test.inputJson || ""} onChange={(event) => onUpdateTest(testIndex, { inputJson: event.target.value })} className="field-surface field-control min-h-14 font-mono text-sm" />
                  </label>
                  <label className="field-group min-w-0">
                    <span className="field-label">Expected JSON</span>
                    <textarea value={test.expectedJson || ""} onChange={(event) => onUpdateTest(testIndex, { expectedJson: event.target.value })} className="field-surface field-control min-h-14 font-mono text-sm" />
                  </label>
                  <label className="flex items-center gap-3 rounded-md border border-rule bg-white px-3 py-2 text-xs font-bold text-ink xl:mt-6">
                    <input type="checkbox" checked={Boolean(test.visible)} onChange={(event) => onUpdateTest(testIndex, { visible: event.target.checked })} className="field-toggle" />
                    Visible
                  </label>
                  {tests.length > 1 && (
                    <button onClick={() => onRemoveTest(testIndex)} className="grid h-10 w-10 place-items-center rounded-md border border-rose-600/40 bg-rose-50 text-rose-700 xl:mt-6" title="Delete test case">
                      <FaTrash />
                    </button>
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

function ReportViewer({ report }) {
  const [query, setQuery] = useState("");
  const [selectedKey, setSelectedKey] = useState("");
  const submissions = [...report.submissions].sort((left, right) => new Date(right.submittedAt) - new Date(left.submittedAt));
  const filteredSubmissions = submissions.filter((submission) => {
    const searchText = `${submission.candidateEmail} ${submission.resultStatus} submitted ${submission.score}/${submission.maxScore}`.toLowerCase();
    return searchText.includes(query.trim().toLowerCase());
  });
  const selectedSubmission = filteredSubmissions.find((submission) => submissionKey(submission) === selectedKey) || filteredSubmissions[0] || null;

  useEffect(() => {
    if (!selectedSubmission) {
      if (selectedKey) setSelectedKey("");
      return;
    }

    const nextKey = submissionKey(selectedSubmission);
    if (selectedKey !== nextKey) setSelectedKey(nextKey);
  }, [selectedKey, selectedSubmission]);

  return (
    <section className="mt-6 flex min-w-0 flex-col rounded-xl border border-rule bg-white p-3 shadow-xl sm:p-6 lg:h-[46rem]">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h2 className="text-2xl font-semibold text-ink">Submission report</h2>
          <p className="mt-2 text-ink-soft">{report.submissions.length} submission{report.submissions.length === 1 ? "" : "s"} captured. Select one report to inspect.</p>
        </div>
        <label className="w-full sm:min-w-72 sm:w-auto">
          <span className="sr-only">Search reports</span>
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search candidate or score"
            className="field-surface field-control"
          />
        </label>
      </div>
      <div className="mt-5 grid min-h-0 min-w-0 flex-1 gap-5 xl:grid-cols-[22rem_minmax(0,1fr)]">
        <div className="min-h-0 min-w-0 rounded-lg border border-rule bg-black/5">
          <div className="border-b border-rule px-4 py-3 text-xs font-semibold uppercase tracking-[0.2em] text-ink-soft">
            Reports
          </div>
          <div className="h-[calc(100%-2.75rem)] overflow-auto p-2">
            {filteredSubmissions.map((submission) => {
              const key = submissionKey(submission);
              const active = selectedSubmission && submissionKey(selectedSubmission) === key;

              return (
                <button
                  key={key}
                  onClick={() => setSelectedKey(key)}
                  className={`mb-2 w-full rounded-md border px-4 py-3 text-left transition ${active ? "border-accent bg-accent/10 text-accent" : "border-rule bg-white text-ink-soft hover:border-rule"}`}
                >
                  <div className="flex items-center justify-between gap-3">
                    <span className="truncate font-semibold">{submission.candidateEmail}</span>
                    <span className={`shrink-0 rounded-full border px-2 py-0.5 text-xs font-bold ${statusTone(submission.resultStatus)}`}>{submission.resultStatus}</span>
                  </div>
                  <div className="mt-1 text-xs font-semibold text-ink-soft">
                    Attempt {submission.attempts} · {submission.passedTests}/{submission.totalTests} tests · {formatDateTime(submission.submittedAt)}
                  </div>
                </button>
              );
            })}
            {filteredSubmissions.length === 0 && (
              <div className="rounded-md border border-rule bg-white p-4 text-sm text-ink-soft">
                No reports match your search.
              </div>
            )}
          </div>
        </div>

        {selectedSubmission ? (
          <article className="min-h-0 min-w-0 overflow-auto rounded-lg border border-rule bg-black/5 p-3 sm:p-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="min-w-0">
                <h3 className="break-all font-semibold text-ink">{selectedSubmission.candidateEmail}</h3>
                <p className="mt-1 text-sm text-ink-soft">Attempt {selectedSubmission.attempts} · Submitted · {selectedSubmission.score}/{selectedSubmission.maxScore} · {selectedSubmission.passedTests}/{selectedSubmission.totalTests} tests passed</p>
              </div>
              <div className="flex min-w-0 flex-wrap items-center gap-2">
                <span className={`rounded-full border px-3 py-1 text-sm font-bold ${statusTone(selectedSubmission.resultStatus)}`}>{selectedSubmission.resultStatus}</span>
                <span className="max-w-full rounded-full border border-accent bg-accent/10 px-3 py-1 text-sm font-bold text-accent">{formatDateTime(selectedSubmission.submittedAt)}</span>
              </div>
            </div>
            <div className="mt-5 grid min-w-0 gap-4">
              {selectedSubmission.sections.map((section) => (
                <section key={`${selectedSubmission.candidateEmail}-${section.problemIndex}`} className="min-w-0 rounded-lg border border-rule bg-white p-3 sm:p-4">
                  <div className="flex flex-wrap justify-between gap-3">
                    <h4 className="min-w-0 break-words font-semibold text-ink">Q{section.problemIndex + 1}: {section.title}</h4>
                    <span className="text-sm font-bold text-ink-soft">{section.score}/{section.maxScore}</span>
                  </div>
                  <pre className="mt-3 max-h-56 min-w-0 max-w-full overflow-auto whitespace-pre-wrap break-words rounded-md border border-rule bg-black/5 p-3 text-xs leading-5 text-accent sm:whitespace-pre">{section.code || "No code submitted."}</pre>
                  <div className="mt-3 grid gap-2">
                    {section.tests.map((test) => (
                      <div key={test.name} className={`min-w-0 break-words rounded-md border px-3 py-2 text-sm ${test.passed ? "border-emerald-600/40 bg-emerald-50 text-emerald-700" : "border-rose-600/40 bg-rose-50 text-rose-700"}`}>
                        <b>{test.name}</b> · {test.passed ? "Passed" : "Failed"}{test.error ? ` · ${test.error}` : ""}
                      </div>
                    ))}
                  </div>
                </section>
              ))}
            </div>
          </article>
        ) : (
          <div className="rounded-lg border border-rule bg-black/5 p-5 text-ink-soft">No submissions yet.</div>
        )}
      </div>
    </section>
  );
}

function submissionKey(submission) {
  return `${submission.candidateEmail}-${submission.attempts}-${submission.submittedAt}`;
}

function submissionResultStatus(submission) {
  if (!submission) return "Pending";
  if (Number(submission.totalTests) > 0 && Number(submission.passedTests) === Number(submission.totalTests)) return "Passed";
  return "Failed";
}

function statusTone(status) {
  if (status === "Passed") return "border-emerald-600/40 bg-emerald-50 text-emerald-700";
  if (status === "Failed") return "border-rose-600/40 bg-rose-50 text-rose-700";
  return "border-amber-600/40 bg-amber-50 text-amber-700";
}

function buildAssessmentReport(assessment) {
  return {
    assessmentId: assessment._id,
    title: assessment.title,
    durationMinutes: assessment.durationMinutes,
    candidates: assessment.candidates || [],
    generatedAt: new Date().toISOString(),
    submissions: (assessment.submissions || []).map((submission) => ({
      candidateEmail: submission.candidateEmail,
      attempts: submission.attempts,
      resultStatus: submissionResultStatus(submission),
      submittedAt: submission.submittedAt,
      score: submission.score,
      maxScore: submission.maxScore,
      passedTests: submission.passedTests,
      totalTests: submission.totalTests,
      runtimeMs: submission.runtimeMs,
      sections: (submission.problemResults || []).map((problem) => ({
        problemIndex: problem.problemIndex,
        title: problem.title,
        score: problem.score,
        maxScore: problem.maxScore,
        code: problem.code || findSubmittedCode(submission.solutions, problem),
        tests: (problem.tests || []).map((test, testIndex) => {
          const sourceTest = assessment.problems?.[problem.problemIndex]?.tests?.[testIndex] || {};
          return {
            name: test.name,
            visible: Boolean(test.visible),
            passed: Boolean(test.passed),
            duration: test.duration,
            error: test.error || "",
            inputJson: sourceTest.inputJson || "",
            expectedJson: sourceTest.expectedJson || "",
            output: test.output ?? null,
          };
        }),
      })),
    })),
  };
}

function createReportPdf(report) {
  const lines = reportLines(report).flatMap((line) => wrapLine(line, 92));
  const pages = [];
  for (let index = 0; index < lines.length; index += 45) {
    pages.push(lines.slice(index, index + 45));
  }
  if (pages.length === 0) pages.push(["No submissions yet."]);

  const objects = ["<< /Type /Catalog /Pages 2 0 R >>"];
  const pageRefs = pages.map((_, index) => `${3 + index * 2} 0 R`).join(" ");
  objects.push(`<< /Type /Pages /Kids [${pageRefs}] /Count ${pages.length} >>`);

  pages.forEach((pageLines, pageIndex) => {
    const pageObjectId = 3 + pageIndex * 2;
    const contentObjectId = pageObjectId + 1;
    objects.push(`<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Resources << /Font << /F1 << /Type /Font /Subtype /Type1 /BaseFont /Courier >> >> >> /Contents ${contentObjectId} 0 R >>`);
    const content = `BT /F1 10 Tf 50 750 Td 14 TL ${pageLines.map((line) => `(${escapePdf(line)}) Tj T*`).join(" ")} ET`;
    objects.push(`<< /Length ${content.length} >>\nstream\n${content}\nendstream`);
  });

  let pdf = "%PDF-1.4\n";
  const offsets = [0];
  objects.forEach((object, index) => {
    offsets.push(pdf.length);
    pdf += `${index + 1} 0 obj\n${object}\nendobj\n`;
  });
  const xrefOffset = pdf.length;
  pdf += `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n`;
  offsets.slice(1).forEach((offset) => {
    pdf += `${String(offset).padStart(10, "0")} 00000 n \n`;
  });
  pdf += `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xrefOffset}\n%%EOF`;
  return new Blob([pdf], { type: "application/pdf" });
}

function reportLines(report) {
  const lines = [
    `PrepTalk Lab Report`,
    `Assessment: ${report.title}`,
    `Assessment ID: ${report.assessmentId}`,
    `Duration: ${report.durationMinutes} mins`,
    `Generated: ${formatDateTime(report.generatedAt)}`,
    "",
  ];

  for (const submission of report.submissions) {
    lines.push(`Candidate: ${submission.candidateEmail}`);
    lines.push(`Status: Submitted / ${submission.resultStatus}`);
    lines.push(`Attempt: ${submission.attempts} | Score: ${submission.score}/${submission.maxScore} | Tests: ${submission.passedTests}/${submission.totalTests}`);
    lines.push(`Submitted: ${formatDateTime(submission.submittedAt)}`);
    for (const section of submission.sections) {
      lines.push(`  Q${section.problemIndex + 1}: ${section.title} (${section.score}/${section.maxScore})`);
      lines.push(`  Code:`);
      String(section.code || "No code submitted.").split("\n").forEach((line) => lines.push(`    ${line}`));
      section.tests.forEach((test) => {
        lines.push(`  Test: ${test.name} | ${test.passed ? "Passed" : "Failed"} | visible=${test.visible}`);
        if (test.error) lines.push(`    Error: ${test.error}`);
      });
    }
    lines.push("");
  }

  return lines;
}

function wrapLine(line, maxLength) {
  const text = String(line);
  if (text.length <= maxLength) return [text];
  const chunks = [];
  for (let index = 0; index < text.length; index += maxLength) {
    chunks.push(text.slice(index, index + maxLength));
  }
  return chunks;
}

function escapePdf(value) {
  return String(value).replace(/[^\x20-\x7E]/g, "?").replace(/\\/g, "\\\\").replace(/\(/g, "\\(").replace(/\)/g, "\\)");
}

function findSubmittedCode(solutions, problem) {
  const match = (solutions || []).find((solution) => solution.problemIndex === problem.problemIndex || solution.title === problem.title);
  return match?.code || "";
}

function slugify(value) {
  return String(value || "assessment").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "") || "assessment";
}

function toDateTimeLocalValue(value) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  date.setSeconds(0, 0);
  const offsetMs = date.getTimezoneOffset() * 60 * 1000;
  return new Date(date.getTime() - offsetMs).toISOString().slice(0, 16);
}

function parseRecipientList(value) {
  return [...new Set(String(value || "").split(",").map((email) => email.trim()).filter(Boolean))];
}

function cloneAssessmentProblems(problems) {
  return (problems || []).map((problem) => ({
    ...problem,
    tests: (problem.tests || []).map((test) => ({ ...test })),
  }));
}
