/**
 * Mongoose model: a submitted scorecard — five score dimensions,
 * recommendation, notes, and optional AI summary.
 */
import mongoose from "mongoose";

const ScoreSchema = new mongoose.Schema(
  {
    communication: { type: Number, min: 1, max: 5, required: true },
    technicalDepth: { type: Number, min: 1, max: 5, required: true },
    problemSolving: { type: Number, min: 1, max: 5, required: true },
    confidence: { type: Number, min: 1, max: 5, required: true },
    roleFit: { type: Number, min: 1, max: 5, required: true },
  },
  { _id: false }
);

const InterviewReportSchema = new mongoose.Schema(
  {
    sessionId: { type: mongoose.Schema.Types.ObjectId, ref: "Session", required: true },
    intervieweeEmail: { type: String, required: true },
    interviewerEmail: { type: String, required: true },
    recommendation: {
      type: String,
      enum: ["Strong hire", "Hire", "Needs more practice", "No hire"],
      required: true,
    },
    scores: { type: ScoreSchema, required: true },
    strengths: { type: String, required: true },
    improvements: { type: String, required: true },
    notes: { type: String },
    aiSummary: { type: String },
    actionItems: [{ type: String }],
  },
  { timestamps: true }
);

InterviewReportSchema.index({ sessionId: 1, intervieweeEmail: 1 }, { unique: true });

export default mongoose.models.InterviewReport || mongoose.model("InterviewReport", InterviewReportSchema);
