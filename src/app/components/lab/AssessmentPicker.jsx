"use client";

/* The assigned-assessments list view — extracted verbatim from LabCandidateDashboard. */
export default function AssessmentPicker({
  assessments,
  sortedAssessments,
  initialAssessmentId,
  submitMessage,
  onStart,
}) {
  return (
    <div className="app-shell relative min-h-screen overflow-hidden px-5 pb-16 pt-24 text-ink">
      <div className="soft-grid absolute inset-0 opacity-60" />
      <main className="relative z-10 mx-auto max-w-6xl">
        <header className="border-b border-rule pb-8">
          <p className="app-eyebrow">PrepTalk Lab</p>
          <h1 className="app-title mt-4">Assigned assessments</h1>
          <p className="mt-4 max-w-[58ch] text-[15px] leading-[1.7] text-ink-soft">
            Start an assigned coding assessment when you are ready.
          </p>
        </header>
        {submitMessage && (
          <p className="mt-6 border-l-2 border-emerald-700 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
            {submitMessage}
          </p>
        )}
        <div className="max-h-[calc(100vh-22rem)] min-h-[18rem] overflow-auto pr-2">
          {initialAssessmentId && !assessments.some((assessment) => assessment._id === initialAssessmentId) && (
            <p className="mt-6 border-l-2 border-accent bg-accent/5 px-4 py-3 text-sm text-accent">
              The invited assessment was not found for this account. Make sure you are
              logged in with the assigned candidate email.
            </p>
          )}
          <ul>
            {sortedAssessments.map((assessment) => (
              <li
                key={assessment._id}
                className="row-hair flex flex-wrap items-center justify-between gap-x-10 gap-y-4 px-1 py-7 first:border-t-0"
              >
                <div className="min-w-0">
                  <h2 className="app-h3">{assessment.title}</h2>
                  <p className="app-eyebrow mt-2">
                    {assessment.durationMinutes} min · {assessment.problems?.length || 0}{" "}
                    sections · Due {formatCandidateDeadline(assessment.deadlineAt)}
                  </p>
                  <CandidateStatus assessment={assessment} />
                </div>
                <button onClick={() => onStart(assessment)} className="btn-ink shrink-0">
                  {(assessment.submissions?.length || 0) > 0 ? "Retry assessment" : "Start assessment"}
                </button>
              </li>
            ))}
          </ul>
          {assessments.length === 0 && (
            <p className="border-b border-rule py-14 text-center text-sm text-ink-soft">
              No assigned assessments yet. Your interviewer will send one through.
            </p>
          )}
        </div>
      </main>
    </div>
  );
}

function CandidateStatus({ assessment }) {
  const latest = [...(assessment.submissions || [])].sort((left, right) => new Date(right.submittedAt) - new Date(left.submittedAt))[0];

  if (!latest) {
    return <span className="chip mt-3">Pending</span>;
  }

  const passed = Number(latest.passedTests) || 0;
  const total = Number(latest.totalTests) || 0;
  const allPassed = total > 0 && passed === total;

  return (
    <span className={`chip mt-3 ${allPassed ? "border-emerald-700/40 text-emerald-700" : "chip-accent"}`}>
      Submitted · {passed}/{total} tests passed
    </span>
  );
}

function formatCandidateDeadline(value) {
  if (!value) return "no deadline";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "no deadline";
  return date.toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" });
}
