/** @file Shared page and section headers for the signed-in app. */

/**
 * Page header: mono eyebrow, serif title, description, optional right-hand meta.
 * Closes with a hairline so every internal page starts on the same rhythm as
 * the landing sections. Only `title` is required — the rest render conditionally
 * so a bare header still collapses cleanly.
 * @param {object} props - Component props.
 * @param {string} [props.eyebrow] - Small uppercase label above the title.
 * @param {string} props.title - Page title.
 * @param {string} [props.description] - One line of context, capped at 62 characters wide.
 * @param {React.ReactNode} [props.meta] - Right-aligned block, usually `SignedInAs`.
 * @returns {JSX.Element} The header.
 */
export default function PageHeader({ eyebrow, title, description, meta }) {
  return (
    <header className="border-b border-rule pb-8">
      <div className="flex flex-wrap items-end justify-between gap-x-10 gap-y-5">
        <div className="min-w-0">
          {eyebrow && <p className="app-eyebrow">{eyebrow}</p>}
          <h1 className="app-title mt-4">{title}</h1>
          {description && (
            <p className="mt-4 max-w-[62ch] text-[15px] leading-[1.7] text-ink-soft">
              {description}
            </p>
          )}
        </div>
        {meta && <div className="shrink-0">{meta}</div>}
      </div>
    </header>
  );
}

/**
 * Right-aligned "signed in as" block for the header's `meta` slot.
 * Truncates rather than wrapping, so a long address can't push the header out
 * of alignment.
 * @param {object} props - Component props.
 * @param {string} [props.email] - Signed-in email; renders blank while loading.
 * @returns {JSX.Element} The block.
 */
export function SignedInAs({ email }) {
  return (
    <div className="text-right">
      <p className="app-eyebrow">Signed in as</p>
      <p className="mt-1.5 max-w-[22rem] truncate text-sm text-ink">{email}</p>
    </div>
  );
}

/**
 * Section heading, one type scale below `PageHeader`.
 * Renders an `h2`, so pages keep a single `h1` from the page header.
 * @param {object} props - Component props.
 * @param {string} [props.eyebrow] - Small uppercase label above the title.
 * @param {string} props.title - Section title.
 * @param {React.ReactNode} [props.action] - Right-aligned control or count.
 * @returns {JSX.Element} The heading.
 */
export function SectionHeading({ eyebrow, title, action }) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
      <div>
        {eyebrow && <p className="app-eyebrow">{eyebrow}</p>}
        <h2 className="app-h2 mt-3">{title}</h2>
      </div>
      {action}
    </div>
  );
}
