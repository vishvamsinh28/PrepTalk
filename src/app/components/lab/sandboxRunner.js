/**
 * Runs candidate code against one test input in a sandboxed Web Worker
 * with blocked globals and a timeout.
 * @param {string} code
 * @param {unknown} input
 * @returns {Promise<{ ok: boolean, output?: unknown, error?: string, duration: number }>}
 */
export function runUserCodeInWorker(code, input, timeoutMs = 900) {
  return new Promise((resolve) => {
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
