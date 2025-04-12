import { connectDB } from "@/lib/db";
import Session from "@/models/Session";
import { jwtVerify } from "jose";

export async function POST(req) {
  try {
    const { title, description, participants, evaluators } = await req.json();

    const token = req.cookies.get("prepTalkToken")?.value;

    if (!token) {
      return new Response(JSON.stringify({ message: "Unauthorized" }), { status: 401 });
    }

    const secret = new TextEncoder().encode(process.env.JWT_SECRET);
    const { payload } = await jwtVerify(token, secret);

    if (payload.role !== "Moderator") {
      return new Response(JSON.stringify({ message: "Only moderators can create sessions" }), { status: 403 });
    }

    await connectDB();

    const newSession = new Session({
      title,
      description,
      createdBy: payload.email,
      participants,
      evaluators,
    });

    await newSession.save();

    return new Response(JSON.stringify({ message: "Session created successfully" }), { status: 201 });
  } catch (error) {
    console.error(error);
    return new Response(JSON.stringify({ message: "Session creation failed", error: error.message }), { status: 500 });
  }
}
