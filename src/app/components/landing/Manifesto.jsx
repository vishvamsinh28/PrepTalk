/**
 * Asymmetric editorial statement section on the landing page.
 */
export default function Manifesto() {
  return (
    <section className="border-b border-rule px-10 py-32">
      <div className="mx-auto grid max-w-[84rem] grid-cols-12 gap-x-16">
        <h2 className="landing-serif landing-h2 col-span-7 text-ink">
          Reading answers off a page feels like progress. It isn&rsquo;t.
        </h2>

        <div className="col-span-4 col-start-9 self-end border-l border-rule pl-8">
          <p className="text-[15px] leading-[1.75] text-ink-soft">
            The parts that actually decide an interview — the follow-up question, the
            silence after a wrong turn, the code you have to defend out loud — only exist
            when someone else is in the room.
          </p>
          <p className="mt-5 text-[15px] leading-[1.75] text-ink-soft">
            PrepTalk is built around that person, and keeps a record of what they saw.
          </p>
        </div>
      </div>
    </section>
  );
}
