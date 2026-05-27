import { getAblyRestClient } from "@/lib/ably";
import { getAuthPayloadFromRequest } from "@/lib/auth";
import { json } from "@/lib/api";

export async function GET(req) {
  try {
    const user = await getAuthPayloadFromRequest(req);
    if (!user) {
      return json({ message: "Unauthorized" }, 401);
    }

    const ably = getAblyRestClient();
    const tokenRequest = await ably.auth.createTokenRequest({
      clientId: user.email,
    });

    return json(tokenRequest);
  } catch (error) {
    console.error("Ably token error:", error);
    return json({ message: "Unable to create Ably token", error: error.message }, 500);
  }
}
