"use client";

/*
 * Two serif quotation marks — an interview is a conversation, and the
 * second mark (the reply) carries the brand accent.
 * The primary mark inherits currentColor so the logo works on any ground.
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
