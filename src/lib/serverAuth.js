import { cookies } from "next/headers";
import { verifyAuthToken } from "@/lib/token";

export async function getCurrentUser() {
  const cookieStore = await cookies();
  const token = cookieStore.get("prepTalkToken")?.value;

  try {
    return await verifyAuthToken(token);
  } catch (error) {
    return null;
  }
}
