import { jwtVerify } from "jose";

export async function GET(req) {
  try {
    const token = req.cookies.get("prepTalkToken")?.value;

    if (!token) {
      return new Response(JSON.stringify({ message: "No token found" }), { status: 401 });
    }

    const secret = new TextEncoder().encode(process.env.JWT_SECRET);
    const { payload } = await jwtVerify(token, secret);

    return new Response(JSON.stringify({ email: payload.email, role: payload.role }), { status: 200 });
  } catch (error) {
    return new Response(JSON.stringify({ message: "Invalid token" }), { status: 401 });
  }
}
