/**
 * @file Mongoose model: one persisted chat message.
 * `sender` is an email string rather than a User reference, so a message keeps
 * its attribution even if the account is later removed.
 * Messages are deleted in bulk when their session is deleted; there is no
 * cascade, the session route does it explicitly.
 */
import mongoose from "mongoose";

const MessageSchema = new mongoose.Schema({
  sessionId: { type: mongoose.Schema.Types.ObjectId, ref: "Session", required: true },
  sender: { type: String, required: true },
  message: { type: String, required: true, trim: true, maxlength: 2000 },
}, { timestamps: true });

export default mongoose.models.Message || mongoose.model("Message", MessageSchema);
