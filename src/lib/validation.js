export function normalizeEmail(value) {
  return String(value || "").trim().toLowerCase();
}

export function isValidEmail(value) {
  const email = normalizeEmail(value);
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) && email.length <= 254;
}

export function normalizeText(value, maxLength = 1000) {
  return String(value || "").trim().slice(0, maxLength);
}

export function normalizeStringList(value, maxItems = 20, maxItemLength = 80) {
  const items = Array.isArray(value) ? value : String(value || "").split(",");

  return items
    .map((item) => normalizeText(item, maxItemLength))
    .filter(Boolean)
    .slice(0, maxItems);
}

export function normalizeEmailList(value, maxItems = 25) {
  return normalizeStringList(value, maxItems, 254).map(normalizeEmail).filter(isValidEmail);
}
