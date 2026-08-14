/** @file JWT secret and token verification, shared by every auth surface. */

import { jwtVerify } from "jose/jwt/verify";

/**
 * Reads `JWT_SECRET` and encodes it as bytes for jose.
 * Not cached, so a rotated secret applies without a restart.
 * @returns {Uint8Array} UTF-8 bytes of the secret.
 * @throws {Error} When `JWT_SECRET` is unset.
 */
export function getJwtSecret() {
  const secret = process.env.JWT_SECRET;

  if (!secret) {
    throw new Error("JWT_SECRET is not configured.");
  }

  return new TextEncoder().encode(secret);
}

/**
 * Verifies a signed auth token and returns its claims.
 * A missing token returns null; a present but invalid one throws, so callers
 * can tell "signed out" from "expired session".
 * @param {string|undefined} token - Raw JWT from the `prepTalkToken` cookie.
 * @returns {Promise<{id: string, email: string, role: string}|null>} Claims, or null.
 * @throws {Error} When the signature fails, or the token is malformed or expired.
 */
export async function verifyAuthToken(token) {
  if (!token) {
    return null;
  }

  const { payload } = await jwtVerify(token, getJwtSecret());
  return payload;
}
