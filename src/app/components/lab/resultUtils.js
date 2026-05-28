export function formatTime(seconds) {
  const minutes = Math.floor(seconds / 60).toString().padStart(2, "0");
  const remaining = (seconds % 60).toString().padStart(2, "0");
  return `${minutes}:${remaining}`;
}

export function deepEqual(left, right) {
  return JSON.stringify(left) === JSON.stringify(right);
}

export function formatValue(value) {
  return JSON.stringify(value);
}

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

export function fallbackInsight(test, output, error) {
  if (error) {
    return "The code stopped before returning a valid answer. Check the solve function signature and runtime error first.";
  }

  return `Expected ${formatValue(test.expected)} but received ${formatValue(output)}. Trace this case and compare each state update with the expected result.`;
}
