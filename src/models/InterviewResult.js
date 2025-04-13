import mongoose from "mongoose";

const InterviewResultSchema = new mongoose.Schema({
  userEmail: { type: String, required: true },
  role: { type: String, required: true },
  summary: { type: String, required: true },
  date: { type: Date, default: Date.now },
});

export default mongoose.models.InterviewResult || mongoose.model("InterviewResult", InterviewResultSchema);
