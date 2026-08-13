import { FaExclamationTriangle } from "react-icons/fa";

export default function AuthState({ title, message }) {
  return (
    <div className="app-shell relative flex min-h-screen items-center justify-center overflow-hidden px-5">
      <div className="soft-grid absolute inset-0 opacity-60"></div>
      <div className="glass-panel relative z-10 max-w-md rounded-2xl p-8 text-center">
        <FaExclamationTriangle className="mx-auto mb-4 text-4xl text-amber-700" />
        <p className="text-xl font-semibold text-ink">{title}</p>
        <p className="mt-2 text-sm text-ink-soft">{message}</p>
      </div>
    </div>
  );
}
