"use client";

import { useEffect, useMemo, useState } from "react";
import { deleteJson, postJson } from "@/lib/clientApi";
import { FaCalendarAlt, FaEnvelope, FaEraser, FaLink, FaMagic, FaQuestionCircle } from "react-icons/fa";

function normalizeQuestionList(value) {
  if (!Array.isArray(value)) return [];

  return value
    .map((item) => {
      if (typeof item === "string") {
        return { category: "General", skill: "", question: item, followUps: [] };
      }

      return {
        category: String(item?.category || "General").trim(),
        skill: String(item?.skill || "").trim(),
        question: String(item?.question || "").trim(),
        followUps: Array.isArray(item?.followUps)
          ? item.followUps.map((followUp) => String(followUp).trim()).filter(Boolean)
          : String(item?.followUps || "")
              .split(/\n|;/)
              .map((followUp) => followUp.trim())
              .filter(Boolean),
      };
    })
    .filter((item) => item.question);
}

export default function SessionTools({ sessionId, session, userRole }) {
  const [questions, setQuestions] = useState(normalizeQuestionList(session.questionBank));
  const [prepGuide, setPrepGuide] = useState(session.prepGuide || "");
  const [loading, setLoading] = useState("");
  const [origin, setOrigin] = useState("");
  const [copiedInvite, setCopiedInvite] = useState(false);

  useEffect(() => {
    setOrigin(window.location.origin);
  }, []);

  const inviteUrl = useMemo(() => {
    if (!origin) return "";
    return `${origin}/session/${sessionId}`;
  }, [origin, sessionId]);

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

  const clearQuestions = async () => {
    setLoading("clear-questions");
    try {
      await deleteJson(`/api/session/${sessionId}/questions`);
      setQuestions([]);
    } finally {
      setLoading("");
    }
  };

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
    <section className="grid gap-6 lg:grid-cols-[0.85fr_1.15fr]">
      <div className="panel rounded-[4px] p-5">
        <p className="mb-2 app-eyebrow">Agenda</p>
        <h2 className="mb-4 text-2xl font-semibold text-ink">Session flow</h2>
        <div className="space-y-3">
          {(session.agenda || []).length > 0 ? session.agenda.map((item, index) => (
            <div key={`${item.title}-${index}`} className="flex items-center justify-between gap-4 rounded-[4px] border border-rule bg-white p-3">
              <span className="font-bold text-ink">{item.title}</span>
              <span className="rounded-[4px] bg-accent/10 px-3 py-1 text-xs font-bold text-accent">{item.minutes} min</span>
            </div>
          )) : (
            <p className="text-sm text-ink-soft">No agenda added yet.</p>
          )}
        </div>

        <div className="mt-5 rounded-[4px] border border-rule bg-black/5 p-4">
          <p className="mb-2 flex items-center gap-2 font-bold text-ink">
            <FaCalendarAlt />
            Schedule
          </p>
          <p className="text-sm text-ink-soft">
            {session.scheduledAt ? new Date(session.scheduledAt).toLocaleString() : "No time scheduled"}
            {session.durationMinutes ? ` · ${session.durationMinutes} min` : ""}
          </p>
        </div>

        {isInterviewer && inviteUrl && (
          <div className="mt-5 space-y-3">
            <button onClick={copyInvite} className="flex w-full items-center justify-center gap-2 rounded-[4px] border border-accent bg-accent/10 px-4 py-3 font-bold text-accent">
              <FaLink />
              {copiedInvite ? "Link copied" : "Copy assigned-user link"}
            </button>
            <a href={mailtoHref} className="flex w-full items-center justify-center gap-2 rounded-[4px] bg-ink px-4 py-3 font-semibold text-canvas">
              <FaEnvelope />
              Draft email invite
            </a>
          </div>
        )}
      </div>

      <div className="panel rounded-[4px] p-5">
        <div className="mb-4 grid gap-4 xl:grid-cols-[minmax(0,1fr)_auto] xl:items-start">
          <div>
            <p className="app-eyebrow">AI assistant</p>
            <h2 className="mt-1 text-2xl font-semibold text-ink">Question bank</h2>
          </div>
          {isInterviewer && (
            <div className="grid gap-2 sm:grid-cols-2 xl:w-[28rem]">
              <button onClick={generateQuestions} disabled={!!loading} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-[4px] bg-ink px-4 py-3 text-sm font-semibold text-canvas disabled:opacity-70">
                <FaMagic />
                {loading === "questions" ? "Generating..." : "Generate questions"}
              </button>
              <button onClick={generatePrep} disabled={!!loading} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-[4px] border border-rule bg-black/5 px-4 py-3 text-sm font-bold text-ink disabled:opacity-70">
                <FaQuestionCircle />
                {loading === "prep" ? "Generating..." : "Prep guide"}
              </button>
              <button onClick={clearQuestions} disabled={!!loading || questions.length === 0} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-[4px] border border-rose-600/40 bg-rose-50 px-4 py-3 text-sm font-bold text-rose-700 disabled:opacity-50">
                <FaEraser />
                {loading === "clear-questions" ? "Clearing..." : "Clear questions"}
              </button>
              <button onClick={clearPrep} disabled={!!loading || !prepGuide} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-[4px] border border-rule bg-black/5 px-4 py-3 text-sm font-bold text-ink disabled:opacity-50">
                <FaEraser />
                {loading === "clear-prep" ? "Clearing..." : "Clear prep"}
              </button>
            </div>
          )}
        </div>

        <div className="max-h-168 overflow-y-auto pr-1">
          {prepGuide && (
            <div className="mb-5 rounded-[4px] border border-accent bg-accent/10 p-4">
              <p className="mb-2 font-semibold text-accent">Interviewee prep</p>
              <p className="whitespace-pre-wrap text-sm leading-6 text-ink">{prepGuide}</p>
            </div>
          )}

          {isInterviewer ? (
            <div className="grid gap-3">
              {questions.length > 0 ? questions.map((item, index) => (
                <article key={`${item.question}-${index}`} className="rounded-[4px] border border-rule bg-white p-4">
                  <div className="mb-3 flex items-start gap-3">
                    <span className="grid h-8 w-8 shrink-0 place-items-center rounded-[4px] bg-accent/10 text-sm font-semibold text-accent">
                      {index + 1}
                    </span>
                    <div className="min-w-0">
                      <div className="mb-2 flex flex-wrap gap-2">
                        <span className="rounded-[4px] bg-amber-50 px-3 py-1 text-xs font-bold text-amber-700">{item.category || "General"}</span>
                        {item.skill && <span className="rounded-[4px] bg-accent/10 px-3 py-1 text-xs font-bold text-accent">{item.skill}</span>}
                      </div>
                      <p className="break-words font-bold leading-6 text-ink">{item.question}</p>
                    </div>
                  </div>
                  {item.followUps?.length > 0 && (
                    <ul className="ml-11 space-y-1 text-sm leading-6 text-ink-soft">
                      {item.followUps.map((followUp) => <li key={followUp}>- {followUp}</li>)}
                    </ul>
                  )}
                </article>
              )) : (
              <p className="rounded-[4px] border border-rule bg-white p-4 text-sm text-ink-soft">
                Generate an AI question bank for this role, level, and skill set.
              </p>
              )}
            </div>
          ) : (
            <p className="rounded-[4px] border border-rule bg-white p-4 text-sm text-ink-soft">
              Your interviewer controls the question bank. Use this area to review the prep guide and agenda before the call.
            </p>
          )}
        </div>
      </div>
    </section>
  );
}
