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
 * Pretty-prints a test value for the results panel.
 * @param {unknown} value
 * @returns {string}
 */
export function formatValue(value) {
  return JSON.stringify(value);
}

/**
 * Initial idle result rows for a problem's tests.
 * @param {object} problem
 * @returns {object[]}
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
 * Static debugging hint used when no AI insight exists.
 * @returns {string}
 */
export function fallbackInsight(test, output, error) {
  if (error) {
    return "The code stopped before returning a valid answer. Check the solve function signature and runtime error first.";
  }

  return `Expected ${formatValue(test.expected)} but received ${formatValue(output)}. Trace this case and compare each state update with the expected result.`;
}
