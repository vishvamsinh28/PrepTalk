/**
 * @file Mongoose model: a PrepTalk account.
 * `email` is the identity key used by every access check, which is why it's
 * lowercased and uniquely indexed here — the index, not the pre-insert lookup
 * in the register route, is what actually enforces uniqueness.
 * `password` stores a bcrypt hash; nothing writes a plaintext value to it.
 */
import mongoose from "mongoose";

const UserSchema = new mongoose.Schema({
  username: { type: String, required: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { type: String, required: true },
  role: { type: String, enum: ["Interviewer", "Interviewee"], default: "Interviewee" },
}, { timestamps: true });

export default mongoose.models.User || mongoose.model("User", UserSchema);
