import mongoose from "mongoose";

const QuestionSchema = new mongoose.Schema({
  userEmail: { type: String, required: true },
  category: { type: String, required: true },
  question: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.models.Question || mongoose.model("Question", QuestionSchema);
