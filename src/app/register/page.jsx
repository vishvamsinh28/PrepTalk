"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { postJson } from "@/lib/clientApi";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import AuthLayout from "../components/AuthLayout";

const roles = [
  ["Interviewee", "Join sessions, take screens"],
  ["Interviewer", "Create rooms, score people"],
];

export default function RegisterPage() {
  const router = useRouter();

  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    role: "Interviewee",
  });

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setIsLoading(true);

    try {
      const response = await postJson("/api/register", formData);
      setSuccess(response.message);
      setTimeout(() => {
        router.push("/login");
      }, 1500);
    } catch (err) {
      setError(err.message || "Registration failed");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthLayout
      headline="Your first mock interview is one link away."
      blurb="Create an account, pick a side of the table, and run a session that behaves like the real thing."
      altPrompt="Already have an account?"
      altLabel="Log in"
      altHref="/login"
    >
      <h2 className="landing-serif text-[1.75rem] leading-tight tracking-[-0.02em] text-ink">
        Create your account
      </h2>
      <p className="mt-1.5 text-sm text-ink-soft">
        Free while we build it out. No card required.
      </p>

      {error && (
        <p
          role="alert"
          className="mt-6 border-l-2 border-accent bg-accent/5 px-4 py-3 text-sm text-accent"
        >
          {error}
        </p>
      )}

      {success && (
        <p
          role="status"
          className="mt-6 border-l-2 border-emerald-700 bg-emerald-50 px-4 py-3 text-sm text-emerald-700"
        >
          {success}
        </p>
      )}

      <form onSubmit={handleSubmit} className="mt-6 space-y-4">
        <label className="block">
          <span className="mb-1.5 block text-sm font-medium text-ink">Name</span>
          <input
            type="text"
            name="username"
            placeholder="Ada Lovelace"
            value={formData.username}
            onChange={handleChange}
            autoComplete="name"
            className="field-surface w-full rounded-[4px] px-4 py-3 text-[15px]"
            required
          />
        </label>

        <label className="block">
          <span className="mb-1.5 block text-sm font-medium text-ink">Email</span>
          <input
            type="email"
            name="email"
            placeholder="you@company.com"
            value={formData.email}
            onChange={handleChange}
            autoComplete="email"
            className="field-surface w-full rounded-[4px] px-4 py-3 text-[15px]"
            required
          />
        </label>

        <label className="block">
          <span className="mb-1.5 block text-sm font-medium text-ink">Password</span>
          <span className="relative block">
            <input
              type={showPassword ? "text" : "password"}
              name="password"
              placeholder="At least 8 characters"
              value={formData.password}
              onChange={handleChange}
              autoComplete="new-password"
              className="field-surface w-full rounded-[4px] px-4 py-3 pr-12 text-[15px]"
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword((current) => !current)}
              className="absolute inset-y-0 right-0 flex items-center px-4 text-ink-soft transition-colors hover:text-ink"
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? <FaEyeSlash /> : <FaEye />}
            </button>
          </span>
        </label>

        <fieldset>
          <legend className="mb-1.5 block text-sm font-medium text-ink">
            I&rsquo;m joining as
          </legend>
          <div className="grid grid-cols-2 gap-2">
            {roles.map(([value, description]) => (
              <label
                key={value}
                className={`cursor-pointer rounded-[4px] border px-3 py-2.5 transition-colors ${
                  formData.role === value
                    ? "border-accent bg-accent/5"
                    : "border-rule bg-transparent hover:border-ink/30"
                }`}
              >
                <span className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="role"
                    value={value}
                    checked={formData.role === value}
                    onChange={handleChange}
                    className="accent-[#c0341a]"
                  />
                  <span className="text-sm font-medium text-ink">{value}</span>
                </span>
                <span className="mt-1 block text-[12px] leading-snug text-ink-soft">
                  {description}
                </span>
              </label>
            ))}
          </div>
        </fieldset>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full rounded-[4px] bg-ink px-6 py-3 text-[15px] font-medium text-canvas transition-opacity hover:opacity-85 disabled:opacity-60"
        >
          {isLoading ? "Creating account…" : "Create account"}
        </button>
      </form>

      <p className="mt-4 text-[12px] leading-relaxed text-ink-soft">
        By registering you agree to PrepTalk&rsquo;s Terms of Service and Privacy Policy.
      </p>

      <p className="mt-6 border-t border-rule pt-6 text-sm text-ink-soft lg:hidden">
        Already have an account?{" "}
        <button
          onClick={() => router.push("/login")}
          className="font-medium text-accent underline decoration-accent/30 decoration-2 underline-offset-4"
        >
          Log in
        </button>
      </p>
    </AuthLayout>
  );
}
