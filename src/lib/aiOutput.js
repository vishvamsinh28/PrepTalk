export function normalizePrepGuide(value, fallback = "") {
  if (Array.isArray(value)) {
    return value.map((item) => `- ${String(item).trim()}`).join("\n");
  }

  if (typeof value === "string") {
    return value;
  }

  return fallback;
}
