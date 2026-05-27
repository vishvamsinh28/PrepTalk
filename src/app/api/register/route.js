import { connectDB } from "@/lib/db";
import User from "@/models/User";
import bcrypt from "bcryptjs";
import { json } from "@/lib/api";

export async function POST(req) {
  try {
    const { username, email, password, role } = await req.json();

    await connectDB();

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return json({ message: "User already exists" }, 400);
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({ username, email, password: hashedPassword, role });
    await newUser.save();

    return json({ message: "User registered successfully" }, 201);
  } catch (error) {
    console.error(error);
    return json({ message: "Registration failed", error: error.message }, 500);
  }
}
