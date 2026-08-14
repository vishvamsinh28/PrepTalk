/** @file Auth cookie lifecycle — signs session tokens and builds the `Set-Cookie` headers. Owns the cookie name, lifetime, and security flags. */

import { SignJWT } from "jose/jwt/sign";
import { serialize } from "cookie";
import { getJwtSecret, verifyAuthToken } from "@/lib/token";

/** Cookie name holding the signed session JWT. Must match `serverAuth`. */
const AUTH_COOKIE_NAME = "prepTalkToken";

/** Login lifetime; drives both the JWT `exp` and the cookie max-age. */
const LOGIN_SESSION_DAYS = 30;

/** `LOGIN_SESSION_DAYS` in seconds, for the cookie's `Max-Age`. */
const TOKEN_MAX_AGE_SECONDS = 60 * 60 * 24 * LOGIN_SESSION_DAYS;

/**
 * Signs a session JWT carrying the user's id, email, and role.
 * Email and role are embedded so access checks run without a DB hit — the
 * tradeoff is that a role change only applies at next login.
 * @param {{ _id: object|string, email: string, role: string }} user - `_id` is stringified.
 * @returns {Promise<string>} HS256-signed JWT.
 * @throws {Error} When `JWT_SECRET` is missing or `user._id` is nullish.
 */
export async function signAuthToken(user) {
  return new SignJWT({
    id: user._id.toString(),
    email: user.email,
    role: user.role,
  })
    .setProtectedHeader({ alg: "HS256" })
    .setExpirationTime(`${LOGIN_SESSION_DAYS}d`)
    .sign(getJwtSecret());
}

/**
 * Reads and verifies the auth cookie on a route-handler request.
 * Collapses missing, expired, and tampered tokens into one `null` — handlers
 * answer 401 for all three and must not leak which it was.
 * @param {import("next/server").NextRequest} req - Request whose cookie jar is read.
 * @returns {Promise<{id: string, email: string, role: string}|null>} Claims, or null.
 */
export async function getAuthPayloadFromRequest(req) {
  const token = req.cookies.get(AUTH_COOKIE_NAME)?.value;

  try {
    return await verifyAuthToken(token);
  } catch {
    // Expiry is routine on a 30-day session, not an incident worth logging.
    return null;
  }
}

/**
 * Serializes the httpOnly cookie that logs a user in.
 * `httpOnly` blocks XSS reads, `sameSite: strict` blocks CSRF, and `secure` is
 * off in development so local HTTP still works.
 * @param {string} token - Signed JWT from `signAuthToken`.
 * @returns {string} `Set-Cookie` header value.
 */
export function createAuthCookie(token) {
  const expires = new Date(Date.now() + TOKEN_MAX_AGE_SECONDS * 1000);

  return serialize(AUTH_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: TOKEN_MAX_AGE_SECONDS,
    expires,
    path: "/",
  });
}

/**
 * Serializes an already-expired cookie, logging the user out.
 * Name and `path` must match `createAuthCookie` or the browser keeps the
 * original and the logout silently fails.
 * @returns {string} `Set-Cookie` header value that clears `prepTalkToken`.
 */
export function clearAuthCookie() {
  return serialize(AUTH_COOKIE_NAME, "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    expires: new Date(0),
    path: "/",
  });
}
