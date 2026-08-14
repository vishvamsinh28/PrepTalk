/**
 * @file Server-side grading sandbox for lab submissions.
 * Candidate code runs in a `node:vm` context inside a worker thread — the vm
 * strips globals, the worker caps memory and survives an unkillable loop that
 * `vm`'s own timeout can't interrupt. Client-side `sandboxRunner.js` is for
 * practice runs only; scores that count are produced here.
 */

import { Worker } from "node:worker_threads";

/** Wall-clock budget for one `solve` call, enforced inside the vm. */
const RUN_TIMEOUT_MS = 1000;

/** Cap on serialized output, to stop a huge return value from pinning memory. */
const MAX_OUTPUT_CHARS = 8000;

/**
 * Outer kill deadline. Slightly longer than `RUN_TIMEOUT_MS` so the vm's own
 * timeout normally fires first and reports a clean error; this only trips when
 * the vm timeout couldn't interrupt the code at all.
 */
const WORKER_TIMEOUT_MS = RUN_TIMEOUT_MS + 250;

/**
 * Worker body, interpolated at module load and run with `eval: true`.
 * Written as a string because it needs its own thread and module scope. The vm
 * context blanks `fetch`, `process`, `require`, and both globals, and disables
 * codegen so `eval`/`new Function` can't be used to escape it. `microtaskMode:
 * "afterEvaluate"` drains pending microtasks, which is what makes the
 * "no async solve" check enforceable.
 */
const WORKER_SOURCE = `
  import vm from "node:vm";
  import { parentPort } from "node:worker_threads";

  const RUN_TIMEOUT_MS = ${RUN_TIMEOUT_MS};
  const MAX_OUTPUT_CHARS = ${MAX_OUTPUT_CHARS};

  parentPort.on("message", ({ code, input }) => {
    const started = Date.now();

    try {
      const context = vm.createContext({
        __input: input,
        console: Object.freeze({ log() {}, error() {}, warn() {} }),
        fetch: undefined,
        global: undefined,
        globalThis: undefined,
        process: undefined,
        require: undefined,
      }, {
        codeGeneration: {
          strings: false,
          wasm: false,
        },
        microtaskMode: "afterEvaluate",
      });
      const script = new vm.Script(\`
        "use strict";
        \${code}
        if (typeof solve !== "function") {
          throw new Error("Expected a solve function.");
        }
        const __output = Array.isArray(__input) ? solve(...__input) : solve(__input);
        if (__output && typeof __output.then === "function") {
          throw new Error("Async solve functions are not supported for final grading.");
        }
        __output;
      \`);
      const output = script.runInContext(context, { timeout: RUN_TIMEOUT_MS });

      parentPort.postMessage({
        ok: true,
        output: sanitizeOutput(output),
        duration: Math.max(1, Date.now() - started),
      });
    } catch (error) {
      parentPort.postMessage({
        ok: false,
        error: error?.message || "Runtime error",
        duration: Math.max(1, Date.now() - started),
      });
    }
  });

  function sanitizeOutput(value) {
    const serialized = JSON.stringify(value);
    if (serialized && serialized.length > MAX_OUTPUT_CHARS) {
      throw new Error("Output is too large.");
    }
    return value;
  }
`;

/**
 * Result of running one test case.
 * @typedef {object} TestRunResult
 * @property {boolean} ok - `false` when the code threw, timed out, or the
 *   sandbox died.
 * @property {*} [output] - Return value of `solve`, present only when `ok`.
 * @property {string} [error] - Failure message, present only when not `ok`.
 * @property {number} duration - Milliseconds elapsed, floored at 1.
 */

/**
 * Grades a full submission: every test of every problem, with totals.
 * Problems the candidate didn't attempt still run (against `""`) so they score
 * zero rather than being skipped, keeping `maxScore` honest. Per-problem score
 * is pro-rated by tests passed.
 *
 * Sequential by design — running every test concurrently would let one
 * submission spawn dozens of workers at once.
 *
 * @param {object} assessment - Assessment document with a `problems` array.
 * @param {Array<{problemIndex: number, code: string}>} [solutions=[]] - Candidate
 *   code per problem; entries without an integer `problemIndex` are ignored.
 * @returns {Promise<{ maxScore: number, passedTests: number, problemResults: object[],
 *   runtimeMs: number, score: number, totalTests: number }>} Full breakdown.
 *   Hidden-test details are included — strip them before sending to a candidate.
 */
