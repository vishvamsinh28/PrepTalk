import mongoose from "mongoose";

const SessionSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: { type: String },
    createdBy: { type: String, required: true },
    participants: [{ type: String }],
    evaluators: [{ type: String }],
  },
  { timestamps: true }
);

export default mongoose.models.Session || mongoose.model("Session", SessionSchema);
