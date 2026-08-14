/**
 * @file Shape and serialization for the create-session form, kept out of the
 * component so the defaults and the form-to-payload mapping stand alone.
 */

/**
 * Initial values for the create-session form, also used to reset it.
 * `skills` and `interviewees` are comma-separated strings because each binds to
 * one text input; `buildSessionPayload` turns them into arrays at submit.
 * Shared module-level object — copy it (`{ ...emptySessionForm }`), never assign
 * into it, or you corrupt the defaults for every later mount.
 *
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
 * aren't validated here on purpose — the server re-normalizes through
 * `@/lib/validation`, and duplicating those rules would mean two to maintain.
 *
 * Pure: reads `formData` without mutating it.
 *
 * @param {typeof emptySessionForm} formData - Current form state; every key is
 *   assumed present, since state is seeded from `emptySessionForm`.
 * @returns {{ title: string, description: string, role: string, level: string,
 *   interviewType: string, skills: string[], interviewees: string[],
 *   scheduledAt: string, durationMinutes: number, agenda: string }} Request body.
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
