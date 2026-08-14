/**
 * @file Fixed-window rate limiting for login, register, and AI routes.
 * Per-process and volatile: behind N instances the real limit is `limit x N`.
 * Slows casual brute-forcing; not a security control — use Redis for that.
 */

/**
 * Active windows keyed by caller identity. Entries are overwritten when their
 * window lapses but never swept, so add eviction before keying by anything
 * higher-cardinality than an IP.
 * @type {Map<string, { count: number, resetAt: number }>}
 */
const buckets = new Map();

/**
 * Best-effort client IP from proxy headers.
 * Takes the leftmost `x-forwarded-for` entry, else `x-real-ip`. Both are
 * spoofable — use for bucketing, never for authorization.
 * @param {Request} req - Incoming request; only headers are read.
 * @returns {string} Client IP, or `"unknown"` (all such callers share one bucket).
 */
export function getClientIp(req) {
  const forwarded = req.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0].trim();
  return req.headers.get("x-real-ip") || "unknown";
}

/**
 * Records a request against a fixed window and reports whether it's over quota.
 * This consumes one unit of allowance — call it once per request and reuse the
 * result, since calling twice charges twice.
 * @param {{ key: string, limit?: number, windowMs?: number }} options - `key` should be
 *   namespaced per route (`` `login:${ip}` ``) so endpoints don't share an allowance.
 * @returns {{ limited: boolean, remaining: number, resetAt: number }} Reject flag, quota left, and reset time in epoch ms.
 */
export function rateLimit({ key, limit = 10, windowMs = 60_000 }) {
  const now = Date.now();
  const bucket = buckets.get(key);

  // No bucket, or the window lapsed: start fresh. This overwrite is also what
  // keeps stale entries from accumulating per key.
  if (!bucket || bucket.resetAt <= now) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return { limited: false, remaining: limit - 1, resetAt: now + windowMs };
  }

  bucket.count += 1;
  if (bucket.count > limit) {
    return { limited: true, remaining: 0, resetAt: bucket.resetAt };
  }

  return { limited: false, remaining: limit - bucket.count, resetAt: bucket.resetAt };
}

/**
 * Builds the 429 for a request `rateLimit` rejected.
 * Plain `Response` because the body only uses `message`; the wait time is
 * omitted so an attacker can't time their retry.
 * @returns {Response} 429 with a JSON body.
 */
export function rateLimitResponse() {
  return new Response(JSON.stringify({ message: "Too many requests. Please try again shortly." }), {
    status: 429,
    headers: { "Content-Type": "application/json" },
  });
}
