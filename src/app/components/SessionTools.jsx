"use client";

import { useEffect, useMemo, useState } from "react";
import { postJson } from "@/lib/clientApi";
import { FaCalendarAlt, FaEnvelope, FaLink, FaMagic, FaQuestionCircle } from "react-icons/fa";

export default function SessionTools({ sessionId, session, userRole }) {
  const [questions, setQuestions] = useState(session.questionBank || []);
  const [prepGuide, setPrepGuide] = useState(session.prepGuide || "");
  const [loading, setLoading] = useState("");
  const [origin, setOrigin] = useState("");

  useEffect(() => {
    setOrigin(window.location.origin);
  }, []);

  const inviteUrl = useMemo(() => {
    if (!session.inviteCode || !origin) return "";
    return `${origin}/session/${sessionId}?invite=${session.inviteCode}`;
  }, [origin, session.inviteCode, sessionId]);

  const generateQuestions = async () => {
    setLoading("questions");
    try {
      const data = await postJson(`/api/session/${sessionId}/questions`, {});
      setQuestions(data.questions || []);
      setPrepGuide(data.prepGuide || "");
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
  };

  const mailtoHref = `mailto:${(session.interviewees || []).join(",")}?subject=${encodeURIComponent(`PrepTalk interview: ${session.title}`)}&body=${encodeURIComponent(`Hi,\n\nYou are invited to a PrepTalk interview session.\n\nSession: ${session.title}\nRole: ${session.role}\n${session.scheduledAt ? `Time: ${new Date(session.scheduledAt).toLocaleString()}\n` : ""}${inviteUrl ? `Join link: ${inviteUrl}\n` : ""}\n\nSee you there.`)}`;
  const isInterviewer = userRole === "Interviewer";

  return (
    <section className="grid gap-6 lg:grid-cols-[0.85fr_1.15fr]">
      <div className="glass-panel rounded-2xl p-5">
        <p className="mb-2 text-sm font-bold uppercase tracking-[0.18em] text-cyan-200">Agenda</p>
        <h2 className="mb-4 text-2xl font-black text-white">Session flow</h2>
        <div className="space-y-3">
          {(session.agenda || []).length > 0 ? session.agenda.map((item, index) => (
            <div key={`${item.title}-${index}`} className="flex items-center justify-between gap-4 rounded-2xl border border-white/10 bg-slate-950/35 p-3">
              <span className="font-bold text-white">{item.title}</span>
              <span className="rounded-lg bg-cyan-300/10 px-3 py-1 text-xs font-bold text-cyan-100">{item.minutes} min</span>
            </div>
          )) : (
            <p className="text-sm text-slate-300">No agenda added yet.</p>
          )}
        </div>

        <div className="mt-5 rounded-2xl border border-white/10 bg-white/10 p-4">
          <p className="mb-2 flex items-center gap-2 font-bold text-white">
            <FaCalendarAlt />
            Schedule
          </p>
          <p className="text-sm text-slate-300">
            {session.scheduledAt ? new Date(session.scheduledAt).toLocaleString() : "No time scheduled"}
            {session.durationMinutes ? ` · ${session.durationMinutes} min` : ""}
          </p>
        </div>

        {isInterviewer && inviteUrl && (
          <div className="mt-5 space-y-3">
            <button onClick={copyInvite} className="flex w-full items-center justify-center gap-2 rounded-xl border border-cyan-300/25 bg-cyan-300/10 px-4 py-3 font-bold text-cyan-100">
              <FaLink />
              Copy public join link
            </button>
            <a href={mailtoHref} className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-cyan-300 via-emerald-300 to-blue-400 px-4 py-3 font-black text-slate-950">
              <FaEnvelope />
              Draft email invite
            </a>
          </div>
        )}
      </div>

      <div className="glass-panel rounded-2xl p-5">
        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.18em] text-amber-200">AI assistant</p>
            <h2 className="mt-1 text-2xl font-black text-white">Question bank</h2>
          </div>
          {isInterviewer && (
            <div className="flex flex-wrap gap-2">
              <button onClick={generateQuestions} disabled={!!loading} className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-cyan-300 via-emerald-300 to-blue-400 px-4 py-3 text-sm font-black text-slate-950 disabled:opacity-70">
                <FaMagic />
                {loading === "questions" ? "Generating..." : "Generate questions"}
              </button>
              <button onClick={generatePrep} disabled={!!loading} className="inline-flex items-center gap-2 rounded-xl border border-white/15 bg-white/10 px-4 py-3 text-sm font-bold text-white disabled:opacity-70">
                <FaQuestionCircle />
                {loading === "prep" ? "Generating..." : "Prep guide"}
              </button>
            </div>
          )}
        </div>

        <div className="max-h-[42rem] overflow-y-auto pr-1">
          {prepGuide && (
            <div className="mb-5 rounded-2xl border border-cyan-300/20 bg-cyan-300/10 p-4">
              <p className="mb-2 font-black text-cyan-100">Interviewee prep</p>
              <p className="whitespace-pre-wrap text-sm leading-6 text-slate-200">{prepGuide}</p>
            </div>
          )}

          {isInterviewer ? (
            <div className="grid gap-3">
              {questions.length > 0 ? questions.map((item, index) => (
              <article key={`${item.question}-${index}`} className="rounded-2xl border border-white/10 bg-slate-950/35 p-4">
                <div className="mb-2 flex flex-wrap gap-2">
                  <span className="rounded-lg bg-amber-300/10 px-3 py-1 text-xs font-bold text-amber-100">{item.category}</span>
                  {item.skill && <span className="rounded-lg bg-cyan-300/10 px-3 py-1 text-xs font-bold text-cyan-100">{item.skill}</span>}
                </div>
                <p className="font-bold text-white">{item.question}</p>
                {item.followUps?.length > 0 && (
                  <ul className="mt-3 space-y-1 text-sm text-slate-300">
                    {item.followUps.map((followUp) => <li key={followUp}>- {followUp}</li>)}
                  </ul>
                )}
              </article>
            )) : (
              <p className="rounded-2xl border border-white/10 bg-slate-950/35 p-4 text-sm text-slate-300">
                Generate an AI question bank for this role, level, and skill set.
              </p>
              )}
            </div>
          ) : (
            <p className="rounded-2xl border border-white/10 bg-slate-950/35 p-4 text-sm text-slate-300">
              Your interviewer controls the question bank. Use this area to review the prep guide and agenda before the call.
            </p>
          )}
        </div>
      </div>
    </section>
  );
}
