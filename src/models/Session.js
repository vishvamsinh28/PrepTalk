import mongoose from "mongoose";

const AgendaItemSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    minutes: { type: Number, min: 1, default: 10 },
  },
  { _id: false }
);

const QuestionSchema = new mongoose.Schema(
  {
    category: { type: String, default: "General" },
    question: { type: String, required: true },
    followUps: [{ type: String }],
    skill: { type: String },
  },
  { _id: false }
);

const WorkspaceSchema = new mongoose.Schema(
  {
    notes: { type: String, default: "" },
    code: { type: String, default: "" },
  },
  { _id: false }
);

const SessionSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: { type: String },
    role: { type: String, default: "General" },
    level: { type: String, enum: ["Entry", "Mid", "Senior"], default: "Entry" },
    interviewType: { type: String, enum: ["Technical", "Behavioral", "Mixed"], default: "Technical" },
    skills: [{ type: String }],
    createdBy: { type: String, required: true },
    interviewees: [{ type: String }],
    scheduledAt: { type: Date },
    durationMinutes: { type: Number, min: 15, default: 60 },
    agenda: [AgendaItemSchema],
    questionBank: [QuestionSchema],
    prepGuide: { type: String },
    inviteCode: { type: String, unique: true, sparse: true },
    workspace: { type: WorkspaceSchema, default: () => ({}) },
  },
  { timestamps: true }
);

export default mongoose.models.Session || mongoose.model("Session", SessionSchema);
