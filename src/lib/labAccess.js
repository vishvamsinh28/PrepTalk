import { normalizeEmailList, normalizeText } from "@/lib/validation";

export function userCanAccessAssessment(assessment, user) {
  if (!assessment || !user) return false;
  const userEmail = String(user.email || "").toLowerCase();
  if (user.role === "Interviewer") return String(assessment.createdBy || "").toLowerCase() === userEmail;
  if (user.role === "Interviewee") return (assessment.candidates || []).map((email) => String(email).toLowerCase()).includes(userEmail);
  return false;
}

export function assessmentIsExpired(assessment, now = new Date()) {
  const deadline = new Date(assessment?.deadlineAt || 0);
  return Number.isFinite(deadline.getTime()) && deadline.getTime() <= now.getTime();
}

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
      tests: (problem.tests || []).filter((test) => test.visible),
    })),
    submissions: (plain.submissions || [])
      .filter((submission) => String(submission.candidateEmail || "").toLowerCase() === userEmail)
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

function normalizeProblem(problem) {
  const tests = Array.isArray(problem.tests) ? problem.tests : [];

  return {
    title: normalizeText(problem.title, 140),
    difficulty: ["Easy", "Medium", "Hard"].includes(problem.difficulty) ? problem.difficulty : "Easy",
    timeLimitMinutes: clampWholeNumber(problem.timeLimitMinutes, 10, 1, 180),
    points: clampWholeNumber(problem.points, 100, 1, 1000),
    prompt: normalizeText(problem.prompt, 2500),
    starterCode: normalizeText(problem.starterCode, 12000) || "function solve() {\n  return null;\n}",
    tests: tests.map(normalizeTest).filter((test) => test.name && test.inputJson && test.expectedJson).slice(0, 30),
  };
}

function clampWholeNumber(value, fallback, min, max) {
  const parsed = Number.parseInt(value, 10);
  const number = Number.isFinite(parsed) ? parsed : fallback;
  return Math.min(Math.max(number, min), max);
}

function normalizeTest(test) {
  return {
    name: normalizeText(test.name, 120),
    inputJson: normalizeText(test.inputJson, 2000),
    expectedJson: normalizeText(test.expectedJson, 2000),
    visible: Boolean(test.visible),
  };
}

function normalizeSkillList(value) {
  const rawSkills = Array.isArray(value) ? value : String(value || "").split(",");
  return [...new Set(rawSkills.map((skill) => normalizeText(skill, 80)).filter(Boolean))].slice(0, 12);
}

function normalizeDeadline(value) {
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return parsed;
  }
  return parsed;
}
