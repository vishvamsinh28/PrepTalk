/** @file Coercion for AI prep-guide text — the model returns either one markdown block or an array of bullets. */

/**
 * Coerces AI prep-guide output into a displayable string.
 * Arrays become a bullet list; strings pass through (an empty one is a real
 * answer); anything else yields `fallback`, since raw JSON is worse than nothing.
 * @param {unknown} value - Raw `prepGuide` field from the parsed model response.
 * @param {string} [fallback=""] - Used when `value` is neither array nor string.
 * @returns {string} Renderable text; never null or undefined.
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
