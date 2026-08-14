/** @file Form helpers for the Lab test builder: template expansion, input coercion, and validation. */

/**
 * Expands a role template into editable builder form state.
 * Problems are cloned so editing the form never mutates the shared template.
 * The title gets a " Hiring Test" suffix and the description is a placeholder —
 * both are meant to be overwritten by the interviewer.
 * @param {object} template - Entry from `roleTemplates` or `customTemplate`.
 * @returns {object} Builder form state, with a deadline defaulted to 24h out.
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
 * Clones a problem two levels deep — the problem and each of its tests.
 * That depth is exactly enough for the builder, since tests hold only
 * primitives. Anything nested deeper would still be shared.
 * @param {object} problem - Problem to copy.
 * @returns {object} Independent copy safe to edit in form state.
 */
export function cloneProblem(problem) {
  return { ...problem, tests: problem.tests.map((test) => ({ ...test })) };
}

/**
 * Strips everything but digits from a numeric text input.
 * Runs on each keystroke so the field can never hold `-`, `.`, or `e` — the
 * characters a bare `type="number"` still admits.
 * @param {string} value - Raw input value.
 * @returns {string} Digits only; may be empty while the user is mid-edit.
 */
export function sanitizeWholeNumberInput(value) {
  return String(value).replace(/[^\d]/g, "");
}

/**
 * Parses an integer, falling back when the field is empty or unparseable.
 * The empty case is normal here, not an error — `sanitizeWholeNumberInput`
 * leaves the field blank while the user clears it.
 * @param {unknown} value - Raw field value.
 * @param {number} fallback - Used when parsing fails.
 * @returns {number} Parsed integer, or `fallback`.
 */
export function toWholeNumber(value, fallback) {
  const parsed = Number.parseInt(value, 10);
  return Number.isFinite(parsed) ? parsed : fallback;
}

/**
 * Display name for a section, falling back to its position.
 * Keeps the section rail readable while a title is still being typed.
 * @param {object} problem - Problem from builder state.
 * @param {number} index - Zero-based position; shown one-based.
 * @returns {string} Trimmed title, or `Section N`.
 */
export function sectionName(problem, index) {
  return problem.title?.trim() || `Section ${index + 1}`;
}

/**
 * Splits comma-separated skills into a deduplicated, bounded list.
 * Mirrors the server's cap of 12 so the UI can't submit entries that would be
 * silently dropped.
 * @param {string} value - Comma-separated skills from the form.
 * @returns {string[]} Unique, non-empty skills, capped at 12.
 */
export function parseSkillList(value) {
  return [...new Set(String(value || "").split(",").map((skill) => skill.trim()).filter(Boolean))].slice(0, 12);
}

/**
 * Formats a date for display, or `"Today"` when absent or unparseable.
 * The fallback is a display convenience, not an assertion about the value —
 * don't read a `"Today"` result as meaning the date actually is today.
 * @param {unknown} value - Date, ISO string, or nullish.
 * @returns {string} Locale date string, or `"Today"`.
 */
export function formatDate(value) {
  if (!value) return "Today";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Today";
  return date.toLocaleDateString(undefined, { year: "numeric", month: "2-digit", day: "2-digit" });
}

/**
 * Formats a date and time, or `"No deadline"` when absent or unparseable.
 * @param {unknown} value - Date, ISO string, or nullish.
 * @returns {string} Locale date-time string, or `"No deadline"`.
 */
export function formatDateTime(value) {
  if (!value) return "No deadline";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "No deadline";
  return date.toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" });
}

/**
 * Validates the builder form, returning the first problem as a message.
 * Fail-fast rather than collecting every error: the builder shows one banner,
 * and pointing at the first thing to fix beats a wall of text.
 * Mirrors the server's rules so a valid form isn't rejected after submit — if
 * the API's limits change, this must change with them.
 * @param {object} form - Builder form state.
 * @returns {string} User-facing error message, or `""` when the form is valid.
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

/**
 * Default deadline for a new test: 24 hours out, as `datetime-local` expects.
 * The timezone offset is subtracted before slicing because `toISOString` emits
 * UTC while the input renders local time — without it the field would show a
 * time shifted by the user's offset.
 * @returns {string} `YYYY-MM-DDTHH:mm` in local time.
 */
function defaultDeadlineInputValue() {
  const date = new Date(Date.now() + 24 * 60 * 60 * 1000);
  date.setSeconds(0, 0);
  const offsetMs = date.getTimezoneOffset() * 60 * 1000;
  return new Date(date.getTime() - offsetMs).toISOString().slice(0, 16);
}

/**
 * True when a string parses as JSON.
 * @param {string} value - Test-case JSON from the builder form.
 * @returns {boolean} `true` when `JSON.parse` succeeds.
 */
function isJson(value) {
  try {
    JSON.parse(value);
    return true;
  } catch {
    // Parse failure is the answer here, not an error to propagate.
    return false;
  }
}
