import mongoose from "mongoose";

const FeedbackSchema = new mongoose.Schema(
  {
    sessionId: { type: mongoose.Schema.Types.ObjectId, ref: "Session", required: true },
    userEmail: { type: String, required: true },
    role: { type: String, enum: ["Moderator", "Evaluator"], required: true },
    rating: { type: Number, min: 1, max: 5, required: true },
    comments: { type: String },
  },
  { timestamps: true }
);

export default mongoose.models.Feedback || mongoose.model("Feedback", FeedbackSchema);
