/** @file The small-viewport gate. PrepTalk is desktop-only by design, not by omission. */

import PrepTalkLogo from "./PrepTalkLogo";

/**
 * Full-screen notice shown below the `lg` breakpoint.
 * Gated purely by CSS (`lg:hidden`), so the desktop tree still mounts
 * underneath — the app isn't unmounted on small screens, just covered. That
 * keeps it a one-line addition per page, at the cost of doing the work anyway.
 * Because it's width-based rather than device-based, a narrow desktop window
 * also triggers it.
 * @returns {JSX.Element} The gate.
 */
export default function DesktopOnly() {
  return (
    <div className="flex min-h-screen flex-col justify-between bg-canvas px-6 py-10 lg:hidden">
      <PrepTalkLogo showWord={false} markClassName="h-9 w-9" />

      <div>
        <span className="block h-0.5 w-10 bg-accent" />
        <p className="landing-serif mt-8 text-[2.25rem] leading-[1.08] tracking-tight text-ink">
          Open this on a desktop.
        </p>
        <p className="mt-6 max-w-[38ch] text-[15px] leading-[1.7] text-ink-soft">
          A PrepTalk session puts live video, a shared code workspace, and the
          interviewer&rsquo;s scorecard on screen at once. That doesn&rsquo;t fit on a phone, so
          we haven&rsquo;t pretended it does.
        </p>
        <p className="landing-mono mt-10 border-t border-rule pt-6 uppercase text-ink-soft">
          Visit from a laptop to create an account
        </p>
      </div>

      <p className="text-xs text-ink-soft">© {new Date().getFullYear()} PrepTalk</p>
    </div>
  );
}
