import { clearAuthCookie } from "@/lib/auth";
import { json, serverError } from "@/lib/api";

/** Clears the auth cookie. Always safe to call, even when not logged in. */
export async function POST() {
  try {
    const serialized = clearAuthCookie();

    return json({ success: true, message: "Logged out" }, 200, {
      headers: { "Set-Cookie": serialized },
    });
  } catch (error) {
    console.error("Logout failed:", error);
    return serverError("Logout failed");
  }
}
