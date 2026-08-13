import Link from "next/link";
import PrepTalkLogo from "../PrepTalkLogo";

export default function LandingNav() {
  return (
    <header className="border-b border-rule px-10">
      <div className="mx-auto flex h-20 max-w-[84rem] items-center">
        <Link href="/" aria-label="PrepTalk home" className="flex items-center gap-2.5">
          <PrepTalkLogo showWord={false} markClassName="h-7 w-7" />
          <span className="text-[17px] font-semibold tracking-tight text-ink">
            PrepTalk
          </span>
        </Link>

        <nav aria-label="Main" className="ml-14 flex items-center gap-8">
          <a
            href="#interview"
            className="text-sm text-ink-soft transition-colors hover:text-ink"
          >
            Interview
          </a>
          <a href="#lab" className="text-sm text-ink-soft transition-colors hover:text-ink">
            Lab
          </a>
        </nav>

        <div className="ml-auto flex items-center gap-6">
          <Link
            href="/login"
            className="text-sm text-ink-soft transition-colors hover:text-ink"
          >
            Log in
          </Link>
          <Link
            href="/register"
            className="bg-ink px-5 py-2.5 text-sm font-medium text-canvas transition-opacity hover:opacity-85"
          >
            Create a free account
          </Link>
        </div>
      </div>
    </header>
  );
}
