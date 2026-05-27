import mongoose from "mongoose";
import Session from "@/models/Session";

export function isValidObjectId(id) {
  return mongoose.Types.ObjectId.isValid(String(id || ""));
}

export function userCanAccessSession(session, user, inviteCode = "") {
  if (!session || !user?.email) return false;
  if (session.createdBy === user.email) return true;
  if (session.interviewees?.includes(user.email)) return true;
  return Boolean(inviteCode && session.inviteCode && inviteCode === session.inviteCode);
}

export function userOwnsSession(session, user) {
  return Boolean(session && user?.email && session.createdBy === user.email);
}

export async function findSessionForUser(sessionId, user, inviteCode = "") {
  if (!isValidObjectId(sessionId)) return null;

  const session = await Session.findById(sessionId);
  if (!userCanAccessSession(session, user, inviteCode)) return null;

  return session;
}

export async function findOwnedSession(sessionId, user) {
  if (!isValidObjectId(sessionId)) return null;

  const session = await Session.findById(sessionId);
  if (!userOwnsSession(session, user)) return null;

  return session;
}
