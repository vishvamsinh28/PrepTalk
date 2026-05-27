import { NextResponse } from "next/server";
import { verifyAuthToken } from "@/lib/token";

export async function middleware(request) {
  const token = request.cookies.get("prepTalkToken")?.value;

  if (!token) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  try {
    await verifyAuthToken(token);
    return NextResponse.next();
  } catch (err) {
    console.error("JWT verification failed:", err);
    return NextResponse.redirect(new URL("/login", request.url));
  }
}

export const config = {
  matcher: ["/dashboard/:path*", "/interviewer/:path*", "/interviewee/:path*"],
};
