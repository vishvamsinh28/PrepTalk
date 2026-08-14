"use client";

/** @file The candidate's assigned-assessments list, shown before an attempt starts. */

/**
 * Lists assigned assessments with a start action for each.
 * Takes both `assessments` and `sortedAssessments`: the sorted list is what
 * renders, while the raw list backs the deep-link check — a `?assessment=` id
 * that isn't in it means the candidate followed an invite meant for a different
 * account, which is worth saying explicitly rather than showing an empty list.
 * Stateless; `LabCandidateDashboard` owns the data and the start handler.
 * @param {object} props - Component props.
 * @param {object[]} props.assessments - Unsorted assessments, used for the deep-link check.
 * @param {object[]} props.sortedAssessments - Display order.
 * @param {string} props.initialAssessmentId - Deep-linked id from the URL, or `""`.
 * @param {string} props.submitMessage - Confirmation from a just-completed submission.
 * @param {string} [props.loadError] - Message when the assessment list failed to load;
 *   distinguishes a real failure from genuinely having none assigned.
 * @param {Function} props.onStart - Called with an assessment to begin it.
 * @returns {JSX.Element} The picker.
 */
export default function AssessmentPicker({
  assessments,
  sortedAssessments,
  initialAssessmentId,
  submitMessage,
  loadError = "",
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
        {loadError && (
          <p
            role="status"
            className="mt-6 border-l-2 border-accent bg-accent/5 px-4 py-3 text-sm text-accent"
          >
            {loadError}
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
