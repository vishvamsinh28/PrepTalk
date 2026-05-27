import { FaExclamationTriangle } from "react-icons/fa";

export default function AuthState({ title, message }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900 text-gray-100 relative px-4">
      <div className="absolute inset-0 bg-[url('/images/pattern.svg')] bg-repeat opacity-5"></div>
      <div className="bg-red-500/10 border border-red-500/50 text-red-400 p-6 rounded-lg text-center max-w-md">
        <FaExclamationTriangle className="text-4xl mb-3 mx-auto" />
        <p className="text-lg font-medium">{title}</p>
        <p className="text-sm text-gray-400">{message}</p>
      </div>
    </div>
  );
}
