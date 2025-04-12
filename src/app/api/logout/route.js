import { serialize } from "cookie";

export async function POST() {
  const serialized = serialize("prepTalkToken", "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    expires: new Date(0),
    path: "/",
  });

  return new Response(
    JSON.stringify({ message: "Logged out" }),
    {
      status: 200,
      headers: { "Set-Cookie": serialized },
    }
  );
}
