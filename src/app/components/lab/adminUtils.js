/**
 * Expands a role template into builder form state.
 * @param {object} template
 * @returns {object}
 */
export function templateToForm(template) {
  return {
    title: `${template.title} Hiring Test`,
    description: "Software Engineer, 0-2 years",
    candidates: "",
    coreSkills: (template.coreSkills || []).join(", "),
    deadlineAt: defaultDeadlineInputValue(),
    durationMinutes: template.durationMinutes,
    problems: template.problems.map(cloneProblem),
  };
}

/**
 * Deep-ish clone of a problem for safe editing.
 * @param {object} problem
 * @returns {object}
 */
export function cloneProblem(problem) {
  return { ...problem, tests: problem.tests.map((test) => ({ ...test })) };
}

/**
 * Keeps only digits from a numeric text input.
 * @param {string} value
 * @returns {string}
 */
export function sanitizeWholeNumberInput(value) {
  return String(value).replace(/[^\d]/g, "");
}

/**
 * Parses a positive integer with fallback.
 * @param {unknown} value
 * @param {number} fallback
 * @returns {number}
 */
export function toWholeNumber(value, fallback) {
  const parsed = Number.parseInt(value, 10);
  return Number.isFinite(parsed) ? parsed : fallback;
}

/**
 * Display name for a section, falling back to its index.
 * @param {object} problem
 * @param {number} index
 * @returns {string}
 */
export function sectionName(problem, index) {
  return problem.title?.trim() || `Section ${index + 1}`;
}

/**
 * Splits comma-separated skills into a bounded list.
 * @param {string} value
 * @returns {string[]}
 */
export function parseSkillList(value) {
  return [...new Set(String(value || "").split(",").map((skill) => skill.trim()).filter(Boolean))].slice(0, 12);
}

/**
 * Locale date string for a date-ish value.
 * @param {unknown} value
 * @returns {string}
 */
export function formatDate(value) {
  if (!value) return "Today";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Today";
  return date.toLocaleDateString(undefined, { year: "numeric", month: "2-digit", day: "2-digit" });
}

/**
 * Locale date+time string for a date-ish value.
 * @param {unknown} value
 * @returns {string}
 */
export function formatDateTime(value) {
  if (!value) return "No deadline";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "No deadline";
  return date.toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" });
}

/**
 * Returns a user-facing error for an invalid builder form, or "".
 * @param {object} form
 * @returns {string}
 */
export function validateAssessmentForm(form) {
  if (!form.title.trim()) return "Test title is required.";
  if (!form.candidates.split(",").map((email) => email.trim()).filter(Boolean).length) {
    return "Assign at least one candidate email.";
  }
  const deadline = new Date(form.deadlineAt);
  if (!form.deadlineAt || Number.isNaN(deadline.getTime())) return "Deadline is required.";
  if (deadline.getTime() <= Date.now()) return "Deadline must be in the future.";

  const totalProblemMinutes = form.problems.reduce((total, problem) => total + toWholeNumber(problem.timeLimitMinutes, 0), 0);
  if (totalProblemMinutes < 1 || totalProblemMinutes > 120) return "Total section duration must be between 1 and 120 minutes.";

  for (const [problemIndex, problem] of form.problems.entries()) {
    if (!problem.title.trim()) return `Section ${problemIndex + 1} needs a title.`;
    if (!problem.prompt.trim()) return `Section ${problemIndex + 1} needs a problem statement.`;
    if (toWholeNumber(problem.timeLimitMinutes, 0) < 1) return `Section ${problemIndex + 1} needs at least 1 minute.`;

    for (const [testIndex, test] of problem.tests.entries()) {
      if (!test.name.trim()) return `Section ${problemIndex + 1}, test case ${testIndex + 1} needs a name.`;
      if (!isJson(test.inputJson)) return `Section ${problemIndex + 1}, test case ${testIndex + 1} input must be valid JSON.`;
      if (!isJson(test.expectedJson)) return `Section ${problemIndex + 1}, test case ${testIndex + 1} expected output must be valid JSON.`;
    }
  }

  return "";
}

function defaultDeadlineInputValue() {
  const date = new Date(Date.now() + 24 * 60 * 60 * 1000);
  date.setSeconds(0, 0);
  const offsetMs = date.getTimezoneOffset() * 60 * 1000;
  return new Date(date.getTime() - offsetMs).toISOString().slice(0, 16);
}

function isJson(value) {
  try {
    JSON.parse(value);
    return true;
  } catch {
    return false;
  }
}
