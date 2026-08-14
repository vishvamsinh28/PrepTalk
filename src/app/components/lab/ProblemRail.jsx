"use client";

/** @file The question rail down the left of the assessment screen. */

import { FaCheck, FaTimes } from "react-icons/fa";

/**
 * One button per problem, showing pass/fail once the candidate has run tests.
 * The number is replaced by a tick or cross rather than sitting beside one, so
 * the rail stays narrow — the position still identifies the question.
 * "Passed" requires at least one result *and* all of them passing, so an
 * unattempted problem shows its number rather than a misleading tick.
 * Only reflects locally run *visible* tests; hidden tests are graded on submit
 * and never change these icons.
 * @param {object} props - Component props.
 * @param {object[]} props.problems - Runnable problems, in order.
 * @param {string} props.activeProblemId - Currently open problem.
 * @param {Function} props.onSelect - Called with a problem id on click.
 * @param {Object<string, object[]>} props.resultsByProblem - Latest run results, keyed by problem id.
 * @returns {JSX.Element} The rail.
 */
export default function ProblemRail({ problems, activeProblemId, onSelect, resultsByProblem }) {
  return (
    <aside className="border-b border-rule lg:grid lg:grid-rows-[3rem_1fr] lg:border-b-0 lg:border-r">
      <div className="hidden place-items-center border-b border-rule px-4 lg:grid">
        <span className="app-eyebrow" title="Questions">
          Qs
        </span>
      </div>
      <div className="flex gap-2 overflow-x-auto px-3 py-3 text-center lg:grid lg:content-start lg:gap-3 lg:overflow-visible lg:py-5">
        {problems.map((problem, index) => {
          const results = resultsByProblem[problem.id] || [];
          const failed = results.some((result) => result.status === "failed");
          const passed = results.length > 0 && results.every((result) => result.status === "passed");
          return (
            <div key={problem.id}>
              <button
                onClick={() => onSelect(problem.id)}
                className={`grid h-10 min-w-14 place-items-center rounded-[3px] border px-3 text-sm font-semibold lg:h-12 lg:w-full lg:min-w-0 lg:px-0 ${
                  activeProblemId === problem.id ? "border-accent bg-accent/5 text-ink" : "border-transparent text-ink-soft hover:border-rule hover:bg-black/[0.03]"
                }`}
              >
                {passed ? <FaCheck className="text-emerald-700" /> : failed ? <FaTimes className="text-accent" /> : `Q${index + 1}`}
              </button>
            </div>
          );
        })}
      </div>
    </aside>
  );
}
