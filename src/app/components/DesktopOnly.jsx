import PrepTalkLogo from "./PrepTalkLogo";

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
