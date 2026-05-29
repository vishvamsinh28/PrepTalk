const buckets = new Map();

export function getClientIp(req) {
  const forwarded = req.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0].trim();
  return req.headers.get("x-real-ip") || "unknown";
}

export function rateLimit({ key, limit = 10, windowMs = 60_000 }) {
  const now = Date.now();
  const bucket = buckets.get(key);

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

export function rateLimitResponse() {
  return new Response(JSON.stringify({ message: "Too many requests. Please try again shortly." }), {
    status: 429,
    headers: { "Content-Type": "application/json" },
  });
}
