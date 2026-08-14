/** @file The two product sections on the landing page: Interview and Lab. */

import Link from "next/link";
import InterviewScreen from "./InterviewScreen";
import LabScreen from "./LabScreen";

/** Feature rows for the Interview band, as `[title, description]`. */
const roomParts = [
  ["Video and chat", "WebRTC video with persistent chat and presence, in one pane."],
  ["Shared workspace", "Notes and code both sides can edit while the call is running."],
  [
    "Question bank",
    "Drafted from the role, level, and skills on the session — a starting point the interviewer edits.",
  ],
  [
    "Scorecard",
    "Communication, technical depth, problem solving, confidence, role fit — plus strengths, improvements, and a recommendation.",
  ],
];

/** Bullet points for the Lab band. Plain strings — no titles in this list. */
const labPoints = [
  "A timer that runs with the attempt",
  "Visible tests the candidate runs in-browser, as often as they like",
  "Hidden tests graded server-side on submit",
  "Plain-English explanations when a test fails",
];

/**
 * The two product bands, returned as a fragment rather than one wrapper.
 * They alternate ground — Interview on night, Lab on canvas — and each needs to
 * bleed full-width, so wrapping them in a shared container would break that.
 * The `#interview` and `#lab` ids are the anchor targets used by the nav and
 * footer links.
 * @returns {JSX.Element} Both product sections.
 */
export default function ProductBands() {
  return (
    <>
      <section id="interview" className="bg-night px-10 py-32 text-canvas">
        <div className="mx-auto max-w-[84rem]">
          <div className="grid grid-cols-12 gap-x-16">
            <p className="landing-mono col-span-3 pt-3 uppercase text-accent-light">
              PrepTalk Interview
            </p>
            <h2 className="landing-serif landing-h2 col-span-8 text-canvas">
              One link, one room, one person asking the next question.
            </h2>
          </div>

          <div className="mt-16">
            <InterviewScreen />
            <p className="landing-mono mt-5 uppercase text-white/40">
              A session room — video, chat, shared workspace, scorecard
            </p>
          </div>

          <dl className="mt-20 grid grid-cols-4 gap-x-10 border-t border-white/15 pt-10">
            {roomParts.map(([term, detail]) => (
              <div key={term}>
                <dt className="landing-h3 text-canvas">{term}</dt>
                <dd className="mt-3 text-[15px] leading-[1.7] text-white/55">{detail}</dd>
              </div>
            ))}
          </dl>

          <Link
            href="/register"
            className="mt-16 inline-block border-b border-accent-light pb-1 text-[15px] font-medium text-accent-light transition-opacity hover:opacity-75"
          >
            Start interviewing
          </Link>
        </div>
      </section>

      <section id="lab" className="border-b border-rule px-10 py-32">
        <div className="mx-auto grid max-w-[84rem] grid-cols-12 items-center gap-x-16">
          <div className="col-span-7">
            <LabScreen />
          </div>

          <div className="col-span-5">
            <p className="landing-mono uppercase text-accent">PrepTalk Lab</p>
            <h2 className="landing-serif landing-h2 mt-6 text-ink">
              Graded by tests, not by impressions.
            </h2>
            <p className="mt-6 max-w-[46ch] text-[17px] leading-[1.7] text-ink-soft">
              Build an assessment from a template or from scratch, assign it with a
              deadline, and let the grading happen where it can&rsquo;t be fudged — on the
              server, against tests the candidate never sees.
            </p>

            <ul className="mt-8 space-y-3.5">
              {labPoints.map((point) => (
                <li key={point} className="flex gap-4 text-[15px] text-ink-soft">
                  <span className="mt-2.5 h-px w-4 shrink-0 bg-accent" />
                  {point}
                </li>
              ))}
            </ul>

            <Link
              href="/register"
              className="mt-10 inline-block border-b border-accent pb-1 text-[15px] font-medium text-accent transition-opacity hover:opacity-75"
            >
              Open the lab
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
