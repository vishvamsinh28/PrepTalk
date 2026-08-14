/**
 * @file Ownership and access checks for interview sessions. Two tiers: an
 * *owner* is the interviewer who created it, an *accessor* is the owner or any
 * assigned interviewee. Route handlers should load sessions through the finders
 * here rather than calling `Session.findById` and checking permissions inline.
 */

import mongoose from "mongoose";
import Session from "@/models/Session";

/**
 * Checks whether a value is a well-formed Mongo ObjectId.
 * Guards `findById`, which throws a CastError on malformed input instead of
 * returning null — so callers can answer 404 rather than 500.
 *
 * @param {unknown} id - Candidate id, usually a URL path segment.
 * @returns {boolean} `true` when it parses as an ObjectId.
 */
export function isValidObjectId(id) {
  return mongoose.Types.ObjectId.isValid(String(id || ""));
}

/**
 * True when the user created the session or is an assigned interviewee.
 * Compares lowercased emails because `createdBy` and `interviewees` are stored
 * normalized, while the token's email comes straight from the JWT.
 *
 * @param {object|null} session - Session document, or null when not found.
 * @param {{ email?: string }|null} user - Token payload; a user without an
 *   email is denied.
 * @returns {boolean} `true` when the user may read this session.
 */
export function userCanAccessSession(session, user) {
  if (!session || !user?.email) return false;
  const email = String(user.email).toLowerCase();
  if (session.createdBy === email) return true;
  if (session.interviewees?.includes(email)) return true;
  return false;
}

/**
 * True only for the session's creator.
 * Use for mutations — editing, deleting, generating questions — where an
 * assigned interviewee must not qualify.
 *
 * @param {object|null} session - Session document, or null when not found.
 * @param {{ email?: string }|null} user - Token payload.
 * @returns {boolean} `true` only when the user created this session.
 */
export function userOwnsSession(session, user) {
  return Boolean(session && user?.email && session.createdBy === String(user.email).toLowerCase());
}

/**
 * Loads a session the user is allowed to read.
 * Collapses "bad id", "not found", and "not permitted" into one `null` so
 * handlers answer 404 for all three and never confirm a session exists to
 * someone with no access.
 *
 * @param {string} sessionId - Session id from the route params.
 * @param {{ email?: string }|null} user - Token payload.
 * @returns {Promise<object|null>} Session document, or `null`.
 * @throws {Error} Propagates mongoose errors when the query itself fails.
 */
export async function findSessionForUser(sessionId, user) {
  if (!isValidObjectId(sessionId)) return null;

  const session = await Session.findById(sessionId);
  if (!userCanAccessSession(session, user)) return null;

  return session;
}

/**
 * Loads a session the user owns, for mutating routes.
 * Same null-collapsing as `findSessionForUser`, but an interviewee with read
 * access gets `null` here.
 *
 * @param {string} sessionId - Session id from the route params.
 * @param {{ email?: string }|null} user - Token payload.
 * @returns {Promise<object|null>} Session document, or `null`.
 * @throws {Error} Propagates mongoose errors when the query itself fails.
 */
export async function findOwnedSession(sessionId, user) {
  if (!isValidObjectId(sessionId)) return null;

  const session = await Session.findById(sessionId);
  if (!userOwnsSession(session, user)) return null;

  return session;
}
