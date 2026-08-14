/**
 * @file Finds which invited emails have no Interviewee account, backing the
 * pre-invite warning. Invites to unregistered addresses are still allowed — the
 * warning just catches typos before the candidate silently never shows up.
 */

import User from "@/models/User";

/**
 * Returns the subset of emails with no registered Interviewee account.
 * Lowercases and dedupes first, since addresses come from a free-text field.
 * An email owned by an *Interviewer* counts as missing — that's intentional,
 * an interviewer can't be a candidate, so flag it at the point of the mistake.
 *
 * @param {string[]|null|undefined} emails - Candidate emails, any casing, may
 *   contain duplicates or blanks. Nullish is treated as empty.
 * @returns {Promise<string[]>} Lowercased, deduped emails with no Interviewee
 *   account; empty when all are registered.
 * @throws {Error} Propagates mongoose errors (dropped connection, timeout).
 *   Treat a throw as "couldn't check" and let the invite proceed.
 */
export async function findMissingIntervieweeEmails(emails) {
  const uniqueEmails = [...new Set((emails || []).map((email) => String(email).toLowerCase().trim()).filter(Boolean))];

  // Guard clause: skip the round-trip entirely when there's nothing to check.
  if (uniqueEmails.length === 0) return [];

  const users = await User.find({
    email: { $in: uniqueEmails },
    role: "Interviewee",
  }).select("email");
  const existing = new Set(users.map((user) => user.email));

  return uniqueEmails.filter((email) => !existing.has(email));
}
