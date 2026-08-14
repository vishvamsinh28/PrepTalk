"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { postJson } from "@/lib/clientApi";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import AuthLayout from "../components/AuthLayout";

/**
 * Login screen inside the split AuthLayout. Sets the JWT cookie via
 * /api/login, then replaces to /dashboard.
 */
export default function LoginPage() {
  const router = useRouter();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
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
      const response = await postJson("/api/login", formData);
      setSuccess(response.message);
      setTimeout(() => {
        router.replace("/dashboard");
        router.refresh();
      }, 1000);
    } catch (err) {
      setError(err.message || "Login failed");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthLayout
      headline="Pick up where the last session left off."
      blurb="Your rooms, assessments, and reports are waiting. Sign in to start the next round."
      altPrompt="New to PrepTalk?"
      altLabel="Create an account"
      altHref="/register"
    >
      <h2 className="landing-serif text-[2rem] leading-tight tracking-[-0.02em] text-ink">
        Sign in
      </h2>
      <p className="mt-2 text-[15px] text-ink-soft">
        Use the email you signed up with.
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
              placeholder="••••••••"
              value={formData.password}
              onChange={handleChange}
              autoComplete="current-password"
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

        <button
          type="submit"
          disabled={isLoading}
          className="w-full rounded-[4px] bg-ink px-6 py-3 text-[15px] font-medium text-canvas transition-opacity hover:opacity-85 disabled:opacity-60"
        >
          {isLoading ? "Signing in…" : "Sign in"}
        </button>
      </form>

      <p className="mt-8 border-t border-rule pt-6 text-sm text-ink-soft lg:hidden">
        New to PrepTalk?{" "}
        <button
          onClick={() => router.push("/register")}
          className="font-medium text-accent underline decoration-accent/30 decoration-2 underline-offset-4"
        >
          Create an account
        </button>
      </p>
    </AuthLayout>
  );
}
