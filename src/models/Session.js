import mongoose from "mongoose";

const SessionSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: { type: String },
    role: { type: String, required: true },
    level: { type: String, enum: ["Entry", "Mid", "Senior"], default: "Entry" },
    interviewType: { type: String, enum: ["Technical", "Behavioral", "Mixed"], default: "Technical" },
    skills: [{ type: String }],
    createdBy: { type: String, required: true },
    interviewees: [{ type: String }],
  },
  { timestamps: true }
);

export default mongoose.models.Session || mongoose.model("Session", SessionSchema);
