import Link from "next/link";
import RollingWord from "./RollingWord";

export default function Hero() {
  return (
    <section className="border-b border-rule px-10 pb-28 pt-32">
      <div className="mx-auto max-w-[58rem] text-center">
        <span className="mx-auto block h-0.5 w-10 bg-accent" />

        {/* aria-label keeps the sentence readable — the slot holds every word at once */}
        <h1
          className="landing-serif landing-display landing-rise mt-10 text-ink"
          aria-label="Fail the interview before it counts."
        >
          <RollingWord words={["Fail", "Rehearse", "Botch", "Survive"]} /> the interview
          <br />
          before it counts.
        </h1>

        <p
          className="landing-rise mx-auto mt-9 max-w-[54ch] text-[17px] leading-[1.75] text-ink-soft"
          style={{ animationDelay: "80ms" }}
        >
          Live rooms with video, shared code, and a scorecard the interviewer fills in
          while you talk — then timed coding screens graded on the server, against tests
          you never see.
        </p>

        <div
          className="landing-rise mt-11 flex items-center justify-center gap-8"
          style={{ animationDelay: "160ms" }}
        >
          <Link
            href="/register"
            className="bg-ink px-7 py-4 text-[15px] font-medium text-canvas transition-opacity hover:opacity-85"
          >
            Create a free account
          </Link>
          <a
            href="#interview"
            className="text-[15px] font-medium text-ink underline decoration-rule decoration-2 underline-offset-[6px] transition-colors hover:decoration-accent"
          >
            See a session room
          </a>
        </div>

        <p
          className="landing-rise landing-mono mt-16 uppercase text-ink-soft"
          style={{ animationDelay: "240ms" }}
        >
          Free while we build it out
        </p>
      </div>
    </section>
  );
}