export async function gradeLabAssessment(assessment, solutions = []) {
  const solutionByIndex = new Map();

  for (const solution of solutions) {
    if (Number.isInteger(solution.problemIndex)) {
      solutionByIndex.set(solution.problemIndex, String(solution.code || ""));
    }
  }
  const problemResults = [];
  let passedTests = 0;
  let totalTests = 0;
  let runtimeMs = 0;

  for (const [problemIndex, problem] of (assessment.problems || []).entries()) {
    // Unattempted problems run against empty code so they score 0 and still
    // contribute their points to maxScore.
    const code = solutionByIndex.get(problemIndex) ?? "";
    const tests = [];

    for (const test of problem.tests || []) {
      totalTests += 1;
      const input = parseJsonValue(test.inputJson);
      const expected = parseJsonValue(test.expectedJson);
      const result = await runSolve(code, input);
      const passed = result.ok && deepEqual(result.output, expected);

      if (passed) passedTests += 1;
      runtimeMs += Number(result.duration) || 0;
      tests.push({
        name: test.name,
        passed,
        duration: result.duration,
        error: result.error || "",
        output: result.ok ? result.output : null,
        visible: Boolean(test.visible),
      });
    }

    const problemPassed = tests.filter((test) => test.passed).length;
    // max(…, 1) keeps a problem with no tests from dividing by zero; it scores 0.
    const problemTestCount = Math.max(tests.length, 1);

    problemResults.push({
      code,
      problemIndex,
      title: problem.title,
      score: Math.round((problemPassed / problemTestCount) * problem.points),
      maxScore: problem.points,
      tests,
    });
  }

  return {
    maxScore: problemResults.reduce((total, problem) => total + problem.maxScore, 0),
    passedTests,
    problemResults,
    runtimeMs,
    score: problemResults.reduce((total, problem) => total + problem.score, 0),
    totalTests,
  };
}

/**
 * Runs one `solve` call in a throwaway worker and resolves with its outcome.
 * Never rejects — every failure path (throw, timeout, worker crash, early exit)
 * resolves to `{ ok: false, error }` so the grading loop never needs a catch.
 * The `settled` flag matters because those paths can race; first one wins and
 * the rest are ignored.
 *
 * A fresh worker per test is deliberate: it guarantees no state leaks between
 * test cases, at roughly 30-40ms startup each.
 *
 * @param {string} code - Candidate source, truncated to 12k chars.
 * @param {*} input - Parsed test input. An array is spread across `solve`'s
 *   parameters; anything else is passed as a single argument.
 * @returns {Promise<TestRunResult>} Always resolves, never rejects.
 */
function runSolve(code, input) {
  const started = Date.now();

  return new Promise((resolve) => {
    const worker = new Worker(WORKER_SOURCE, {
      eval: true,
      resourceLimits: {
        maxOldGenerationSizeMb: 32,
        maxYoungGenerationSizeMb: 16,
        stackSizeMb: 4,
      },
      type: "module",
    });
    let settled = false;

    // Guards against the message/error/exit/timeout paths racing each other.
    const finish = async (result) => {
      if (settled) return;
      settled = true;
      clearTimeout(timeout);
      // Terminate failures are ignored — the worker is already being discarded.
      await worker.terminate().catch(() => {});
      resolve(result);
    };

    // Outer deadline for code the vm's own timeout couldn't interrupt.
    const timeout = setTimeout(() => {
      finish({
        ok: false,
        error: `Execution timed out after ${RUN_TIMEOUT_MS}ms.`,
        duration: Math.max(1, Date.now() - started),
      });
    }, WORKER_TIMEOUT_MS);

    worker.once("message", (result) => finish(result));
    worker.once("error", (error) => {
      finish({
        ok: false,
        error: error?.message || "Sandbox error",
        duration: Math.max(1, Date.now() - started),
      });
    });
    worker.once("exit", (codeValue) => {
      // Non-zero exit without a message means the worker died first — usually
      // the memory cap. A clean exit after finish() already ran is a no-op.
      if (codeValue !== 0) {
        finish({
          ok: false,
          error: "Sandbox stopped before returning a result.",
          duration: Math.max(1, Date.now() - started),
        });
      }
    });

    worker.postMessage({ code: String(code || "").slice(0, 12000), input });
  });
}

/**
 * Parses a stored test value, returning the raw string when it isn't JSON.
 * That fallback lets an author write `hello` instead of `"hello"` in the test
 * builder — the string is then compared as-is.
 *
 * @param {string} value - `inputJson` or `expectedJson` from a test case.
 * @returns {*} Parsed value, or the original string when parsing fails.
 */
function parseJsonValue(value) {
  try {
    return JSON.parse(value);
  } catch {
    // Not JSON — treat it as a plain string literal, which is usually intended.
    return value;
  }
}

/**
 * Structural equality for test comparison, ignoring object key order.
 * Compares serialized forms, so it can't distinguish `undefined` from a missing
 * key and won't handle `NaN`, `Map`, `Set`, or cycles — none of which appear in
 * JSON-defined test cases.
 *
 * @param {*} left - Actual output from `solve`.
 * @param {*} right - Expected value from the test case.
 * @returns {boolean} `true` when structurally equal.
 */
function deepEqual(left, right) {
  return JSON.stringify(normalizeValue(left)) === JSON.stringify(normalizeValue(right));
}

/**
 * Recursively sorts object keys so `JSON.stringify` is order-independent.
 * Without this, `{a:1,b:2}` and `{b:2,a:1}` would compare unequal and fail a
 * correct solution. Array order is preserved — that's significant.
 *
 * Pure: builds new objects rather than sorting in place.
 *
 * @param {*} value - Any JSON-compatible value.
 * @returns {*} Same value with every object's keys in sorted order.
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
