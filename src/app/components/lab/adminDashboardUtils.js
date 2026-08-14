import { parseSkillList, toWholeNumber } from "./adminUtils";

/**
 * Downloads the visible assessments as a CSV file.
 * @param {object[]} visibleAssessments
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
 * Converts builder form state into the create-assessment API payload,
 * normalizing candidates, skills, and per-problem numbers.
 * @param {object} form
 * @returns {object}
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
