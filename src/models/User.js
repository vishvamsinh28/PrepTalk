import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema({
  username: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['Moderator', 'Participant', 'Evaluator'], default: 'Participant' },
}, { timestamps: true });

export default mongoose.models.User || mongoose.model('User', UserSchema);
