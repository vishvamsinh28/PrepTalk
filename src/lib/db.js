/**
 * @file Mongoose connection bootstrap. Every DB-touching route handler calls
 * `connectDB()` first; repeat calls are a no-op.
 */

import mongoose from "mongoose";

/**
 * Ensures mongoose is connected to `MONGODB_URI`, reusing an open connection.
 * The guard matters in dev (hot-reload would leak a connection per edit) and in
 * serverless (a warm container should reuse its pool, not re-handshake).
 *
 * @returns {Promise<void>} Resolves once a usable connection exists.
 * @throws {Error} When `MONGODB_URI` is unset, or the connect fails (bad creds,
 *   unreachable host, IP not allowlisted). Logged, then re-thrown.
 */
export async function connectDB() {
  // readyState: 0 disconnected, 1 connected, 2 connecting, 3 disconnecting.
  // Any non-zero value means a connection exists or is in flight.
  if (mongoose.connections[0].readyState) return;

  if (!process.env.MONGODB_URI) {
    throw new Error("MONGODB_URI is not configured.");
  }

  try {
    await mongoose.connect(process.env.MONGODB_URI);
  } catch (err) {
    // Only place the real cause is recorded — callers turn this into a 500.
    console.error("MongoDB connection error:", err);
    throw err;
  }
}
