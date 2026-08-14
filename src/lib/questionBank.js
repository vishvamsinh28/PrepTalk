/** @file Normalizes AI question-bank output so a malformed generation degrades to fewer questions rather than a crashed render. */

/**
 * Normalizes raw model output into well-formed questions.
 * Accepts a bare string (treated as the question) or an object, coercing each
 * field independently so one bad field costs that field, not the entry.
 * Entries with no question text are dropped, so the result can be shorter than
 * the input — check `.length` before reporting success.
 * @param {unknown} value - `questions` field from a parsed model response; a non-array yields `[]`.
 * @returns {Array<{category: string, skill: string, question: string, followUps: string[]}>} Normalized questions.
 */
export function normalizeQuestionList(value) {
  if (!Array.isArray(value)) return [];

  return value
    .map((item) => {
      // A bare string is the model's shorthand for "just the question".
      if (typeof item === "string") {
        return { category: "General", skill: "", question: item, followUps: [] };
      }

      return {
        category: String(item?.category || "General").trim(),
        skill: String(item?.skill || "").trim(),
        question: String(item?.question || "").trim(),
        followUps: Array.isArray(item?.followUps)
          ? item.followUps.map((followUp) => String(followUp).trim()).filter(Boolean)
          : // Non-array follow-ups arrive as one blob; the model uses newlines
            // and semicolons interchangeably as separators.
            String(item?.followUps || "")
              .split(/\n|;/)
              .map((followUp) => followUp.trim())
              .filter(Boolean),
      };
    })
    .filter((item) => item.question);
}
