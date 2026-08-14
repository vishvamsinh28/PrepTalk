/**
 * @file Client-side practice sandbox for the Lab code editor.
 * Runs candidate code in a Web Worker with network and storage globals blocked.
 * This is for fast feedback only — it is **not** the grader. Anything that
 * counts is re-run server-side by `@/lib/labServerRunner`, because a worker in
 * the candidate's own browser can always be tampered with.
 */

/**
 * Runs candidate code against one test input in a sandboxed Web Worker.
 * Never rejects: a throw, a timeout, or a worker crash all resolve to
 * `{ ok: false, error }`, so callers need no try/catch.
 * Hardening is defence-in-depth, not a security boundary — `fetch`, storage,
 * and nested workers are shadowed, and `solve` is built via `Function` with
 * those names shadowed as parameters so the common escapes resolve to
 * `undefined`. A determined candidate can still defeat this, which is exactly
 * why the server re-grades.
 * @param {string} code - Candidate source; must define a `solve` function.
 * @param {unknown} input - Test input; an array is spread across `solve`'s params.
 * @param {number} [timeoutMs=900] - Kill deadline, slightly under the server's 1000ms.
 * @returns {Promise<{ok: boolean, output?: unknown, error?: string, duration: number|null}>}
 *   Always resolves. `duration` is null on the worker-error path.
 */
export function runUserCodeInWorker(code, input, timeoutMs = 900) {
  return new Promise((resolve) => {
    // Worker body as a string so it can be loaded from a blob URL with no
    // separate file. `emit` captures postMessage *before* the loop below
    // shadows it — otherwise blocking postMessage would also block our own
    // channel back to the page.
    const workerSource = `
      const emit = globalThis.postMessage.bind(globalThis);
      const blocked = () => {
        throw new Error("This API is unavailable in the PrepTalk Lab sandbox.");
      };

      for (const key of [
        "fetch",
        "XMLHttpRequest",
        "WebSocket",
        "EventSource",
        "Worker",
        "SharedWorker",
        "importScripts",
        "indexedDB",
        "caches",
        "localStorage",
        "sessionStorage",
        "postMessage"
      ]) {
        try {
          Object.defineProperty(globalThis, key, {
            value: blocked,
            configurable: false,
            writable: false
          });
        } catch (error) {
          // Some globals are non-configurable and cannot be shadowed; the rest
          // of the sandbox hardening still applies.
          console.warn("sandbox: could not shadow global", key, error.message);
        }
      }

      globalThis.onmessage = async (event) => {
        const started = Date.now();

        try {
          const solve = Function(
            "window",
            "document",
            "fetch",
            "XMLHttpRequest",
            "WebSocket",
            "EventSource",
            "Worker",
            "importScripts",
            "postMessage",
            "globalThis",
            "\\"use strict\\";\\n" + event.data.code + "\\n; return solve;"
          )(
            undefined,
            undefined,
            undefined,
            undefined,
            undefined,
            undefined,
            undefined,
            undefined,
            undefined,
            undefined
          );

          if (typeof solve !== "function") {
            throw new Error("Expected a solve function.");
          }

          const output = await Promise.resolve(Array.isArray(event.data.input) ? solve(...event.data.input) : solve(event.data.input));
          emit({
            ok: true,
            output,
            duration: Math.max(1, Date.now() - started)
          });
        } catch (error) {
          emit({
            ok: false,
            error: error?.message || "Runtime error",
            duration: Math.max(1, Date.now() - started)
          });
        }
      };
    `;

    const url = URL.createObjectURL(new Blob([workerSource], { type: "text/javascript" }));
    const worker = new Worker(url);
    let settled = false;

    // Guards against message/error/timeout racing; also the single place the
    // worker and its blob URL are released, so no path leaks either.
    const finish = (result) => {
      if (settled) return;
      settled = true;
      worker.terminate();
      URL.revokeObjectURL(url);
      resolve(result);
    };

    const timeout = window.setTimeout(() => {
      finish({
        ok: false,
        error: `Execution timed out after ${timeoutMs}ms.`,
        duration: timeoutMs,
      });
    }, timeoutMs);

    worker.onmessage = (event) => {
      window.clearTimeout(timeout);
      finish(event.data);
    };

    worker.onerror = (error) => {
      window.clearTimeout(timeout);
      finish({
        ok: false,
        error: error?.message || "Sandbox error",
        duration: null,
      });
    };

    worker.postMessage({ code, input });
  });
}
