/** @file Formatting and comparison helpers for the Lab candidate results panel. */

/**
 * mm:ss for a seconds count.
 * Negative and non-finite inputs clamp to 0, so a drifting timer can't render
 * something like `-1:-3`.
 * @param {number} seconds - Whole seconds remaining.
 * @returns {string} Zero-padded `mm:ss`.
 */
export function formatTime(seconds) {
  const safeSeconds = Number.isFinite(seconds) && seconds > 0 ? Math.floor(seconds) : 0;
  const minutes = Math.floor(safeSeconds / 60).toString().padStart(2, "0");
  const remaining = (safeSeconds % 60).toString().padStart(2, "0");
  return `${minutes}:${remaining}`;
}

/**
 * Recursively sorts object keys so `JSON.stringify` is order-independent.
 * Must mirror `normalizeValue` in `@/lib/labServerRunner` — if these two drift,
 * a practice run and the graded run disagree on the same solution.
 * @param {*} value - Any JSON-compatible value.
 * @returns {*} Same value with every object's keys sorted.
 */
function normalizeValue(value) {
  if (Array.isArray(value)) return value.map(normalizeValue);
  if (value && typeof value === "object") {
    return Object.keys(value)
      .sort()
      .reduce((normalized, key) => {
        normalized[key] = normalizeValue(value[key]);
        return normalized;
      }, {});
  }
  return value;
}

/**
 * Structural equality via key-sorted JSON comparison.
 * Array order is still significant; only object key order is ignored.
 * @param {*} left - Actual output from the sandbox.
 * @param {*} right - Expected value from the test case.
 * @returns {boolean} `true` when structurally equal.
 */
export function deepEqual(left, right) {
  return JSON.stringify(normalizeValue(left)) === JSON.stringify(normalizeValue(right));
}

/**
 * Renders a test value for the results panel.
 * Returns the string `"undefined"` for undefined input — which is the useful
 * display when a candidate's `solve` returns nothing.
 * @param {unknown} value - Expected or actual test value.
 * @returns {string} JSON representation.
 */
export function formatValue(value) {
  return JSON.stringify(value);
}

/**
 * Builds idle result rows so the panel lists every test before the first run.
 * Spreads each test, so rows carry `name` and `expected` alongside run state.
 * @param {object} problem - Runnable problem with a `tests` array.
 * @returns {object[]} One `status: "idle"` row per test.
 */
export function createResults(problem) {
  return problem.tests.map((test) => ({
    ...test,
    duration: null,
    error: "",
    output: null,
    status: "idle",
    insight: "",
  }));
}

/**
 * Static debugging hint shown until (or instead of) an AI explanation.
 * Kept deliberately generic — it points at the failure without revealing the
 * approach, so a candidate who never calls the AI route isn't handed the answer.
 * @param {object} test - Test row, supplying `expected`.
 * @param {unknown} output - Actual output; ignored when `error` is set.
 * @param {string} error - Runtime error message, or `""` for a wrong answer.
 * @returns {string} Hint text.
 */
export function fallbackInsight(test, output, error) {
  if (error) {
    return "The code stopped before returning a valid answer. Check the solve function signature and runtime error first.";
  }

  return `Expected ${formatValue(test.expected)} but received ${formatValue(output)}. Trace this case and compare each state update with the expected result.`;
}
