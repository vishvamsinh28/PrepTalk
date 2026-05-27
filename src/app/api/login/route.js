import { connectDB } from "@/lib/db";
import User from "@/models/User";
import bcrypt from "bcryptjs";
import { createAuthCookie, signAuthToken } from "@/lib/auth";
import { json } from "@/lib/api";

export async function POST(req) {
  try {
    const { email, password } = await req.json();

    await connectDB();

    const user = await User.findOne({ email });
    if (!user) {
      return json({ message: "User not found" }, 404);
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return json({ message: "Invalid credentials" }, 401);
    }

    const token = await signAuthToken(user);
    const serialized = createAuthCookie(token);

    return json({ message: "Login successful" }, 200, {
      headers: { "Set-Cookie": serialized },
    });
  } catch (error) {
    console.error(error);
    return json({ message: "Login failed", error: error.message }, 500);
  }
}
