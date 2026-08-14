import { FaChevronDown, FaChevronUp } from "react-icons/fa";
import { formatValue } from "./resultUtils";

/**
 * Collapsible visible-test results: per-case status, IO blocks, and
 * debug hints.
 * @param {object} props Runner results and toggle state.
 */
export default function ResultsSidebar({
  activeProblem,
  explanationError,
  failedResults,
  isExplaining,
  isOpen,
  onToggle,
  visibleResults,
}) {
  const hasRun = visibleResults.some((result) => result.status !== "idle");
  const visiblePassed = visibleResults.filter((result) => result.status === "passed").length;
  const visibleFailed = visibleResults.filter((result) => result.status === "failed").length;
  const allPassed = hasRun && visiblePassed === visibleResults.length;
  const firstResult = visibleResults.find((result) => result.status === "failed") || visibleResults[0];

  return (
    <section
      className={`border-t border-rule transition-all ${
        isOpen ? "h-[21rem] sm:h-[24rem]" : "h-12"
      } overflow-hidden`}
    >
      <button
        onClick={onToggle}
        className="flex h-12 w-full items-center justify-between border-b border-rule px-5 text-left"
      >
        <span className="inline-flex items-center gap-3 text-sm font-semibold text-ink">
          {isOpen ? <FaChevronDown className="text-ink-soft" /> : <FaChevronUp className="text-ink-soft" />}
          Test results
        </span>
        <span className="app-eyebrow">Visible tests</span>
      </button>

      <div className="grid h-[18rem] min-h-0 grid-cols-1 overflow-hidden sm:h-[21rem] md:grid-cols-[13rem_minmax(0,1fr)]">
        <aside className="hidden border-r border-rule px-5 py-4 md:block">
          <p className="app-eyebrow">Visible cases</p>
          <ul className="mt-3">
            {visibleResults.map((test, index) => (
              <li
                key={test.name}
                className={`flex items-baseline gap-3 border-t border-rule py-2.5 text-sm first:border-t-0 ${
                  test.status === "failed" ? "text-accent" : "text-ink"
                }`}
              >
                <span className="app-eyebrow w-8 shrink-0">
                  {test.status === "passed" ? "pass" : test.status === "failed" ? "fail" : "—"}
                </span>
                Test case {index + 1}
              </li>
            ))}
          </ul>
        </aside>

        <main className="min-h-0 overflow-y-auto px-5 py-4">
          {hasRun && (
            <p
              className={`mb-4 border-l-2 pl-3 text-sm font-medium ${
                allPassed ? "border-emerald-700 text-emerald-700" : "border-accent text-accent"
              }`}
            >
              {allPassed
                ? "All visible test cases passed"
                : `${visibleFailed} failed · ${visiblePassed} passed`}
            </p>
          )}

          {firstResult ? (
            <div className="grid gap-4">
              <ResultBlock title="Compiler message">
                {firstResult.status === "idle" ? "Run code to see compiler output." : firstResult.error || (firstResult.status === "passed" ? "Accepted" : "Wrong Answer")}
              </ResultBlock>
              <ResultBlock title="Input">
                {formatValue(firstResult.input)}
              </ResultBlock>
              <ResultBlock title="Expected output">
                {formatValue(firstResult.expected)}
              </ResultBlock>
              {firstResult.status !== "idle" && (
                <ResultBlock title="Output (stdout)">
                  {firstResult.error || formatValue(firstResult.output)}
                </ResultBlock>
              )}
              {failedResults.length > 0 && (
                <ResultBlock title={isExplaining ? "Generating explanation…" : "Debug hint"}>
                  {failedResults[0]?.insight || explanationError || "Compare your output with the expected value above."}
                </ResultBlock>
              )}
              {explanationError && !failedResults.length && <ResultBlock title="Explanation error">{explanationError}</ResultBlock>}
            </div>
          ) : (
            <p className="py-6 text-sm text-ink-soft">No visible test cases for this question.</p>
          )}
        </main>
      </div>
    </section>
  );
}

function ResultBlock({ title, children }) {
  return (
    <section className="border-t border-rule pt-3">
      <h3 className="app-eyebrow">{title}</h3>
      <pre className="mt-2 max-h-56 min-h-6 overflow-auto whitespace-pre-wrap break-words font-mono text-[13px] leading-5 text-ink [overflow-wrap:anywhere]">{children}</pre>
    </section>
  );
}
