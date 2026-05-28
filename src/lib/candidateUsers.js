import User from "@/models/User";

export async function findMissingIntervieweeEmails(emails) {
  const uniqueEmails = [...new Set((emails || []).map((email) => String(email).toLowerCase().trim()).filter(Boolean))];
  if (uniqueEmails.length === 0) return [];

  const users = await User.find({
    email: { $in: uniqueEmails },
    role: "Interviewee",
  }).select("email");
  const existing = new Set(users.map((user) => user.email));

  return uniqueEmails.filter((email) => !existing.has(email));
}
