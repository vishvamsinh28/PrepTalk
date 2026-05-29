import mongoose from "mongoose";

export async function connectDB() {
  if (mongoose.connections[0].readyState) return;

  if (!process.env.MONGODB_URI) {
    throw new Error("MONGODB_URI is not configured.");
  }

  try {
    await mongoose.connect(process.env.MONGODB_URI);
  } catch (err) {
    console.error("MongoDB connection error:", err);
    throw err;
  }
}
