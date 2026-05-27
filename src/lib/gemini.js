export async function generateGeminiContent(input, generationConfig) {
  const apiKey = process.env.GEMINI_API_KEY;
  const model = process.env.GEMINI_MODEL?.replace(/^models\//, "");

  if (!apiKey) {
    throw new Error("GEMINI_API_KEY is not configured.");
  }

  if (!model) {
    throw new Error("GEMINI_MODEL is not configured.");
  }

  const requestBody = typeof input === "string"
    ? { contents: [{ role: "user", parts: [{ text: input }] }] }
    : input;
  const body = generationConfig
    ? { ...requestBody, generationConfig }
    : requestBody;

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-goog-api-key": apiKey,
      },
      body: JSON.stringify(body),
    }
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error?.message || "Gemini API request failed.");
  }

  const text = data.candidates?.[0]?.content?.parts
    ?.map((part) => part.text || "")
    .join("")
    .trim();

  if (!text) {
    throw new Error("Gemini API returned an empty response.");
  }

  return text;
}
