import Link from "next/link";
import PrepTalkLogo from "../PrepTalkLogo";

export default function LandingFooter() {
  return (
    <footer className="bg-night px-10 py-16 text-canvas">
      <div className="mx-auto max-w-[84rem]">
        <div className="grid grid-cols-12 gap-x-16">
          <div className="col-span-5">
            <span className="flex items-center gap-2.5">
              <PrepTalkLogo showWord={false} markClassName="h-7 w-7" />
              <span className="text-[17px] font-semibold tracking-tight text-canvas">
                PrepTalk
              </span>
            </span>
            <p className="mt-5 max-w-[34ch] text-sm leading-[1.7] text-white/50">
              Mock interviews that behave like interviews, and coding screens that grade
              like tests.
            </p>
          </div>

          <div className="col-span-3">
            <h2 className="landing-mono uppercase text-white/40">Product</h2>
            <ul className="mt-5 space-y-3">
              <li>
                <a
                  href="#interview"
                  className="text-sm text-white/70 transition-colors hover:text-canvas"
                >
                  PrepTalk Interview
                </a>
              </li>
              <li>
                <a
                  href="#lab"
                  className="text-sm text-white/70 transition-colors hover:text-canvas"
                >
                  PrepTalk Lab
                </a>
              </li>
            </ul>
          </div>

          <div className="col-span-3">
            <h2 className="landing-mono uppercase text-white/40">Account</h2>
            <ul className="mt-5 space-y-3">
              <li>
                <Link
                  href="/register"
                  className="text-sm text-white/70 transition-colors hover:text-canvas"
                >
                  Create an account
                </Link>
              </li>
              <li>
                <Link
                  href="/login"
                  className="text-sm text-white/70 transition-colors hover:text-canvas"
                >
                  Log in
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <p className="mt-20 border-t border-white/10 pt-6 text-xs text-white/40">
          © {new Date().getFullYear()} PrepTalk
        </p>
      </div>
    </footer>
  );
}
