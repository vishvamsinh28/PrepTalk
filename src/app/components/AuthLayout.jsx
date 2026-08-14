/** @file Shared two-panel shell wrapping the login and register forms. */

import Link from "next/link";
import PrepTalkLogo from "./PrepTalkLogo";

/** Feature list shown in the pitch panel; decorative, not driven by data. */
const inTheRoom = [
  "Live video rooms",
  "Shared code workspace",
  "Timed coding screens",
  "Session reports",
];

/**
 * Split auth shell: ink panel carries the pitch, canvas panel carries the form.
 * The pitch panel is hidden below `lg` so the form gets the whole screen on
 * mobile — which is why the logo appears twice, the second copy going
 * `invisible` (not `hidden`) at `lg` so it still reserves layout space and
 * keeps the alt-prompt right-aligned.
 * A server component: it holds no state and is rendered by the auth pages.
 * @param {object} props - Component props.
 * @param {string} props.headline - Large serif headline in the pitch panel.
 * @param {string} props.blurb - Supporting line under the headline.
 * @param {string} props.altPrompt - Lead-in text, e.g. "New to PrepTalk?".
 * @param {string} props.altLabel - Link text for the opposite auth page.
 * @param {string} props.altHref - Link target for the opposite auth page.
 * @param {React.ReactNode} props.children - The form to render in the right panel.
 * @returns {JSX.Element} The auth shell.
 */
export default function AuthLayout({
  headline,
  blurb,
  altPrompt,
  altLabel,
  altHref,
  children,
}) {
  return (
    <div className="min-h-screen bg-canvas lg:grid lg:h-screen lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1fr)] lg:overflow-hidden">
      <aside className="hidden min-h-0 flex-col justify-between bg-ink px-14 py-10 text-canvas lg:flex">
        <Link href="/" aria-label="PrepTalk home" className="flex items-center gap-2.5">
          <PrepTalkLogo showWord={false} markClassName="h-7 w-7" />
          <span className="text-[17px] font-semibold tracking-tight">PrepTalk</span>
        </Link>

        <div className="max-w-[26rem]">
          <span className="block h-0.5 w-10 bg-accent" />
          <h1 className="landing-serif mt-7 text-[2.5rem] leading-[1.06] tracking-[-0.02em]">
            {headline}
          </h1>
          <p className="mt-5 text-[15px] leading-[1.7] text-white/55">{blurb}</p>
        </div>

        <ul className="flex flex-wrap gap-x-6 gap-y-2">
          {inTheRoom.map((item) => (
            <li key={item} className="landing-mono uppercase text-white/35">
              {item}
            </li>
          ))}
        </ul>
      </aside>

      <main className="flex min-h-screen flex-col px-6 py-6 sm:px-10 lg:h-full lg:min-h-0">
        <div className="flex items-center justify-between gap-4">
          <Link
            href="/"
            aria-label="PrepTalk home"
            className="flex items-center gap-2.5 lg:invisible"
          >
            <PrepTalkLogo showWord={false} markClassName="h-7 w-7" />
            <span className="text-[17px] font-semibold tracking-tight text-ink">
              PrepTalk
            </span>
          </Link>

          <p className="text-sm text-ink-soft">
            {altPrompt}{" "}
            <Link
              href={altHref}
              className="ml-1 font-medium text-accent underline decoration-accent/30 decoration-2 underline-offset-4 transition-colors hover:decoration-accent"
            >
              {altLabel}
            </Link>
          </p>
        </div>

        <div className="flex flex-1 items-center justify-center py-6 lg:min-h-0 lg:overflow-y-auto">
          <div className="w-full max-w-[25rem]">{children}</div>
        </div>
      </main>
    </div>
  );
}
