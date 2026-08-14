/**
 * @file Browser-side fetch wrappers for the app's own JSON API. Non-2xx becomes
 * a thrown error carrying status and body, so callers write one `try/catch`
 * instead of checking `response.ok` everywhere. Auth rides the httpOnly cookie.
 */

/**
 * An `Error` enriched with the failed response's status and parsed body.
 * @typedef {Error & { status: number, data: object }} ApiError
 * @property {number} status - HTTP status of the failed response.
 * @property {object} data - Parsed body, or `{}` when it wasn't valid JSON.
 */

/**
 * Performs a JSON request and normalizes success and failure.
 * Note `options` spreads after `headers`, so a caller-supplied `headers` key
 * replaces the default content type — pass additions via `options.headers`.
 *
 * @param {string} url - Absolute or same-origin relative URL.
 * @param {RequestInit} [options={}] - Standard fetch init.
 * @returns {Promise<any>} Parsed body on any 2xx.
 * @throws {ApiError} On non-2xx, with `.status` and `.data`. A network failure
 *   throws the raw `TypeError` with no `.status`, which is how callers tell
 *   the two apart.
 */
async function requestJson(url, options = {}) {
  const response = await fetch(url, {
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
    ...options,
  });

  // Error responses aren't always JSON (proxy 502s, HTML crash pages); a parse
  // failure must not shadow the status code we actually care about.
  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    const error = new Error(data.message || data.error || "Request failed");
    error.status = response.status;
    error.data = data;
    throw error;
  }

  return data;
}

/**
 * Fetches a JSON endpoint.
 *
 * @param {string} url - Endpoint to read, e.g. `/api/session/list`.
 * @returns {Promise<any>} Parsed body.
 * @throws {ApiError} On any non-2xx response.
 */
export function getJson(url) {
  return requestJson(url);
}

/**
 * Sends a JSON body with `POST`, for creates and actions.
 *
 * @param {string} url - Endpoint to post to.
 * @param {object} body - Stringified; `undefined` values are dropped.
 * @returns {Promise<any>} Parsed body.
 * @throws {ApiError} On any non-2xx response.
 */
export function postJson(url, body) {
  return requestJson(url, {
    method: "POST",
    body: JSON.stringify(body),
  });
}

/**
 * Sends a JSON body with `PATCH`, for partial updates.
 *
 * @param {string} url - Endpoint to patch.
 * @param {object} body - Only changed fields; absent keys mean "leave alone".
 * @returns {Promise<any>} Parsed body.
 * @throws {ApiError} On any non-2xx response.
 */
export function patchJson(url, body) {
  return requestJson(url, {
    method: "PATCH",
    body: JSON.stringify(body),
  });
}

/**
 * Sends `DELETE`, optionally with a JSON body.
 * A body is always sent because some handlers identify the target through it
 * rather than through the URL.
 *
 * @param {string} url - Endpoint to delete from.
 * @param {object} [body={}] - Optional payload identifying what to remove.
 * @returns {Promise<any>} Parsed body.
 * @throws {ApiError} On any non-2xx response.
 */
export function deleteJson(url, body = {}) {
  return requestJson(url, {
    method: "DELETE",
    body: JSON.stringify(body),
  });
}
