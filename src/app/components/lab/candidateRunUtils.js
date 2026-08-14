import { deepEqual, fallbackInsight } from "./resultUtils";

/**
 * Shapes a stored assessment problem into the runnable form the
 * candidate screen uses (parsed tests, starter code, stable id).
 * @param {object} problem
 * @param {number} index
 * @returns {object}
 */
export function toRunnableProblem(problem, index) {
  return {
    id: problem._id || `${problem.title}-${index}`,
    index,
    title: problem.title,
    level: problem.difficulty,
    points: problem.points,
    time: `${problem.timeLimitMinutes} min`,
    prompt: problem.prompt,
    starter: problem.starterCode,
    tests: (problem.tests || []).map((test) => ({
      name: test.name,
      input: parseJsonValue(test.inputJson),
      expected: parseJsonValue(test.expectedJson),
      visible: test.visible,
    })),
  };
}

/**
 * Parses JSON, returning the raw value when it is not valid JSON —
 * test inputs may be plain strings.
 * @param {string} value
 * @returns {unknown}
 */
export function parseJsonValue(value) {
  try {
    return JSON.parse(value);
  } catch {
    return value;
  }
}

/**
 * Combines a test definition with a sandbox run result into the
 * UI's result row shape.
 * @param {object} test
 * @param {{ ok: boolean, output?: unknown, error?: string, duration?: number }} result
 * @returns {object}
 */
export function toTestResult(test, result) {
  if (!result.ok) {
    return { ...test, duration: result.duration, error: result.error || "Runtime error", output: null, status: "failed", insight: fallbackInsight(test, null, result.error) };
  }
  const passed = deepEqual(result.output, test.expected);
  return { ...test, duration: result.duration, error: "", output: result.output, status: passed ? "passed" : "failed", insight: passed ? "" : fallbackInsight(test, result.output, "") };
}
