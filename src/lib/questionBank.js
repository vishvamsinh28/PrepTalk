/**
 * @file Normalization for AI-generated question banks. Gemini fails the same
 * ways every time — bare strings instead of objects, `followUps` as a delimited
 * blob, missing categories — so a bad generation degrades to fewer questions
 * rather than a crashed render.
 */

/**
 * One normalized interview question.
 * @typedef {object} InterviewQuestion
 * @property {string} category - Section heading; `"General"` when omitted.
 * @property {string} skill - Skill probed; empty string hides the badge.
 * @property {string} question - Question text; always non-empty.
 * @property {string[]} followUps - Follow-up prompts; possibly empty, never null.
 */

/**
 * Normalizes raw model output into well-formed questions.
 * Each field is coerced independently so one bad field costs that field, not
 * the entry; entries with no question text are dropped last. The result can be
 * shorter than the input — check `.length` before reporting success.
 *
 * Pure: builds a new array, never mutates `value`.
 *
 * @param {unknown} value - `questions` field from a parsed model response; a
 *   non-array (including `null`) yields `[]` rather than throwing.
 * @returns {InterviewQuestion[]} Questions with non-empty text and array `followUps`.
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
