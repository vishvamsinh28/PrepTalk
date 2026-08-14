"use client";

import { useEffect, useMemo, useState } from "react";
import { deleteJson, postJson } from "@/lib/clientApi";
/** @file In-room session tools: agenda, AI question bank, and prep guide. */

import { normalizeQuestionList } from "@/lib/questionBank";

/**
 * Session agenda plus the AI question bank and prep guide.
 * Seeded from the server-rendered `session` prop rather than fetched, so the
 * panel paints with content already present. State is then local, and generate
 * or clear updates it from the response instead of refetching.
 * Generate and clear controls render for interviewers only; the API enforces
 * the same rule, so hiding them is UX rather than security.
 *
 * KNOWN GAP: the async handlers below use `try/finally` with no `catch`, so a
 * failed generation just stops the spinner and leaves the panel unchanged with
 * no explanation. They should surface the error the way `CreateSessionForm` does.
 *
 * @param {object} props - Component props.
 * @param {string} props.sessionId - Session being viewed.
 * @param {object} props.session - Serialized session, supplying the initial bank and guide.
 * @param {string} props.userRole - Gates the generate/clear controls.
 * @returns {JSX.Element} The tools panel.
 */
export default function SessionTools({ sessionId, session, userRole }) {
  const [questions, setQuestions] = useState(normalizeQuestionList(session.questionBank));
  const [prepGuide, setPrepGuide] = useState(session.prepGuide || "");
  const [loading, setLoading] = useState("");
  const [origin, setOrigin] = useState("");
  const [copiedInvite, setCopiedInvite] = useState(false);

  // Read after mount: `window.location` doesn't exist during SSR, and using it
  // inline would cause a hydration mismatch.
  useEffect(() => {
    setOrigin(window.location.origin);
  }, []);

  /** Join link for this session; empty until `origin` resolves on the client. */
  const inviteUrl = useMemo(() => {
    if (!origin) return "";
    return `${origin}/session/${sessionId}`;
  }, [origin, sessionId]);

  /**
   * Regenerates the question bank, replacing whatever is there.
   * Also refreshes the prep guide, since the endpoint returns both.
   * @returns {Promise<void>} A rejection propagates unhandled — see the gap noted above.
   */
  const generateQuestions = async () => {
    setLoading("questions");
    try {
      const data = await postJson(`/api/session/${sessionId}/questions`, {});
      setQuestions(normalizeQuestionList(data.questions));
      setPrepGuide(data.prepGuide || "");
    } finally {
      setLoading("");
    }
  };

  /**
   * Clears the question bank, leaving the prep guide alone.
   * @returns {Promise<void>} A rejection propagates unhandled — see the gap noted above.
   */
  const clearQuestions = async () => {
    setLoading("clear-questions");
    try {
      await deleteJson(`/api/session/${sessionId}/questions`);
      setQuestions([]);
    } finally {
      setLoading("");
    }
  };

  /**
   * Clears the prep guide, leaving the question bank alone.
   * @returns {Promise<void>} A rejection propagates unhandled — see the gap noted above.
   */
  const clearPrep = async () => {
    setLoading("clear-prep");
    try {
      await deleteJson(`/api/session/${sessionId}/prep`);
      setPrepGuide("");
    } finally {
      setLoading("");
    }
  };

  const generatePrep = async () => {
    setLoading("prep");
    try {
      const data = await postJson(`/api/session/${sessionId}/prep`, {});
      setPrepGuide(data.prepGuide || "");
    } finally {
      setLoading("");
    }
  };

  const copyInvite = async () => {
    if (!inviteUrl) return;
    await navigator.clipboard?.writeText(inviteUrl);
    setCopiedInvite(true);
    window.setTimeout(() => setCopiedInvite(false), 1800);
  };

  const mailtoHref = `mailto:${(session.interviewees || []).join(",")}?subject=${encodeURIComponent(`PrepTalk interview: ${session.title}`)}&body=${encodeURIComponent(`Hi,\n\nYou are invited to a PrepTalk interview session.\n\nSession: ${session.title}\nRole: ${session.role}\n${session.scheduledAt ? `Time: ${new Date(session.scheduledAt).toLocaleString()}\n` : ""}${inviteUrl ? `Join link: ${inviteUrl}\n` : ""}\n\nSee you there.`)}`;
  const isInterviewer = userRole === "Interviewer";

  return (
    <section className="grid gap-x-16 gap-y-14 lg:grid-cols-[0.8fr_1.2fr]">
      <div>
        <div className="border-b border-rule pb-4">
          <p className="app-eyebrow">Agenda</p>
          <h2 className="app-h2 mt-3">Session flow</h2>
        </div>

        {(session.agenda || []).length > 0 ? (
          <ul>
            {session.agenda.map((item, index) => (
              <li
                key={`${item.title}-${index}`}
                className="row-hair flex items-baseline justify-between gap-6 px-1 py-4 first:border-t-0"
              >
                <span className="text-[15px] font-medium text-ink">{item.title}</span>
                <span className="app-eyebrow shrink-0">{item.minutes} min</span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="py-5 text-sm text-ink-soft">No agenda added yet.</p>
        )}

        <dl className="mt-2 border-t border-rule pt-4 text-sm">
          <div className="flex gap-3">
            <dt className="text-ink-soft">Scheduled</dt>
            <dd className="text-ink">
              {session.scheduledAt ? new Date(session.scheduledAt).toLocaleString() : "No time set"}
              {session.durationMinutes ? ` · ${session.durationMinutes} min` : ""}
            </dd>
          </div>
        </dl>

        {isInterviewer && inviteUrl && (
          <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-3">
            <a href={mailtoHref} className="btn-ink">
              Draft email invite
            </a>
            <button
              onClick={copyInvite}
              className="text-sm text-ink-soft underline decoration-rule decoration-1 underline-offset-4 transition-colors hover:text-ink hover:decoration-ink"
            >
              {copiedInvite ? "Link copied" : "Copy assigned-user link"}
            </button>
          </div>
        )}
      </div>

      <div>
        <div className="flex flex-wrap items-end justify-between gap-4 border-b border-rule pb-4">
          <div>
            <p className="app-eyebrow">Question bank</p>
            <h2 className="app-h2 mt-3">Something to ask</h2>
          </div>
          {isInterviewer && (
            <div className="flex items-center gap-3">
              <button
                onClick={generateQuestions}
                disabled={!!loading}
                className="btn-ink px-4 py-2 text-sm"
              >
                {loading === "questions" ? "Generating…" : "Generate questions"}
              </button>
              <button
                onClick={generatePrep}
                disabled={!!loading}
                className="btn-quiet px-4 py-2 text-sm"
              >
                {loading === "prep" ? "Generating…" : "Prep guide"}
              </button>
            </div>
          )}
        </div>

        <div className="max-h-[42rem] overflow-y-auto pr-1">
          {prepGuide && (
            <div className="mt-5 border-l-2 border-accent pl-4">
              <p className="app-eyebrow">Interviewee prep</p>
              <p className="mt-2 whitespace-pre-wrap text-sm leading-[1.7] text-ink-soft">
                {prepGuide}
              </p>
            </div>
          )}

          {isInterviewer ? (
            questions.length > 0 ? (
              <ol className="mt-2">
                {questions.map((item, index) => (
                  <li
                    key={`${item.question}-${index}`}
                    className="row-hair grid grid-cols-[2.5rem_1fr] gap-2 px-1 py-5 first:border-t-0"
                  >
                    <span className="app-eyebrow pt-1 text-accent">
                      {String(index + 1).padStart(2, "0")}
                    </span>
                    <div className="min-w-0">
                      <p className="break-words text-[15px] font-medium leading-[1.55] text-ink">
                        {item.question}
                      </p>
                      <p className="app-eyebrow mt-2">
                        {item.category || "General"}
                        {item.skill ? ` · ${item.skill}` : ""}
                      </p>
                      {item.followUps?.length > 0 && (
                        <ul className="mt-3 space-y-1.5 text-sm leading-[1.6] text-ink-soft">
                          {item.followUps.map((followUp) => (
                            <li key={followUp} className="flex gap-3">
                              <span className="mt-2.5 h-px w-3 shrink-0 bg-rule" />
                              {followUp}
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  </li>
                ))}
              </ol>
            ) : (
              <p className="py-5 text-sm text-ink-soft">
                Generate a question bank for this role, level, and skill set.
              </p>
            )
          ) : (
            <p className="py-5 text-sm text-ink-soft">
              Your interviewer controls the question bank. Review the prep guide and
              agenda here before the call.
            </p>
          )}
        </div>

        {isInterviewer && (questions.length > 0 || prepGuide) && (
          <div className="mt-4 flex gap-5 border-t border-rule pt-4 text-[13px]">
            {questions.length > 0 && (
              <button
                onClick={clearQuestions}
                disabled={!!loading}
                className="text-ink-soft underline decoration-rule decoration-1 underline-offset-4 transition-colors hover:text-accent hover:decoration-accent disabled:opacity-50"
              >
                {loading === "clear-questions" ? "Clearing…" : "Clear questions"}
              </button>
            )}
            {prepGuide && (
              <button
                onClick={clearPrep}
                disabled={!!loading}
                className="text-ink-soft underline decoration-rule decoration-1 underline-offset-4 transition-colors hover:text-accent hover:decoration-accent disabled:opacity-50"
              >
                {loading === "clear-prep" ? "Clearing…" : "Clear prep"}
              </button>
            )}
          </div>
        )}
      </div>
    </section>
  );
}
