import { FaExclamationTriangle } from "react-icons/fa";

/**
 * Full-screen notice for auth failures (invalid token, wrong role)
 * with a link back to login.
 * @param {{ title: string, message: string }} props
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
