/**
 * @file Edge middleware handling route-level redirects.
 * This is a routing convenience, not the security boundary — it only inspects
 * the cookie. Every page and API route re-verifies access on the server, so a
 * forged or stale cookie gets past this and is caught there.
 */

import { NextResponse } from "next/server";
import { verifyAuthToken } from "@/lib/token";

/** Pages a signed-in user should be bounced away from. */
const AUTH_PAGES = new Set(["/login", "/register"]);

/** Prefixes requiring a session. Matched with `startsWith`, so `/session/:id` is covered. */
const PROTECTED_PATHS = ["/dashboard", "/interviewer", "/interviewee", "/session", "/lab"];

/**
 * Redirects logged-out users away from protected pages, and logged-in users
 * away from login and register.
 * Runs on the edge runtime, which is why verification uses `jose` rather than a
 * Node crypto library. An invalid token is treated exactly like no token —
 * bounced from protected paths, allowed through elsewhere — so an expired
 * session lands on login rather than an error.
 * Note `/` is in the matcher but in neither list: the landing page stays
 * reachable whether or not you're signed in.
 * @param {import("next/server").NextRequest} request - Incoming request.
 * @returns {Promise<import("next/server").NextResponse>} A redirect, or `next()` to continue.
 */
export async function middleware(request) {
  const { pathname } = request.nextUrl;
  const isAuthPage = AUTH_PAGES.has(pathname);
  const isProtectedPath = PROTECTED_PATHS.some((path) => pathname.startsWith(path));
  const token = request.cookies.get("prepTalkToken")?.value;

  if (!token) {
    if (isProtectedPath) {
      return NextResponse.redirect(new URL("/login", request.url));
    }

    return NextResponse.next();
  }

  try {
    const payload = await verifyAuthToken(token);

    if (isAuthPage) {
      const roleHome = payload.role === "Interviewer"
        ? "/interviewer"
        : payload.role === "Interviewee"
          ? "/interviewee"
          : "/dashboard";

      return NextResponse.redirect(new URL(roleHome, request.url));
    }

    return NextResponse.next();
  } catch (err) {
    console.error("JWT verification failed:", err);

    if (isProtectedPath) {
      return NextResponse.redirect(new URL("/login", request.url));
    }

    return NextResponse.next();
  }
}

/**
 * Paths this middleware runs on.
 * Deliberately excludes `/api/*` — route handlers do their own auth and return
 * JSON, so a redirect there would break clients expecting a 401.
 */
export const config = {
  matcher: ["/", "/login", "/register", "/dashboard/:path*", "/interviewer/:path*", "/interviewee/:path*", "/session/:path*", "/lab/:path*"],
};
