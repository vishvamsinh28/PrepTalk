/** @file The problem statement pane of the assessment screen. */

/**
 * Renders the problem statement, its metadata, and the calling convention.
 * The "Example" block is fixed boilerplate rather than per-problem content: it
 * documents how the sandbox invokes `solve` — arrays are spread into arguments,
 * anything else is passed whole — which is the single most common reason a
 * correct-looking solution fails every test.
 * `whitespace-pre-wrap` preserves the author's line breaks, since prompts are
 * plain text rather than markdown.
 * @param {object} props - Component props.
 * @param {object} props.problem - Runnable problem with title, level, points, time, and prompt.
 * @returns {JSX.Element} The statement pane.
 */
export default function ProblemPanel({ problem }) {
  return (
    <section className="min-h-0 overflow-visible px-5 py-5 text-ink lg:overflow-y-auto lg:px-6">
      <h1 className="landing-serif break-words text-[1.4rem] leading-[1.15] tracking-[-0.015em] [overflow-wrap:anywhere]">
        {problem.title}
      </h1>
      <p className="app-eyebrow mt-2">
        {problem.level} · {problem.points} points · {problem.time}
      </p>

      <div className="problem-copy mt-5 max-w-[42rem] whitespace-pre-wrap text-sm leading-[1.7] text-ink-soft">
        {problem.prompt}
      </div>

      <div className="mt-6 max-w-[42rem] border-l-2 border-rule pl-4">
        <p className="app-eyebrow">Example</p>
        <p className="mt-2 font-mono text-xs leading-5 text-ink-soft">
          Array input is passed as <b className="text-ink">solve(...input)</b>, so{" "}
          <b className="text-ink">[1, {"{"}x: 2{"}"}]</b> calls{" "}
          <b className="text-ink">solve(1, {"{"}x: 2{"}"})</b>. Other input is passed as{" "}
          <b className="text-ink">solve(input)</b>. Do not rename{" "}
          <b className="text-ink">solve</b>.
        </p>
        <p className="mt-2 text-xs leading-5 text-ink-soft">
          Run code to check visible test cases before submitting.
        </p>
      </div>
    </section>
  );
}
