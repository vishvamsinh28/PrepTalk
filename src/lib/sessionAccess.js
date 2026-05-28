import mongoose from "mongoose";
import Session from "@/models/Session";

export function isValidObjectId(id) {
  return mongoose.Types.ObjectId.isValid(String(id || ""));
}

export function userCanAccessSession(session, user) {
  if (!session || !user?.email) return false;
  const email = String(user.email).toLowerCase();
  if (session.createdBy === email) return true;
  if (session.interviewees?.includes(email)) return true;
  return false;
}

export function userOwnsSession(session, user) {
  return Boolean(session && user?.email && session.createdBy === String(user.email).toLowerCase());
}

export async function findSessionForUser(sessionId, user) {
  if (!isValidObjectId(sessionId)) return null;

  const session = await Session.findById(sessionId);
  if (!userCanAccessSession(session, user)) return null;

  return session;
}

export async function findOwnedSession(sessionId, user) {
  if (!isValidObjectId(sessionId)) return null;

  const session = await Session.findById(sessionId);
  if (!userOwnsSession(session, user)) return null;

  return session;
}
