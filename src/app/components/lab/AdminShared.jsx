"use client";

/** @file Small presentational pieces shared across the Lab admin screens. */

/**
 * Status callout for admin actions, marked by a coloured left rule.
 * `role="status"` makes it a polite live region, so a screen reader announces
 * the outcome without stealing focus. Any tone other than `"success"` renders
 * as an error, so a typo fails loud rather than silently unstyled.
 * Does not self-dismiss — the parent owns how long it stays.
 * @param {object} props - Component props.
 * @param {"success"|"error"} props.tone - Visual treatment.
 * @param {string} props.text - Message to show.
 * @returns {JSX.Element} The callout.
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

/**
 * Zero-padded section number, shown where a list needs a leading marker.
 * Named `SkillIcon` for historical reasons — it used to rotate through
 * puzzle/code/database glyphs by array position, which implied a categorisation
 * that never existed. A number says only what's true.
 * @param {object} props - Component props.
 * @param {number} props.index - Zero-based position; rendered one-based as `01`, `02`.
 * @returns {JSX.Element} The number.
 */
export function SkillIcon({ index }) {
  return (
    <span className="app-eyebrow mt-1 shrink-0 tabular-nums text-accent">
      {String(index + 1).padStart(2, "0")}
    </span>
  );
}

/**
 * Stat cell: mono label over a serif value.
 * Carries its own right border with `last:border-r-0`, so a row of these needs
 * no divider markup and no knowledge of how many siblings it has.
 * @param {object} props - Component props.
 * @param {string} props.label - Small uppercase label.
 * @param {React.ReactNode} props.value - The figure; a node, so it can carry a unit.
 * @returns {JSX.Element} The cell.
 */
export function Metric({ label, value }) {
  return (
    <div className="border-r border-rule px-4 py-3 last:border-r-0">
      <p className="app-eyebrow">{label}</p>
      <p className="landing-serif mt-1.5 text-2xl leading-none text-ink">{value}</p>
    </div>
  );
}
