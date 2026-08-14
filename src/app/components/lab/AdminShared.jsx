"use client";

/**
 * Left-rule status callout for admin actions.
 * @param {{ tone: "success"|"error", text: string }} props
 */
export function Toast({ tone, text }) {
  const classes =
    tone === "success"
      ? "border-emerald-700 bg-emerald-50 text-emerald-700"
      : "border-accent bg-accent/5 text-accent";
  return (
    <div
      className={`min-h-12 w-full max-w-sm border-l-2 px-4 py-3 text-sm shadow-sm ${classes}`}
      role="status"
    >
      {text}
    </div>
  );
}

/* Was a rotating puzzle/code/database icon chosen by array position — decoration
   that implied a meaning it never had. A section number is honest and readable. */
export function SkillIcon({ index }) {
  return (
    <span className="app-eyebrow mt-1 shrink-0 tabular-nums text-accent">
      {String(index + 1).padStart(2, "0")}
    </span>
  );
}

/**
 * Bordered stat cell: mono label over serif value.
 * @param {{ label: string, value: React.ReactNode }} props
 */
export function Metric({ label, value }) {
  return (
    <div className="border-r border-rule px-4 py-3 last:border-r-0">
      <p className="app-eyebrow">{label}</p>
      <p className="landing-serif mt-1.5 text-2xl leading-none text-ink">{value}</p>
    </div>
  );
}
