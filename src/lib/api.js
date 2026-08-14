/** @file Response helpers giving every API route one JSON shape. `error` is the field to read; `message` duplicates it for older clients. */

import { NextResponse } from "next/server";

/**
 * Wraps a payload in a `NextResponse` with an explicit status.
 * `status` is applied after spreading `init`, so the named argument always wins.
 * @param {object} data - Serializable response body.
 * @param {number} [status=200] - HTTP status code.
 * @param {ResponseInit} [init={}] - Extra init, typically `headers`.
 * @returns {NextResponse} JSON response.
 */
export function json(data, status = 200, init = {}) {
  return NextResponse.json(data, { ...init, status });
}

/**
 * Standard 400 for input the caller can fix by changing the request.
 * The message is shown to the user, so say what to correct, not what broke.
 * @param {string} [message="Invalid request"] - User-facing description.
 * @returns {NextResponse} 400 with `{ success: false, error, message }`.
 */
export function badRequest(message = "Invalid request") {
  return json({ success: false, error: message, message }, 400);
}

/**
 * Standard 500 for failures the caller can't act on.
 * Keep it generic — stack traces and driver errors belong in `console.error`.
 * @param {string} [message="Internal server error"] - User-facing message.
 * @returns {NextResponse} 500 with `{ success: false, error, message }`.
 */
export function serverError(message = "Internal server error") {
  return json({ success: false, error: message, message }, 500);
}
