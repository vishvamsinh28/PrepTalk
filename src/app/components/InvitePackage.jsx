"use client";

import { useState } from "react";

function buildInviteDetails(session) {
  if (!session || typeof window === "undefined") {
    return { inviteUrl: "", emailBody: "", mailtoHref: "" };
  }

  const inviteUrl = `${window.location.origin}/session/${session._id}`;
  const interviewees = session.interviewees || [];
  const scheduledText = session.scheduledAt
    ? `Time: ${new Date(session.scheduledAt).toLocaleString()}\n`
    : "";
  const emailBody = `Hi,\n\nYou are invited to a PrepTalk interview session.\n\nSession: ${session.title}\nRole: ${session.role || "General"}\nLevel: ${session.level || "Entry"}\nType: ${session.interviewType || "Mixed"}\n${scheduledText}Join link: ${inviteUrl}\n\nPlease use the link above to join the session.\n\nThanks.`;

  return {
    inviteUrl,
    emailBody,
    mailtoHref: `mailto:${interviewees.join(",")}?subject=${encodeURIComponent(`PrepTalk interview: ${session.title}`)}&body=${encodeURIComponent(emailBody)}`,
  };
}

/**
 * Post-create invite kit: invite link, mailto draft, copy actions,
 * and an email preview.
 * @param {{ session: object }} props
 */
export default function InvitePackage({ session }) {
  const [copied, setCopied] = useState("");
  const inviteDetails = buildInviteDetails(session);

  const copyText = async (label, text) => {
    if (!text) return;
    await navigator.clipboard?.writeText(text);
    setCopied(label);
  };

  return (
      <div className="mb-8 border-l-2 border-emerald-700 bg-emerald-50/60 px-5 py-5">
        <div className="flex flex-wrap items-baseline justify-between gap-3">
          <p className="app-h3">Session ready</p>
          {copied && <span className="app-eyebrow">Copied {copied}</span>}
        </div>
        <p className="mt-2 max-w-[58ch] text-sm leading-[1.7] text-ink-soft">
          Send this link only to assigned interviewees — anyone else is blocked from
          opening the room.
        </p>

        <div className="mt-4 flex flex-wrap items-center gap-3">
          <input
            readOnly
            value={inviteDetails.inviteUrl}
            className="field-surface min-w-0 flex-1 rounded-[4px] px-3 py-2.5 text-sm"
          />
          <a href={inviteDetails.mailtoHref} className="btn-ink shrink-0">
            Send email
          </a>
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2 text-[13px]">
          <button
            type="button"
            onClick={() => copyText("link", inviteDetails.inviteUrl)}
            className="text-ink-soft underline decoration-rule decoration-1 underline-offset-4 transition-colors hover:text-ink hover:decoration-ink"
          >
            Copy link
          </button>
          <button
            type="button"
            onClick={() => copyText("email", inviteDetails.emailBody)}
            className="text-ink-soft underline decoration-rule decoration-1 underline-offset-4 transition-colors hover:text-ink hover:decoration-ink"
          >
            Copy email text
          </button>
        </div>

        <details className="mt-4">
          <summary className="app-eyebrow cursor-pointer">Preview email</summary>
          <textarea
            readOnly
            value={inviteDetails.emailBody}
            className="field-surface mt-3 min-h-44 w-full rounded-[4px] p-3 text-sm leading-6"
          />
        </details>
      </div>
  );
}
