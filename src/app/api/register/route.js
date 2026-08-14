import { connectDB } from "@/lib/db";
import User from "@/models/User";
import bcrypt from "bcryptjs";
import { badRequest, json, serverError } from "@/lib/api";
import { parseWith, registerSchema } from "@/lib/validation";
import { getClientIp, rateLimit, rateLimitResponse } from "@/lib/rateLimit";

/**
 * POST /api/register — creates an account after zod validation and
 * rate limiting. Returns 201 on success.
 */
export async function POST(req) {
  try {
    const body = await req.json().catch(() => null);
    const parsed = parseWith(registerSchema, body);
    if (!parsed.success) return badRequest(parsed.error);

    const { username: cleanUsername, email: cleanEmail, password, role: cleanRole } = parsed.data;
    const limiter = rateLimit({
      key: `register:${getClientIp(req)}:${cleanEmail || "unknown"}`,
      limit: 5,
      windowMs: 60 * 60 * 1000,
    });
    if (limiter.limited) return rateLimitResponse();

    await connectDB();

    const existingUser = await User.findOne({ email: cleanEmail });
    if (existingUser) {
      return json({ message: "User already exists" }, 400);
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({
      username: cleanUsername,
      email: cleanEmail,
      password: hashedPassword,
      role: cleanRole,
    });
    await newUser.save();

    return json({ message: "User registered successfully" }, 201);
  } catch (error) {
    console.error(error);
    return serverError("Registration failed");
  }
}
