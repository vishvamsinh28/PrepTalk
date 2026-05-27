import { getAuthPayloadFromRequest } from "@/lib/auth";
import { json } from "@/lib/api";

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
