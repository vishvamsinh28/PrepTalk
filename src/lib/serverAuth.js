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

export async function requireCurrentUser() {
  const user = await getCurrentUser();

  if (!user) {
    throw new Error("Unauthorized");
  }

  return user;
}

export async function requireRole(role) {
  const user = await requireCurrentUser();

  if (user.role !== role) {
    throw new Error("Forbidden");
  }

  return user;
}
