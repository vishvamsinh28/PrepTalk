/**
 * Mongoose model: one persisted chat message in a session.
 */
import mongoose from "mongoose";

const MessageSchema = new mongoose.Schema({
  sessionId: { type: mongoose.Schema.Types.ObjectId, ref: "Session", required: true },
  sender: { type: String, required: true },
  message: { type: String, required: true, trim: true, maxlength: 2000 },
}, { timestamps: true });

export default mongoose.models.Message || mongoose.model("Message", MessageSchema);
