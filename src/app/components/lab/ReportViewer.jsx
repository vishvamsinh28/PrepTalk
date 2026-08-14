"use client";

import { useState, useEffect } from "react";
import { submissionKey, statusTone } from "./assessmentReport";
import { formatDateTime } from "./adminUtils";

/**
 * Read-only submissions report with candidate search.
 * @param {{ report: object }} props
 */
export default function ReportViewer({ report }) {
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
    <section className="mt-6 flex min-w-0 flex-col rounded-[4px] border border-rule bg-white p-3 shadow-xl sm:p-6 lg:h-[46rem]">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h2 className="app-h2">Submission report</h2>
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
        <div className="min-h-0 min-w-0 rounded-[4px] border border-rule bg-black/5">
          <div className="border-b border-rule px-4 py-3 app-eyebrow">
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
                  className={`mb-2 w-full rounded-[3px] border px-4 py-3 text-left transition ${active ? "border-accent bg-accent/10 text-accent" : "border-rule bg-white text-ink-soft hover:border-rule"}`}
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
              <div className="rounded-[3px] border border-rule bg-white p-4 text-sm text-ink-soft">
                No reports match your search.
              </div>
            )}
          </div>
        </div>

        {selectedSubmission ? (
          <article className="min-h-0 min-w-0 overflow-auto rounded-[4px] border border-rule bg-black/5 p-3 sm:p-5">
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
                <section key={`${selectedSubmission.candidateEmail}-${section.problemIndex}`} className="min-w-0 rounded-[4px] border border-rule bg-white p-3 sm:p-4">
                  <div className="flex flex-wrap justify-between gap-3">
                    <h4 className="min-w-0 break-words font-semibold text-ink">Q{section.problemIndex + 1}: {section.title}</h4>
                    <span className="text-sm font-bold text-ink-soft">{section.score}/{section.maxScore}</span>
                  </div>
                  <pre className="mt-3 max-h-56 min-w-0 max-w-full overflow-auto whitespace-pre-wrap break-words rounded-[3px] border border-rule bg-black/5 p-3 text-xs leading-5 text-accent sm:whitespace-pre">{section.code || "No code submitted."}</pre>
                  <div className="mt-3 grid gap-2">
                    {section.tests.map((test) => (
                      <div key={test.name} className={`min-w-0 break-words rounded-[3px] border px-3 py-2 text-sm ${test.passed ? "border-emerald-600/40 bg-emerald-50 text-emerald-700" : "border-rose-600/40 bg-rose-50 text-rose-700"}`}>
                        <b>{test.name}</b> · {test.passed ? "Passed" : "Failed"}{test.error ? ` · ${test.error}` : ""}
                      </div>
                    ))}
                  </div>
                </section>
              ))}
            </div>
          </article>
        ) : (
          <div className="rounded-[4px] border border-rule bg-black/5 p-5 text-ink-soft">No submissions yet.</div>
        )}
      </div>
    </section>
  );
}
