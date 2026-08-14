/** @file Landing-page header. Separate from the app `Navbar`, which renders null on `/`. */

import Link from "next/link";
import PrepTalkLogo from "../PrepTalkLogo";

/**
 * Landing header: wordmark, section anchors, and a login link.
 * Static (not fixed) so it scrolls away with the hero — which is why it carries
 * no sign-up CTA; that would only duplicate the hero's.
 * @returns {JSX.Element} The header.
 */
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

        {/* No sign-up button here: this header scrolls away with the hero, so a
            CTA would only ever duplicate the hero's. Conversion lives in the
            hero and the closing section. */}
        <Link
          href="/login"
          className="ml-auto text-sm text-ink-soft transition-colors hover:text-ink"
        >
          Log in
        </Link>
      </div>
    </header>
  );
}
