import { NextResponse } from "next/server";
import { verifyAuthToken } from "@/lib/token";

const AUTH_PAGES = new Set(["/login", "/register"]);
const PROTECTED_PATHS = ["/dashboard", "/interviewer", "/interviewee", "/session", "/lab"];

/**
 * Edge middleware: redirects logged-out users away from protected pages
 * and logged-in users away from the auth pages, based on the JWT cookie.
 * @param {import("next/server").NextRequest} request
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
 * Paths the middleware runs on.
 */
export const config = {
  matcher: ["/", "/login", "/register", "/dashboard/:path*", "/interviewer/:path*", "/interviewee/:path*", "/session/:path*", "/lab/:path*"],
};
