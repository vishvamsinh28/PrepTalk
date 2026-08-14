/**
 * Mongoose model: a PrepTalk account (username, email, bcrypt password
 * hash, and Interviewer/Interviewee role).
 */
import mongoose from "mongoose";

const UserSchema = new mongoose.Schema({
  username: { type: String, required: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { type: String, required: true },
  role: { type: String, enum: ["Interviewer", "Interviewee"], default: "Interviewee" },
}, { timestamps: true });

export default mongoose.models.User || mongoose.model("User", UserSchema);
