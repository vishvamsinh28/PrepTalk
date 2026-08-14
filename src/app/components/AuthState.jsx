/** @file Full-screen notice for auth failures, rendered instead of a protected page. */

import { FaExclamationTriangle } from "react-icons/fa";

/**
 * Full-screen notice shown when a page can't render for auth reasons —
 * an invalid token, or the right login but the wrong role.
 * Takes both strings as props rather than deriving them, so each caller can
 * explain its own case; keep the message vague enough not to confirm what
 * exists to someone who shouldn't see it.
 * Despite the docstring this replaced, it renders no link — the user reaches
 * login through the nav or a redirect.
 * @param {object} props - Component props.
 * @param {string} props.title - Short heading, e.g. "Session unavailable".
 * @param {string} props.message - One or two sentences on what to do next.
 * @returns {JSX.Element} The notice.
 */
export default function AuthState({ title, message }) {
  return (
    <div className="app-shell relative flex min-h-screen items-center justify-center overflow-hidden px-5">
      <div className="soft-grid absolute inset-0 opacity-60"></div>
      <div className="panel relative z-10 max-w-md rounded-[4px] p-8 text-center">
        <FaExclamationTriangle className="mx-auto mb-4 text-4xl text-amber-700" />
        <p className="text-xl font-semibold text-ink">{title}</p>
        <p className="mt-2 text-sm text-ink-soft">{message}</p>
      </div>
    </div>
  );
}
