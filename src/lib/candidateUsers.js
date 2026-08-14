/** @file Finds invited emails with no Interviewee account, backing the pre-invite warning. Invites to unregistered addresses are still allowed. */

import User from "@/models/User";

/**
 * Returns the subset of emails with no registered Interviewee account.
 * Lowercases and dedupes first, since addresses come from a free-text field.
 * An email owned by an *Interviewer* counts as missing — intentional, since an
 * interviewer can't be a candidate.
 * @param {string[]|null|undefined} emails - Any casing; may contain duplicates or blanks.
 * @returns {Promise<string[]>} Lowercased, deduped emails with no Interviewee account.
 * @throws {Error} Propagates mongoose errors; treat a throw as "couldn't check".
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
