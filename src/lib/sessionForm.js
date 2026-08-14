/** @file Shape and serialization for the create-session form, kept out of the component. */

/**
 * Initial values for the create-session form, also used to reset it.
 * `skills` and `interviewees` are comma-separated strings because each binds to
 * one text input. Shared module-level object — copy it, never assign into it.
 * @type {{ title: string, description: string, interviewees: string, role: string,
 *   level: string, interviewType: string, skills: string, scheduledAt: string,
 *   durationMinutes: number, agenda: string }}
 */
export const emptySessionForm = {
  title: "",
  description: "",
  interviewees: "",
  role: "",
  level: "Entry",
  interviewType: "Technical",
  skills: "",
  scheduledAt: "",
  durationMinutes: 60,
  agenda: "Warm-up - 5 min\nCore questions - 35 min\nCandidate questions - 10 min\nFeedback - 10 min",
};

/**
 * Converts form state into the body `POST /api/session` expects.
 * Only real transform is splitting the two comma-separated inputs. Emails
 * aren't validated here — the server re-normalizes through `@/lib/validation`.
 * Pure: reads `formData` without mutating it.
 * @param {typeof emptySessionForm} formData - Every key assumed present, seeded from `emptySessionForm`.
 * @returns {object} Request body with `skills` and `interviewees` as arrays.
 */
export function buildSessionPayload(formData) {
  return {
    title: formData.title,
    description: formData.description,
    role: formData.role,
    level: formData.level,
    interviewType: formData.interviewType,
    // filter(Boolean) drops the empty segments left by trailing/double commas.
    skills: formData.skills.split(",").map((skill) => skill.trim()).filter(Boolean),
    interviewees: formData.interviewees.split(",").map((email) => email.trim()).filter(Boolean),
    scheduledAt: formData.scheduledAt,
    durationMinutes: formData.durationMinutes,
    agenda: formData.agenda,
  };
}
