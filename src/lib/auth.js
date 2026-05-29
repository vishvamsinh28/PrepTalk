import { SignJWT } from "jose/jwt/sign";
import { serialize } from "cookie";
import { getJwtSecret, verifyAuthToken } from "@/lib/token";

const AUTH_COOKIE_NAME = "prepTalkToken";
const LOGIN_SESSION_DAYS = 30;
const TOKEN_MAX_AGE_SECONDS = 60 * 60 * 24 * LOGIN_SESSION_DAYS;

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

export async function getAuthPayloadFromRequest(req) {
  const token = req.cookies.get(AUTH_COOKIE_NAME)?.value;

  try {
    return await verifyAuthToken(token);
  } catch (error) {
    return null;
  }
}

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

export function clearAuthCookie() {
  return serialize(AUTH_COOKIE_NAME, "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    expires: new Date(0),
    path: "/",
  });
}
