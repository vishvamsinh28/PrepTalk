"use client";

/** @file Post-create invite kit: join link, a prefilled mailto, and copy actions. */

import { useState } from "react";

/**
 * Builds the invite link and email draft for a session.
 * Returns empty strings during SSR, since the join URL is derived from
 * `window.location.origin` — that keeps the app deployable at any host without
 * a configured base URL, at the cost of the values being client-only.
 * The mailto pre-addresses every assigned interviewee; body and subject are
 * percent-encoded, so newlines survive into the mail client.
 * @param {object|null} session - Session document, or null before one is created.
 * @returns {{inviteUrl: string, emailBody: string, mailtoHref: string}} Invite parts.
 */
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
 * Shown after creating a session: invite link, mailto draft, and copy actions.
 * The link is not a secret — access is checked server-side against the assigned
 * interviewees, so forwarding it doesn't grant entry. The copy warns anyway,
 * since sending it to the wrong person is still a wasted invite.
 * @param {object} props - Component props.
 * @param {object} props.session - The freshly created session.
 * @returns {JSX.Element} The invite panel.
 */
export default function InvitePackage({ session }) {
  const [copied, setCopied] = useState("");
  const inviteDetails = buildInviteDetails(session);

  /**
   * Copies text and flags which item was copied.
   * The flag is never cleared, so the confirmation persists until the panel
   * unmounts — deliberate, since it doubles as a record of what you already sent.
   * @param {string} label - Which item was copied, shown in the confirmation.
   * @param {string} text - Text to write to the clipboard.
   * @returns {Promise<void>} Resolves once written; no-ops on empty text.
   * @throws {Error} Propagates a clipboard rejection, which browsers raise when
   *   the document isn't focused or the page isn't on a secure origin.
   */
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
