/** @file CSV export and payload assembly for the Lab admin dashboard. */

import { parseSkillList, toWholeNumber } from "./adminUtils";

/**
 * Downloads the currently visible assessments as a CSV.
 * Exports what's on screen, not everything — filters applied in the UI carry
 * through, which is usually what the user means by "export".
 * Every field is quoted and inner quotes doubled per RFC 4180. Note that a
 * title beginning with `=`, `+`, or `@` will still be treated as a formula by
 * Excel; prefix such values with `'` if that ever matters.
 * @param {object[]} visibleAssessments - Assessments as filtered in the UI.
 * @returns {void} Triggers a browser download; no return value.
 */
export function exportAssessmentsCsv(visibleAssessments) {
  const rows = [
    ["Title", "Candidates", "Sections", "Duration", "Submissions"],
    ...visibleAssessments.map((assessment) => [
      assessment.title,
      (assessment.candidates || []).join("; "),
      assessment.problems?.length || 0,
      assessment.durationMinutes,
      assessment.submissions?.length || 0,
    ]),
  ];
  const csv = rows.map((row) => row.map((value) => `"${String(value).replaceAll('"', '""')}"`).join(",")).join("\n");
  const url = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" }));
  const link = document.createElement("a");
  link.href = url;
  link.download = "preptalk-lab-tests.csv";
  link.click();
  URL.revokeObjectURL(url);
}

/**
 * Converts builder form state into the create-assessment API payload.
 * `durationMinutes` is recomputed from the sections rather than passed through,
 * matching what the server does — sending a stale total would just be ignored.
 * Pure: spreads into new objects, leaving `form` untouched.
 * @param {object} form - Builder form state; `candidates` and `coreSkills` are comma-separated strings.
 * @returns {object} Request body for `POST /api/lab/assessments`.
 */
export function buildAssessmentPayload(form) {
  const totalProblemMinutes = form.problems.reduce((total, problem) => total + toWholeNumber(problem.timeLimitMinutes, 30), 0);
  return {
    ...form,
    candidates: form.candidates.split(",").map((email) => email.trim()).filter(Boolean),
    coreSkills: parseSkillList(form.coreSkills),
    deadlineAt: form.deadlineAt,
    durationMinutes: totalProblemMinutes,
    problems: form.problems.map((problem) => ({
      ...problem,
      points: toWholeNumber(problem.points, 100),
      timeLimitMinutes: toWholeNumber(problem.timeLimitMinutes, 30),
    })),
  };
}
