import { connectDB } from "@/lib/db";
import User from "@/models/User";
import bcrypt from "bcryptjs";
import { json } from "@/lib/api";
import { normalizeEmail, normalizeText } from "@/lib/validation";

const allowedRoles = new Set(["Interviewer", "Interviewee"]);

export async function POST(req) {
  try {
    const { username, email, password, role } = await req.json();
    const cleanUsername = normalizeText(username, 80);
    const cleanEmail = normalizeEmail(email);
    const cleanRole = allowedRoles.has(role) ? role : "Interviewee";

    if (!cleanUsername || !cleanEmail || !password) {
      return json({ message: "Username, email, and password are required" }, 400);
    }

    if (String(password).length < 8) {
      return json({ message: "Password must be at least 8 characters" }, 400);
    }

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
    return json({ message: "Registration failed", error: error.message }, 500);
  }
}
