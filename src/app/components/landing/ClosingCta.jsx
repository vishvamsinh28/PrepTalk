import Link from "next/link";

/**
 * Landing closer: serif claim with sign-up and login actions.
 */
export default function ClosingCta() {
  return (
    <section className="px-10 py-32">
      <div className="mx-auto grid max-w-[84rem] grid-cols-12 items-end gap-x-16">
        <div className="col-span-7">
          <span className="block h-0.5 w-10 bg-accent" />
          <h2 className="landing-serif landing-h2 mt-8 max-w-[18ch] text-ink">
            The real interview is a bad place to find out.
          </h2>
        </div>

        <div className="col-span-5">
          <p className="max-w-[40ch] text-[17px] leading-[1.7] text-ink-soft">
            Open a room, run the reps, read the report. Free while we build it out.
          </p>
          <Link
            href="/register"
            className="mt-8 inline-block bg-ink px-7 py-4 text-[15px] font-medium text-canvas transition-opacity hover:opacity-85"
          >
            Create a free account
          </Link>
        </div>
      </div>
    </section>
  );
}
