/**
 * @file Server-side grading sandbox. Candidate code runs in a `node:vm` context
 * inside a worker thread — the vm strips globals, the worker caps memory and
 * survives loops the vm timeout can't interrupt. Client-side `sandboxRunner.js`
 * is practice only; scores that count are produced here.
 */

import { Worker } from "node:worker_threads";

/** Wall-clock budget for one `solve` call, enforced inside the vm. */
const RUN_TIMEOUT_MS = 1000;

/** Cap on serialized output, so a huge return value can't pin memory. */
const MAX_OUTPUT_CHARS = 8000;

/** Outer kill deadline; only trips when the vm timeout couldn't interrupt the code. */
const WORKER_TIMEOUT_MS = RUN_TIMEOUT_MS + 250;

/**
 * Worker body, interpolated at load and run with `eval: true`. A string because
 * it needs its own thread and module scope. The vm context blanks `fetch`,
 * `process`, `require`, and both globals, and disables codegen so `eval` and
 * `new Function` can't escape it.
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
 * Grades a full submission: every test of every problem, with totals.
 * Unattempted problems still run (against `""`) so they score zero rather than
 * being skipped, keeping `maxScore` honest. Sequential by design — parallel
 * tests would let one submission spawn dozens of workers at once.
 * @param {object} assessment - Assessment document with a `problems` array.
 * @param {Array<{problemIndex: number, code: string}>} [solutions=[]] - Entries without an integer index are ignored.
 * @returns {Promise<{ maxScore: number, passedTests: number, problemResults: object[],
 *   runtimeMs: number, score: number, totalTests: number }>} Full breakdown, including
 *   hidden-test detail — strip it before sending to a candidate.
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
 * Never rejects — throw, timeout, crash, and early exit all resolve to
 * `{ ok: false, error }`, so the grading loop needs no catch. A fresh worker per
 * test guarantees no state leaks between cases, at ~30-40ms startup each.
 * @param {string} code - Candidate source, truncated to 12k chars.
 * @param {*} input - Parsed test input; an array is spread across `solve`'s params.
 * @returns {Promise<{ok: boolean, output?: *, error?: string, duration: number}>} Always resolves.
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
 * That fallback lets an author write `hello` instead of `"hello"`.
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
 * Must stay in sync with `deepEqual` in `components/lab/resultUtils.js`, or a
 * practice run and the graded run disagree on the same solution.
 * @param {*} left - Actual output from `solve`.
 * @param {*} right - Expected value from the test case.
 * @returns {boolean} `true` when structurally equal.
 */
function deepEqual(left, right) {
  return JSON.stringify(normalizeValue(left)) === JSON.stringify(normalizeValue(right));
}

/**
 * Recursively sorts object keys so `JSON.stringify` is order-independent.
 * Without this, `{a:1,b:2}` and `{b:2,a:1}` would fail a correct solution.
 * Array order is preserved — that's significant. Pure: builds new objects.
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
