/** @file Adapts stored assessment problems into the shape the candidate screen runs and renders. */

import { deepEqual, fallbackInsight } from "./resultUtils";

/**
 * Shapes a stored problem into the runnable form the candidate screen uses.
 * Test JSON is parsed once here rather than per run. The `id` falls back to
 * `title-index` because sanitized payloads may omit `_id`, and React needs a
 * stable key either way.
 * @param {object} problem - Problem as returned by the assessment API.
 * @param {number} index - Position in the assessment; retained as `index` for submission.
 * @returns {object} Runnable problem with parsed tests and starter code.
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
 * Parses stored test JSON, returning the raw string when it isn't valid JSON.
 * Must behave identically to the server's copy in `@/lib/labServerRunner`, or a
 * test would be fed different input locally than during grading.
 * @param {string} value - `inputJson` or `expectedJson` from a test case.
 * @returns {unknown} Parsed value, or the original string.
 */
export function parseJsonValue(value) {
  try {
    return JSON.parse(value);
  } catch {
    return value;
  }
}

/**
 * Combines a test definition with its sandbox result into a UI row.
 * A crash and a wrong answer both render as `failed`, distinguished by whether
 * `error` is set. Insights are attached only on failure, since a passing test
 * has nothing to explain.
 * @param {object} test - Runnable test with its `expected` value.
 * @param {{ok: boolean, output?: unknown, error?: string, duration?: number}} result - Sandbox result.
 * @returns {object} Row with `status`, `output`, `duration`, and an `insight` when failed.
 */
export function toTestResult(test, result) {
  if (!result.ok) {
    return { ...test, duration: result.duration, error: result.error || "Runtime error", output: null, status: "failed", insight: fallbackInsight(test, null, result.error) };
  }
  const passed = deepEqual(result.output, test.expected);
  return { ...test, duration: result.duration, error: "", output: result.output, status: passed ? "passed" : "failed", insight: passed ? "" : fallbackInsight(test, result.output, "") };
}
