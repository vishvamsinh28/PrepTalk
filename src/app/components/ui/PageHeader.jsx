/*
 * Shared page header for the internal app: mono eyebrow, serif title,
 * one line of description, optional right-hand meta. Closes with a hairline
 * so pages start on the same rhythm as the landing sections.
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
 * Right-aligned signed-in email block for page headers.
 * @param {{ email?: string }} props
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
 * Section heading: mono eyebrow, serif title, optional right action.
 * @param {{ eyebrow?: string, title: string, action?: React.ReactNode }} props
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
