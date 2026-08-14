/**
 * mm:ss for a seconds count.
 * @param {number} totalSeconds
 * @returns {string}
 */
export function formatTime(seconds) {
  const minutes = Math.floor(seconds / 60).toString().padStart(2, "0");
  const remaining = (seconds % 60).toString().padStart(2, "0");
  return `${minutes}:${remaining}`;
}

/**
 * Structural equality via key-sorted JSON comparison.
 * @returns {boolean}
 */
export function deepEqual(left, right) {
  return JSON.stringify(left) === JSON.stringify(right);
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
