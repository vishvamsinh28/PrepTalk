import { clearAuthCookie } from "@/lib/auth";
import { json } from "@/lib/api";

export async function POST() {
  const serialized = clearAuthCookie();

  return json({ message: "Logged out" }, 200, {
    headers: { "Set-Cookie": serialized },
  });
}
