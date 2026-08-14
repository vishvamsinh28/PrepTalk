/**
 * @file Input validation in two layers: `normalize*` helpers coerce untrusted
 * values into bounded primitives and never throw; the zod schemas reject bodies
 * outright. All schemas live here rather than inline per route.
 */

import { z } from "zod";

/**
 * Normalizes any value to a trimmed, lowercased email string.
 * Lowercasing is what makes email usable as an identity key — every ownership
 * check compares against this form.
 * @param {unknown} value - Raw input; nullish becomes `""`.
 * @returns {string} Normalized email, or `""` when absent.
 */
export function normalizeEmail(value) {
  return String(value ?? "").trim().toLowerCase();
}

/**
 * Checks whether a value is a plausible email address.
 * Deliberately loose — catches typos, not deliverability.
 * @param {unknown} value - Raw input; normalized before testing.
 * @returns {boolean} `true` when it looks like an email under 254 chars.
 */
export function isValidEmail(value) {
  const email = normalizeEmail(value);
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) && email.length <= 254;
}

/**
 * Trims free text and truncates it to a maximum length.
 * Truncates rather than rejecting, so an over-long paste saves what fits.
 * @param {unknown} value - Raw input; nullish becomes `""`.
 * @param {number} [maxLength=1000] - Character cap applied after trimming.
 * @returns {string} Trimmed, truncated text.
 */
export function normalizeText(value, maxLength = 1000) {
  return String(value ?? "").trim().slice(0, maxLength);
}

/**
 * Normalizes a comma-separated string or array into a bounded list.
 * Accepts both shapes because these fields arrive as a joined string from text
 * inputs and as an array from JSON clients. Blanks are dropped.
 * @param {unknown} value - Array, or comma-separated string.
 * @param {number} [maxItems=20] - Cap on entries kept.
 * @param {number} [maxItemLength=80] - Per-entry character cap.
 * @returns {string[]} Trimmed, non-empty entries. Not deduplicated.
 */
export function normalizeStringList(value, maxItems = 20, maxItemLength = 80) {
  const items = Array.isArray(value) ? value : String(value ?? "").split(",");

  return items
    .map((item) => normalizeText(item, maxItemLength))
    .filter(Boolean)
    .slice(0, maxItems);
}

/**
 * Normalizes a list of emails, silently dropping anything invalid.
 * Dropping rather than rejecting is intentional for invite fields — one typo
 * shouldn't fail the whole invite; `findMissingIntervieweeEmails` surfaces them.
 * @param {unknown} value - Array, or comma-separated string of emails.
 * @param {number} [maxItems=25] - Cap on emails kept.
 * @returns {string[]} Valid, normalized emails.
 */
export function normalizeEmailList(value, maxItems = 25) {
  return normalizeStringList(value, maxItems, 254).map(normalizeEmail).filter(isValidEmail);
}

/**
 * Email that is trimmed and lowercased before validation.
 * The transform-then-pipe order matters: normalizing first means `" Bob@X.com "`
 * passes rather than failing on whitespace or casing.
 */
export const emailSchema = z
  .string({ error: "Email is required" })
  .transform((value) => value.trim().toLowerCase())
  .pipe(z.string().regex(/^[^\s@]+@[^\s@]+\.[^\s@]+$/, "Enter a valid email address").max(254));

/**
 * Login body. Password is only checked for presence — enforcing length here
 * would tell an attacker which stored passwords are short.
 */
export const loginSchema = z.object({
  email: emailSchema,
  password: z.string({ error: "Password is required" }).min(1, "Password is required"),
});

/**
 * Registration body. `role` uses `.catch()` so an unrecognized or hostile value
 * falls back to `"Interviewee"` (the lower privilege) instead of failing.
 */
export const registerSchema = z.object({
  username: z
    .string({ error: "Username is required" })
    .transform((value) => value.trim())
    .pipe(z.string().min(1, "Username is required").max(80, "Username is too long")),
  email: emailSchema,
  password: z
    .string({ error: "Password is required" })
    .min(8, "Password must be at least 8 characters")
    .max(200, "Password is too long"),
  role: z.enum(["Interviewer", "Interviewee"]).catch("Interviewee"),
});

/**
 * Runs a zod schema against a request body and flattens it to the API's result
 * contract, so handlers branch on `success` instead of try/catching. Only the
 * first issue is surfaced — enough to fix one field, without leaking the schema.
 * @param {import("zod").ZodType} schema - Schema to validate against.
 * @param {unknown} body - Parsed request body; non-objects are rejected early.
 * @returns {{ success: true, data: any } | { success: false, error: string }} `data` is the transformed output.
 */
export function parseWith(schema, body) {
  // Guard first: safeParse on a non-object produces a confusing message.
  if (body == null || typeof body !== "object") {
    return { success: false, error: "Request body must be JSON" };
  }
  const result = schema.safeParse(body);
  if (result.success) {
    return { success: true, data: result.data };
  }
  const first = result.error.issues?.[0];
  return { success: false, error: first?.message ?? "Invalid request" };
}
