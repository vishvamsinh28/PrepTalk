"use client";

/** @file The PrepTalk logo mark and wordmark. */

/**
 * The PrepTalk wordmark: two serif quotation marks reading as a conversation,
 * the second (the reply) carrying the brand accent.
 * The first mark uses `currentColor`, so the logo inherits its surroundings and
 * works on both the ink and canvas panels without a variant prop. The accent
 * mark is a literal hex rather than a token because it must stay constant
 * against either ground.
 * The `viewBox` is deliberately cropped to the marks so the SVG has no dead
 * padding and `markClassName` sizing behaves predictably.
 * @param {object} props - Component props.
 * @param {boolean} [props.showWord=true] - Renders the "PrepTalk" text beside the mark.
 * @param {string} [props.className=""] - Extra classes on the wrapper.
 * @param {string} [props.markClassName="h-11 w-11"] - Sizing for the SVG.
 * @param {string} [props.textClassName="text-xl"] - Sizing for the wordmark.
 * @param {string} [props.accent="#c0341a"] - Fill for the second mark.
 * @returns {JSX.Element} The logo.
 */
export default function PrepTalkLogo({
  showWord = true,
  className = "",
  markClassName = "h-11 w-11",
  textClassName = "text-xl",
  accent = "#c0341a",
}) {
  return (
    <span className={`inline-flex items-center gap-2.5 ${className}`}>
      <svg
        viewBox="9 13 46 34"
        role="img"
        aria-label="PrepTalk"
        className={markClassName}
      >
        <g fill="currentColor">
          <circle cx="20" cy="24" r="9" />
          <path d="M27.5 27.5C27 36 22 42 14.5 44.5L11.5 38C16.5 36 19.5 32 20 27.5Z" />
        </g>
        <g fill={accent}>
          <circle cx="44" cy="24" r="9" />
          <path d="M51.5 27.5C51 36 46 42 38.5 44.5L35.5 38C40.5 36 43.5 32 44 27.5Z" />
        </g>
      </svg>
      {showWord && (
        <span className={`${textClassName} font-semibold tracking-tight`}>
          PrepTalk
        </span>
      )}
    </span>
  );
}
