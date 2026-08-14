/**
 * @file Server-only client for Gemini's generateContent endpoint, behind every
 * AI feature (prep guides, question banks, scorecard summaries, code
 * explanations). Callers get a parsed object, never raw model text.
 */

/**
 * Extracts the first JSON object from a model response.
 * `responseMimeType: "application/json"` is a hint, not a guarantee — output
 * still arrives fenced or with preamble, so strip fences and slice first `{` to
 * last `}`.
 *
 * @param {string} text - Raw concatenated text from the response parts.
 * @returns {object} The parsed JSON object.
 * @throws {Error} When no brace pair is present, or the extracted span fails to
 *   parse (the `SyntaxError` message is folded in so the cause survives).
 */
function extractJson(text) {
  const cleaned = String(text ?? "").replace(/```json|```/g, "").trim();
  const start = cleaned.indexOf("{");
  const end = cleaned.lastIndexOf("}");

  if (start === -1 || end === -1) {
    throw new Error("Gemini did not return JSON.");
  }

  try {
    return JSON.parse(cleaned.slice(start, end + 1));
  } catch (error) {
    throw new Error(`Gemini returned malformed JSON: ${error.message}`);
  }
}

/**
 * Sends a prompt to Gemini and returns the JSON object it produced.
 * `temperature: 0.7` keeps regenerated question banks varied while holding the
 * JSON shape. No retry and no timeout — transient failures surface to the caller.
 *
 * @param {string} prompt - Must describe the exact JSON shape expected; nothing
 *   here validates the result against a schema.
 * @returns {Promise<object>} Parsed JSON from the first candidate.
 * @throws {Error} When `GEMINI_API` is unset, the call returns non-2xx, the
 *   response has no text (safety-filtered or truncated), or it holds no JSON.
 */
export async function generateGeminiJson(prompt) {
  const apiKey = process.env.GEMINI_API;
  const model = process.env.GEMINI_MODEL || "gemini-3.1-flash-lite";

  if (!apiKey) {
    throw new Error("GEMINI_API is not configured.");
  }

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [
          {
            role: "user",
            parts: [{ text: prompt }],
          },
        ],
        generationConfig: {
          responseMimeType: "application/json",
          temperature: 0.7,
        },
      }),
    }
  );

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Gemini request failed: ${errorText}`);
  }

  const data = await response.json();
  // A candidate can exist with no parts when generation was filtered or cut
  // short, so every step of this path is optional-chained.
  const text = data.candidates?.[0]?.content?.parts?.map((part) => part.text).join("\n");

  if (!text) {
    throw new Error("Gemini returned an empty response.");
  }

  return extractJson(text);
}
