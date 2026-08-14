/**
 * @file Mongoose model: a Lab coding assessment.
 * Problems, their test cases, and every candidate submission are embedded in
 * one document rather than split across collections — an assessment is always
 * loaded whole, and the grader needs the tests alongside the results.
 * Test `inputJson`/`expectedJson` stay strings and are parsed at run time, so a
 * malformed case fails that test instead of blocking the save.
 * `deadlineAt` is required, which is what makes the epoch-0 fallback in
 * `assessmentIsExpired` safe for persisted documents.
 */
import mongoose from "mongoose";

const LabTestCaseSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 120 },
    inputJson: { type: String, required: true, maxlength: 2000 },
    expectedJson: { type: String, required: true, maxlength: 2000 },
    visible: { type: Boolean, default: true },
  },
  { _id: false }
);

const LabProblemSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true, maxlength: 140 },
    difficulty: { type: String, enum: ["Easy", "Medium", "Hard"], default: "Easy" },
    timeLimitMinutes: { type: Number, min: 1, max: 180, default: 10, set: Math.trunc },
    points: { type: Number, min: 1, max: 1000, default: 100, set: Math.trunc },
    prompt: { type: String, required: true, trim: true, maxlength: 2500 },
    starterCode: { type: String, default: "function solve() {\n  return null;\n}", maxlength: 12000 },
    tests: [LabTestCaseSchema],
  },
  { _id: false }
);

const LabSubmissionSchema = new mongoose.Schema(
  {
    candidateEmail: { type: String, required: true, lowercase: true, trim: true },
    score: { type: Number, min: 0, default: 0 },
    maxScore: { type: Number, min: 0, default: 0 },
    passedTests: { type: Number, min: 0, default: 0 },
    totalTests: { type: Number, min: 0, default: 0 },
    runtimeMs: { type: Number, min: 0, default: 0 },
    attempts: { type: Number, min: 1, default: 1 },
    status: { type: String, enum: ["Submitted"], default: "Submitted" },
    submittedAt: { type: Date, default: Date.now },
    solutions: { type: mongoose.Schema.Types.Mixed, default: [] },
    problemResults: { type: mongoose.Schema.Types.Mixed, default: [] },
  },
  { _id: false }
);

const LabAssessmentSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true, maxlength: 140 },
    description: { type: String, trim: true, maxlength: 1200 },
    createdBy: { type: String, required: true, lowercase: true, trim: true },
    candidates: [{ type: String, lowercase: true, trim: true }],
    coreSkills: [{ type: String, trim: true, maxlength: 80 }],
    deadlineAt: { type: Date, required: true },
    durationMinutes: { type: Number, min: 1, max: 120, default: 45, set: Math.trunc },
    problems: [LabProblemSchema],
    submissions: [LabSubmissionSchema],
  },
  { timestamps: true }
);

export default mongoose.models.LabAssessment || mongoose.model("LabAssessment", LabAssessmentSchema);
