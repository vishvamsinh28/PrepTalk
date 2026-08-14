/**
 * @file Access checks and payload normalization for lab assessments.
 * Two jobs: decide who may see an assessment (and how much of it), and coerce
 * an untrusted create/update body into a bounded, DB-safe shape.
 */

import { normalizeEmailList, normalizeText } from "@/lib/validation";

/**
 * Interviewers may access assessments they created; interviewees only those
 * they're assigned to. Anyone else, and any unknown role, is denied.
 *
 * @param {object|null} assessment - Assessment document, or null when not found.
 * @param {{ email?: string, role?: string }|null} user - Token payload.
 * @returns {boolean} `true` when the user may access this assessment.
 */
export function userCanAccessAssessment(assessment, user) {
  if (!assessment || !user) return false;
  const userEmail = String(user.email || "").toLowerCase();
  if (user.role === "Interviewer") return String(assessment.createdBy || "").toLowerCase() === userEmail;
  if (user.role === "Interviewee") return (assessment.candidates || []).map((email) => String(email).toLowerCase()).includes(userEmail);
  return false;
}

/**
 * True when the assessment deadline has passed.
 * Careful: a missing `deadlineAt` falls back to epoch 0, which reads as
 * expired. Callers that support open-ended assessments must check for a
 * deadline before calling this.
 *
 * @param {object} assessment - Assessment with a `deadlineAt` date or string.
 * @param {Date} [now=new Date()] - Injectable clock, for tests.
 * @returns {boolean} `true` when past the deadline; `false` when `deadlineAt`
 *   is an unparseable date.
 */
export function assessmentIsExpired(assessment, now = new Date()) {
  const deadline = new Date(assessment?.deadlineAt || 0);
  // An invalid date gives NaN here, so isFinite doubles as the parse check.
  return Number.isFinite(deadline.getTime()) && deadline.getTime() <= now.getTime();
}

/**
 * Strips everything a candidate must not see before sending an assessment out.
 * Removes hidden tests (which would leak the grading criteria), the candidate
 * roster, and other people's submissions. Interviewers get the document whole.
 *
 * Pure: returns a new object, leaving the mongoose document untouched.
 *
 * @param {object} assessment - Mongoose document or plain object.
 * @param {{ email?: string, role?: string }} user - Token payload; role decides
 *   whether anything is stripped.
 * @returns {object} Assessment safe to serialize to this user.
 */
export function sanitizeAssessmentForUser(assessment, user) {
  const plain = typeof assessment.toObject === "function" ? assessment.toObject() : assessment;
  const userEmail = String(user.email || "").toLowerCase();

  if (user.role === "Interviewer") return plain;

  return {
    ...plain,
    createdBy: undefined,
    candidates: undefined,
    problems: (plain.problems || []).map((problem) => ({
      ...problem,
      // Hidden tests carry the expected outputs — never send them to a candidate.
      tests: (problem.tests || []).filter((test) => test.visible),
    })),
    submissions: (plain.submissions || [])
      .filter((submission) => String(submission.candidateEmail || "").toLowerCase() === userEmail)
      // Rebuilt field by field rather than spread, so a new schema field can't
      // silently start leaking to candidates.
      .map((submission) => ({
        attempts: submission.attempts,
        candidateEmail: submission.candidateEmail,
        maxScore: submission.maxScore,
        passedTests: submission.passedTests,
        score: submission.score,
        status: submission.status,
        submittedAt: submission.submittedAt,
        totalTests: submission.totalTests,
      })),
  };
}

/**
 * Normalizes an untrusted create/update body into a DB-safe assessment.
 * Every field is clamped or truncated, and problems missing a title or prompt
 * are dropped rather than rejected — a partial builder save keeps what's valid.
 * `durationMinutes` is derived from the problems, not taken from the body.
 *
 * @param {object} body - Raw request body.
 * @param {string} ownerEmail - Creator's email; lowercased into `createdBy`.
 * @returns {object} Normalized document fields, ready to persist.
 */
