import { Worker } from "node:worker_threads";

const RUN_TIMEOUT_MS = 1000;
const MAX_OUTPUT_CHARS = 8000;
const WORKER_TIMEOUT_MS = RUN_TIMEOUT_MS + 250;
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

export async function gradeLabAssessment(assessment, solutions = []) {
  const solutionByIndex = new Map();
  const solutionByTitle = new Map();

  for (const solution of solutions) {
    if (Number.isInteger(solution.problemIndex)) {
      solutionByIndex.set(solution.problemIndex, String(solution.code || ""));
    }
    if (solution.title) {
      solutionByTitle.set(String(solution.title), String(solution.code || ""));
    }
  }
  const problemResults = [];
  let passedTests = 0;
  let totalTests = 0;
  let runtimeMs = 0;

  for (const [problemIndex, problem] of (assessment.problems || []).entries()) {
    const code = solutionByIndex.get(problemIndex) ?? solutionByTitle.get(problem.title) ?? "";
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

    const finish = async (result) => {
      if (settled) return;
      settled = true;
      clearTimeout(timeout);
      await worker.terminate().catch(() => {});
      resolve(result);
    };

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

function parseJsonValue(value) {
  try {
    return JSON.parse(value);
  } catch {
    return value;
  }
}

function deepEqual(left, right) {
  return JSON.stringify(normalizeValue(left)) === JSON.stringify(normalizeValue(right));
}

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
