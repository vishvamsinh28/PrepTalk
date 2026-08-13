import Link from "next/link";
import { Instrument_Sans } from "next/font/google";
import PrepTalkLogo from "./components/PrepTalkLogo";

const sans = Instrument_Sans({ subsets: ["latin"], display: "swap" });

export const metadata = {
  description:
    "PrepTalk pairs you with a real interviewer in live mock-interview rooms, then checks your coding in timed, server-graded screens.",
};

const sessionSteps = [
  "An interviewer opens a room, sets the agenda, and sends one invite link.",
  "You meet on video, with chat and a shared workspace for notes and code.",
  "The scorecard is filled in during the call. The report is waiting when it ends.",
];

const scorecardDimensions = [
  "Communication",
  "Technical depth",
  "Problem solving",
  "Confidence",
  "Role fit",
];

const screenParts = [
  ["Timed attempt", "the clock is part of the signal"],
  ["Visible tests", "run locally, as often as you like"],
  ["Hidden tests", "graded on the server when you submit"],
  ["Failure hints", "the AI explains what broke, in words"],
];

const capabilities = [
  [
    "Live video rooms",
    "WebRTC video and persistent chat in the same pane, with presence — so feedback can point at what actually happened.",
  ],
  [
    "A shared workspace",
    "Notes and code both sides can see and edit while the conversation is still going.",
  ],
  [
    "Structured scorecards",
    "Communication, depth, problem solving, confidence, role fit. Filled in during the session, not reconstructed after it.",
  ],
  [
    "Timed coding screens",
    "Visible tests run in your browser while you work. Hidden tests grade on the server when you submit.",
  ],
  [
    "Hints when tests fail",
    "A failing test comes back with an explanation of what broke, not just a red mark.",
  ],
  [
    "Reports that accumulate",
    "Every session leaves a summary. Line them up and you can see whether the practice is working.",
  ],
];

const codeLines = [
  [
    { t: "function", c: "text-cyan-300" },
    { t: " solve", c: "text-slate-100" },
    { t: "(nums, target) {", c: "text-slate-300" },
  ],
  [
    { t: "  const", c: "text-cyan-300" },
    { t: " seen = ", c: "text-slate-300" },
    { t: "new", c: "text-cyan-300" },
    { t: " Map();", c: "text-slate-300" },
  ],
  [
    { t: "  for", c: "text-cyan-300" },
    { t: " (", c: "text-slate-300" },
    { t: "let", c: "text-cyan-300" },
    { t: " i = ", c: "text-slate-300" },
    { t: "0", c: "text-amber-300" },
    { t: "; i < nums.length; i++) {", c: "text-slate-300" },
  ],
  [
    { t: "    const", c: "text-cyan-300" },
    { t: " need = target - nums[i];", c: "text-slate-300" },
  ],
  [
    { t: "    if", c: "text-cyan-300" },
    { t: " (seen.has(need)) ", c: "text-slate-300" },
    { t: "return", c: "text-cyan-300" },
    { t: " [seen.get(need), i];", c: "text-slate-300" },
  ],
  [{ t: "    seen.set(nums[i], i);", c: "text-slate-300" }],
  [{ t: "  }", c: "text-slate-300" }],
  [{ t: "}", c: "text-slate-300" }],
];

