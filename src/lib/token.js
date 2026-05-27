import { jwtVerify } from "jose/jwt/verify";

export function getJwtSecret() {
  const secret = process.env.JWT_SECRET;

  if (!secret) {
    throw new Error("JWT_SECRET is not configured.");
  }

  return new TextEncoder().encode(secret);
}

export async function verifyAuthToken(token) {
  if (!token) {
    return null;
  }

  const { payload } = await jwtVerify(token, getJwtSecret());
  return payload;
}
