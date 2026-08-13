import { FaCheck, FaChevronDown, FaChevronUp, FaTimes } from "react-icons/fa";
import { formatValue } from "./resultUtils";

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
    <section className={`border-t border-white/10 bg-[#1e1a17] transition-all ${isOpen ? "h-[22rem] sm:h-[26rem]" : "h-[3.4rem] sm:h-[3.8rem]"} overflow-hidden`}>
      <button onClick={onToggle} className="flex h-[3.4rem] w-full items-center justify-between border-b border-white/10 px-4 text-left sm:h-[3.8rem] sm:px-6">
        <span className="inline-flex items-center gap-3 text-lg font-semibold sm:text-xl">
          {isOpen ? <FaChevronDown /> : <FaChevronUp />}
          Test Results
        </span>
        <span className="text-sm font-semibold text-white/50">Visible tests</span>
      </button>

      <div className="grid h-[18.6rem] min-h-0 grid-cols-1 overflow-hidden sm:h-[22.2rem] md:grid-cols-[14rem_minmax(0,1fr)]">
        <aside className="hidden border-r border-white/10 p-4 md:block">
          <div className="mb-4 border-b border-white/10 text-lg font-semibold">
            <span className="inline-block border-b-2 border-[#e4633f] pb-3">Visible Cases</span>
          </div>
          <div className="grid gap-2">
            {visibleResults.map((test, index) => (
              <div key={test.name} className={`flex items-center gap-3 rounded-[3px] px-3 py-3 text-base ${test.status === "failed" ? "bg-accent/15" : ""}`}>
                {test.status === "passed" ? <FaCheck className="text-[#9db87f]" /> : test.status === "failed" ? <FaTimes className="text-[#e4633f]" /> : <span className="h-3 w-3 rounded-full border border-white/25" />}
                Test Case {index + 1}
              </div>
            ))}
          </div>
        </aside>

        <main className="min-h-0 overflow-y-auto p-3 sm:p-4">
          {hasRun && (
            <div className={`mb-3 rounded-[3px] px-4 py-3 text-base font-semibold sm:text-xl ${allPassed ? "bg-[#9db87f]/15 text-[#9db87f]" : "bg-accent/15 text-[#e4633f]"}`}>
              {allPassed ? <FaCheck className="mr-3 inline text-[#9db87f]" /> : <FaTimes className="mr-3 inline text-[#e4633f]" />}
              {allPassed ? "All visible test cases passed" : `${visibleFailed} failed · ${visiblePassed} passed`}
            </div>
          )}

          {firstResult ? (
            <div className="grid gap-4">
              <ResultBlock title="Compiler Message">
                {firstResult.status === "idle" ? "Run code to see compiler output." : firstResult.error || (firstResult.status === "passed" ? "Accepted" : "Wrong Answer")}
              </ResultBlock>
              <ResultBlock title="Input">
                {formatValue(firstResult.input)}
              </ResultBlock>
              <ResultBlock title="Expected Output">
                {formatValue(firstResult.expected)}
              </ResultBlock>
              {firstResult.status !== "idle" && (
                <ResultBlock title="Output (stdout)">
                  {firstResult.error || formatValue(firstResult.output)}
                </ResultBlock>
              )}
              {failedResults.length > 0 && (
                <ResultBlock title={isExplaining ? "Generating explanation..." : "Debug Hint"}>
                  {failedResults[0]?.insight || explanationError || "Compare your output with the expected value above."}
                </ResultBlock>
              )}
              {explanationError && !failedResults.length && <ResultBlock title="Explanation Error">{explanationError}</ResultBlock>}
            </div>
          ) : (
            <div className="rounded-[3px] border border-white/10 p-5 text-white/50">No visible test cases for this question.</div>
          )}
        </main>
      </div>
    </section>
  );
}

function ResultBlock({ title, children }) {
  return (
    <section className="rounded-[3px] border border-white/10 bg-white/5">
      <div className="flex items-center justify-between border-b border-white/10 px-4 py-3">
        <h3 className="font-semibold">{title}</h3>
      </div>
      <pre className="max-h-64 min-h-14 overflow-auto whitespace-pre-wrap break-words p-4 font-mono text-base text-white/85 [overflow-wrap:anywhere]">{children}</pre>
    </section>
  );
}