export default function HomePage() {
  return (
    <main className={`${sans.className} min-h-screen bg-paper text-ink`}>
      <div className="mx-auto max-w-6xl px-5 sm:px-8">
        <header className="flex items-center justify-between border-b border-rule py-5">
          <Link href="/" aria-label="PrepTalk home" className="flex items-center gap-2.5">
            <PrepTalkLogo showWord={false} markClassName="h-8 w-8" />
            <span className="text-[17px] font-semibold tracking-tight">PrepTalk</span>
          </Link>
          <nav aria-label="Main" className="flex items-center gap-5">
            <Link
              href="/login"
              className="text-sm font-medium text-ink-soft transition-colors hover:text-ink"
            >
              Log in
            </Link>
            <Link
              href="/register"
              className="rounded-[3px] bg-ink px-4 py-2 text-sm font-medium text-paper transition-colors hover:bg-ink/85"
            >
              Create account
            </Link>
          </nav>
        </header>

        <section className="grid gap-12 py-16 sm:py-20 lg:grid-cols-12 lg:gap-8 lg:py-28">
          <div className="lg:col-span-8">
            <p className="landing-rise landing-mono uppercase text-ink-soft">
              Mock interview rooms · Timed coding screens
            </p>
            <h1
              className="landing-display landing-rise mt-6 max-w-[14ch]"
              style={{ animationDelay: "70ms" }}
            >
              You can&rsquo;t practice interviews alone.
            </h1>
            <p
              className="landing-rise mt-6 max-w-[52ch] text-lg leading-relaxed text-ink-soft"
              style={{ animationDelay: "140ms" }}
            >
              PrepTalk puts a real interviewer in the room with you — live video, shared
              code, and a scorecard that says what needs work. Then timed coding screens
              tell you whether it stuck.
            </p>
            <div
              className="landing-rise mt-9 flex flex-wrap items-center gap-x-7 gap-y-4"
              style={{ animationDelay: "210ms" }}
            >
              <Link
                href="/register"
                className="rounded-[3px] bg-ink px-6 py-3.5 text-[15px] font-medium text-paper transition-colors hover:bg-ink/85"
              >
                Create a free account
              </Link>
              <a
                href="#product"
                className="text-[15px] font-medium underline decoration-rule decoration-2 underline-offset-4 transition-colors hover:decoration-ink"
              >
                See the product
              </a>
            </div>
            <p
              className="landing-rise landing-mono mt-8 text-ink-soft"
              style={{ animationDelay: "280ms" }}
            >
              Free to use — runs in the browser.
            </p>
          </div>

          <aside
            className="landing-rise border-t border-rule pt-8 lg:col-span-4 lg:border-l lg:border-t-0 lg:pl-8 lg:pt-1"
            style={{ animationDelay: "260ms" }}
            aria-label="How a session runs"
          >
            <h2 className="landing-mono uppercase text-ink-soft">
              A session, start to finish
            </h2>
            <ol className="mt-5 space-y-5">
              {sessionSteps.map((step, i) => (
                <li key={step} className="flex gap-4">
                  <span className="landing-mono pt-0.5 text-accent">0{i + 1}</span>
                  <span className="text-[15px] leading-relaxed text-ink-soft">{step}</span>
                </li>
              ))}
            </ol>
          </aside>
        </section>
      </div>

      <section id="product" className="bg-ink py-14 sm:py-20">
        <div className="mx-auto max-w-6xl px-5 sm:px-8">
          <figure>
            {/* Placeholder rendered in markup — swap the framed div for a real
                screenshot (public/images/) once one is captured. */}
            <div
              aria-hidden="true"
              className="select-none overflow-hidden rounded-md shadow-2xl ring-1 ring-white/10"
            >
              <div className="flex items-center gap-3 border-b border-white/10 bg-[#08111f] px-4 py-2.5">
                <span className="flex gap-1.5">
                  <span className="h-2.5 w-2.5 rounded-full bg-slate-600/60" />
                  <span className="h-2.5 w-2.5 rounded-full bg-slate-600/60" />
                  <span className="h-2.5 w-2.5 rounded-full bg-slate-600/60" />
                </span>
                <span className="font-mono text-[11px] text-slate-500">
                  PrepTalk Lab · Assessment
                </span>
              </div>

              <div className="grid bg-[#07101d] sm:grid-cols-[1fr_1.5fr]">
                <div className="hidden border-r border-white/10 bg-[#0a1322] p-5 sm:block">
                  <p className="text-sm font-bold text-slate-100">Pair Sum</p>
                  <p className="mt-1 text-[10px] font-semibold text-slate-500">
                    Medium · 40 points · 30:00
                  </p>
                  <p className="mt-4 text-[11px] leading-relaxed text-slate-400">
                    Given an array of integers and a target, return the indices of the
                    two numbers that add up to the target. Each input has exactly one
                    solution, and you may not use the same element twice.
                  </p>
                  <div className="mt-4 rounded border border-white/10 bg-white/5 p-2.5 font-mono text-[10px] text-slate-400">
                    solve([2, 7, 11, 15], 9) → [0, 1]
                  </div>
                  <div className="mt-5 space-y-1.5">
                    {[
                      ["Sample 1", "passed"],
                      ["Sample 2", "passed"],
                      ["Hidden tests", "on submit"],
                    ].map(([name, state]) => (
                      <div
                        key={name}
                        className="flex items-center justify-between rounded border border-white/10 bg-white/5 px-2.5 py-1.5"
                      >
                        <span className="text-[10px] font-semibold text-slate-300">
                          {name}
                        </span>
                        <span
                          className={`font-mono text-[10px] ${
                            state === "passed" ? "text-emerald-300" : "text-slate-500"
                          }`}
                        >
                          {state}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between border-b border-white/10 bg-[#08111f] px-4 py-2">
                    <span className="flex items-center gap-2.5">
                      <span className="text-xs font-bold text-slate-100">Editor</span>
                      <span className="rounded border border-white/10 bg-white/8 px-2 py-0.5 text-[10px] font-semibold text-slate-300">
                        JavaScript
                      </span>
                    </span>
                    <span className="flex items-center gap-2">
                      <span className="rounded border border-emerald-300/25 bg-emerald-300/10 px-2 py-0.5 font-mono text-[10px] font-bold text-emerald-200">
                        24:31
                      </span>
                      <span className="rounded bg-linear-to-r from-cyan-300 via-emerald-300 to-blue-400 px-2.5 py-0.5 text-[10px] font-black text-slate-950">
                        Submit
                      </span>
                    </span>
                  </div>
                  <div className="grid grid-cols-[2.25rem_1fr]">
                    <div className="border-r border-white/10 bg-[#08111f] py-3 text-right font-mono text-[11px] leading-5 text-slate-600">
                      {codeLines.map((_, i) => (
                        <div key={i} className="pr-2.5">
                          {i + 1}
                        </div>
                      ))}
                    </div>
                    <pre className="overflow-x-auto p-3 font-mono text-[11px] leading-5">
                      <code>
                        {codeLines.map((line, i) => (
                          <div key={i}>
                            {line.map((seg, j) => (
                              <span key={j} className={seg.c}>
                                {seg.t}
                              </span>
                            ))}
                          </div>
                        ))}
                      </code>
                    </pre>
                  </div>
                  <div className="flex items-center justify-between border-t border-white/10 bg-[#08111f] px-4 py-2.5">
                    <span className="text-[10px] font-semibold text-slate-500">
                      8 lines · Visible tests run locally. Final score is graded on the
                      server.
                    </span>
                    <span className="rounded border border-emerald-300/35 bg-emerald-300/10 px-2.5 py-1 text-[10px] font-bold text-emerald-200">
                      Run code
                    </span>
                  </div>
                </div>
              </div>
            </div>
            <figcaption className="landing-mono mt-5 text-slate-400">
              PrepTalk Lab, mid-attempt — visible tests run locally, hidden tests grade
              on submit.
            </figcaption>
          </figure>
        </div>
      </section>

      <div className="mx-auto max-w-6xl px-5 sm:px-8">
        <section className="py-16 sm:py-24" aria-labelledby="products-heading">
          <div className="grid gap-6 lg:grid-cols-12 lg:gap-8">
            <h2 id="products-heading" className="landing-h2 lg:col-span-7">
              Two rooms. One loop.
            </h2>
            <p className="text-[17px] leading-relaxed text-ink-soft lg:col-span-5 lg:self-end">
              Interview is where you talk. Lab is where you code. Reports connect the
              two, so the next session starts where the last one ended.
            </p>
          </div>

          <article className="mt-14 grid gap-10 border-t border-rule pt-12 lg:grid-cols-12 lg:gap-8">
            <div className="lg:col-span-5">
              <p className="landing-mono uppercase text-ink-soft">01 · PrepTalk Interview</p>
              <h3 className="landing-h3 mt-4">
                A live room with a real person on the other side.
              </h3>
              <p className="mt-4 max-w-[48ch] leading-relaxed text-ink-soft">
                Video, chat, and a shared workspace in one place. The interviewer runs
                the agenda; you work the problem. Nobody has to pretend a chatbot is a
                hiring manager.
              </p>
              <Link
                href="/register"
                className="mt-6 inline-block text-[15px] font-medium text-accent underline decoration-accent/30 decoration-2 underline-offset-4 transition-colors hover:decoration-accent"
              >
                Start interviewing →
              </Link>
            </div>
            <div className="lg:col-span-6 lg:col-start-7">
              <p className="landing-mono uppercase text-ink-soft">
                The scorecard — five dimensions
              </p>
              <ul className="mt-4">
                {scorecardDimensions.map((dim, i) => (
                  <li
                    key={dim}
                    className="flex items-baseline gap-4 border-b border-rule py-3.5"
                  >
                    <span className="landing-mono text-accent">0{i + 1}</span>
                    <span className="text-[15px] font-medium">{dim}</span>
                  </li>
                ))}
              </ul>
            </div>
          </article>

          <article className="mt-14 grid gap-10 border-t border-rule pt-12 lg:grid-cols-12 lg:gap-8">
            <div className="lg:order-2 lg:col-span-5 lg:col-start-8">
              <p className="landing-mono uppercase text-ink-soft">02 · PrepTalk Lab</p>
              <h3 className="landing-h3 mt-4">
                Coding screens graded by tests, not impressions.
              </h3>
              <p className="mt-4 max-w-[48ch] leading-relaxed text-ink-soft">
                A timer, visible tests you can run while you work, and hidden tests that
                grade server-side on submit. When something fails, you get an explanation
                of what broke — not just a red X.
              </p>
              <Link
                href="/register"
                className="mt-6 inline-block text-[15px] font-medium text-accent underline decoration-accent/30 decoration-2 underline-offset-4 transition-colors hover:decoration-accent"
              >
                Open the lab →
              </Link>
            </div>
            <div className="lg:order-1 lg:col-span-6">
              <p className="landing-mono uppercase text-ink-soft">What a screen includes</p>
              <ul className="mt-4">
                {screenParts.map(([name, detail]) => (
                  <li
                    key={name}
                    className="flex flex-wrap items-baseline gap-x-4 gap-y-1 border-b border-rule py-3.5"
                  >
                    <span className="text-[15px] font-medium">{name}</span>
                    <span className="text-[14px] text-ink-soft">{detail}</span>
                  </li>
                ))}
              </ul>
            </div>
          </article>
        </section>

        <section className="border-t border-rule py-16 sm:py-24" aria-labelledby="capabilities-heading">
          <h2 id="capabilities-heading" className="landing-h2 max-w-[24ch]">
            Everything in the current build.
          </h2>
          <ol className="mt-10">
            {capabilities.map(([title, desc], i) => (
              <li
                key={title}
                className="grid gap-2 border-t border-rule py-6 md:grid-cols-[4rem_1fr_1.6fr] md:gap-6"
              >
                <span className="landing-mono pt-1 text-ink-soft">0{i + 1}</span>
                <h3 className="text-lg font-medium tracking-tight">{title}</h3>
                <p className="leading-relaxed text-ink-soft">{desc}</p>
              </li>
            ))}
          </ol>
        </section>

        <section className="border-t border-rule py-16 sm:py-24">
          <h2 className="landing-h2 max-w-[22ch]">
            The real interview is a bad place to learn.
          </h2>
          <p className="mt-5 max-w-[46ch] text-lg leading-relaxed text-ink-soft">
            Set up a room, run the reps, read the report. Free while we build it out.
          </p>
          <Link
            href="/register"
            className="mt-8 inline-block rounded-[3px] bg-ink px-6 py-3.5 text-[15px] font-medium text-paper transition-colors hover:bg-ink/85"
          >
            Create a free account
          </Link>
        </section>

        <footer className="flex flex-wrap items-center justify-between gap-4 border-t border-rule py-8 text-sm text-ink-soft">
          <p>© {new Date().getFullYear()} PrepTalk</p>
          <nav aria-label="Footer" className="flex gap-6">
            <Link href="/login" className="transition-colors hover:text-ink">
              Log in
            </Link>
            <Link href="/register" className="transition-colors hover:text-ink">
              Create account
            </Link>
          </nav>
        </footer>
      </div>
    </main>
  );
}
