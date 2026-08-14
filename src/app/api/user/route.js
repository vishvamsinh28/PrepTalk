import { getAuthPayloadFromRequest } from "@/lib/auth";
import { json } from "@/lib/api";

/**
 * GET /api/user — the signed-in user's token payload (id, email, role).
 * 401 when not signed in.
 */
export async function GET(req) {
  try {
    const payload = await getAuthPayloadFromRequest(req);

    if (!payload) {
      return json({ message: "No token found" }, 401);
    }

    return json({ email: payload.email, role: payload.role });
  } catch (error) {
    return json({ message: "Invalid token" }, 401);
  }
}
