import mongoose from "mongoose";

const QuizResultSchema = new mongoose.Schema({
  userEmail: { type: String, required: true },
  totalQuestions: { type: Number, required: true },
  score: { type: Number, required: true },
  date: { type: Date, default: Date.now },
});

export default mongoose.models.QuizResult || mongoose.model("QuizResult", QuizResultSchema);
