/**
 * @file Coercion for AI-generated prep-guide text. The model returns either one
 * markdown block or an array of bullets; this flattens both to one string.
 */

/**
 * Coerces AI prep-guide output into a displayable string.
 * Arrays become a markdown bullet list; strings pass through unchanged (an
 * empty one is a real answer, so it is not replaced); anything else — objects,
 * `null`, numbers — yields `fallback`, since raw JSON is worse than nothing.
 *
 * Pure: the input array is read, never mutated.
 *
 * @param {unknown} value - Raw `prepGuide` field from the parsed model response.
 * @param {string} [fallback=""] - Used when `value` is neither array nor string.
 * @returns {string} Renderable text; never `null` or `undefined`.
 */
export function normalizePrepGuide(value, fallback = "") {
  if (Array.isArray(value)) {
    return value.map((item) => `- ${String(item).trim()}`).join("\n");
  }

  if (typeof value === "string") {
    return value;
  }

  return fallback;
}