export function normalizeLabAssessmentPayload(body, ownerEmail) {
  const problems = (Array.isArray(body.problems) ? body.problems : [])
    .map(normalizeProblem)
    .filter((problem) => problem.title && problem.prompt)
    .slice(0, 12);
  const durationMinutes = problems.reduce((total, problem) => total + problem.timeLimitMinutes, 0);

  return {
    title: normalizeText(body.title, 140),
    description: normalizeText(body.description, 1200),
    createdBy: String(ownerEmail || "").toLowerCase(),
    candidates: [...new Set(normalizeEmailList(body.candidates, 50))],
    coreSkills: normalizeSkillList(body.coreSkills),
    deadlineAt: normalizeDeadline(body.deadlineAt),
    durationMinutes: clampWholeNumber(durationMinutes, 45, 1, 120),
    problems,
  };
}

/**
 * Normalizes one problem: bounded text, a valid difficulty, and capped tests.
 * Falls back to a `solve` stub when starter code is blank, since the grader
 * requires that function to exist.
 *
 * @param {object} problem - Raw problem from the request body.
 * @returns {object} Normalized problem; may still have an empty title/prompt,
 *   which the caller filters on.
 */
function normalizeProblem(problem) {
  const tests = Array.isArray(problem.tests) ? problem.tests : [];

  return {
    title: normalizeText(problem.title, 140),
    difficulty: ["Easy", "Medium", "Hard"].includes(problem.difficulty) ? problem.difficulty : "Easy",
    timeLimitMinutes: clampWholeNumber(problem.timeLimitMinutes, 10, 1, 180),
    points: clampWholeNumber(problem.points, 100, 1, 1000),
    prompt: normalizeText(problem.prompt, 2500),
    starterCode: normalizeText(problem.starterCode, 12000) || "function solve() {\n  return null;\n}",
    // A test with no name or missing JSON can't be graded, so drop it here.
    tests: tests.map(normalizeTest).filter((test) => test.name && test.inputJson && test.expectedJson).slice(0, 30),
  };
}

/**
 * Parses a value to an integer and clamps it into range.
 * Non-numeric input (including `null` and `""`) becomes `fallback`, which is
 * then clamped too — so an out-of-range fallback still lands inside the bounds.
 *
 * @param {unknown} value - Raw value, typically a form string.
 * @param {number} fallback - Used when parsing fails.
 * @param {number} min - Lower bound, inclusive.
 * @param {number} max - Upper bound, inclusive.
 * @returns {number} Integer within `[min, max]`.
 */
function clampWholeNumber(value, fallback, min, max) {
  const parsed = Number.parseInt(value, 10);
  const number = Number.isFinite(parsed) ? parsed : fallback;
  return Math.min(Math.max(number, min), max);
}

/**
 * Normalizes one test case. `inputJson` and `expectedJson` stay strings here —
 * the grader parses them at run time, so a malformed one fails that test rather
 * than blocking the save.
 *
 * @param {object} test - Raw test case from the request body.
 * @returns {{ name: string, inputJson: string, expectedJson: string, visible: boolean }}
 */
function normalizeTest(test) {
  return {
    name: normalizeText(test.name, 120),
    inputJson: normalizeText(test.inputJson, 2000),
    expectedJson: normalizeText(test.expectedJson, 2000),
    visible: Boolean(test.visible),
  };
}

/**
 * Normalizes core skills from an array or a comma-separated string.
 * Dedupes and caps at 12; blanks are dropped.
 *
 * @param {unknown} value - Array of skills or a comma-separated string.
 * @returns {string[]} Unique, non-empty skill names.
 */
function normalizeSkillList(value) {
  const rawSkills = Array.isArray(value) ? value : String(value || "").split(",");
  return [...new Set(rawSkills.map((skill) => normalizeText(skill, 80)).filter(Boolean))].slice(0, 12);
}

/**
 * Parses the deadline into a Date, passing `Invalid Date` through unchanged.
 * Validation is the caller's job — both lab routes reject an unparseable
 * deadline with a 400 before this value ever reaches mongoose.
 * @param {unknown} value - Raw deadline, usually an ISO string.
 * @returns {Date} Parsed date, possibly `Invalid Date`.
 */
function normalizeDeadline(value) {
  return new Date(value);
}
