import { FaBrain, FaCheck, FaFlask, FaMagic, FaRegCircle, FaStar, FaTimes } from "react-icons/fa";
import { formatValue } from "./resultUtils";

export default function ResultsSidebar({
  activeProblem,
  currentPassed,
  explanationError,
  failedResults,
  isExplaining,
  submittedProblems,
  visibleResults,
}) {
  return (
    <aside className="grid gap-4 xl:sticky xl:top-24 xl:self-start">
      <section className="rounded-xl border border-cyan-300/20 bg-cyan-300/10 p-5 shadow-xl shadow-black/20">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-cyan-200">Current problem</p>
            <h2 className="mt-1 text-4xl font-black gradient-text">
              {currentPassed}/{activeProblem.tests.length}
            </h2>
          </div>
          <div className="grid h-16 w-16 place-items-center rounded-full border border-cyan-300/25 bg-cyan-300/10 text-xl text-cyan-100">
            <FaStar />
          </div>
        </div>
        <div className="mt-4 h-2 overflow-hidden rounded-full bg-slate-950/70">
          <div
            className="h-full rounded-full bg-linear-to-r from-cyan-300 via-emerald-300 to-blue-400 transition-all"
            style={{ width: `${(currentPassed / activeProblem.tests.length) * 100}%` }}
          />
        </div>
      </section>

      <section className="rounded-xl border border-white/10 bg-slate-950/45 p-5 shadow-xl shadow-black/20">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="inline-flex items-center gap-2 font-black text-white">
            <FaFlask className="text-emerald-200" />
            Test cases
          </h2>
          <span className="text-xs font-bold text-slate-400">
            {submittedProblems[activeProblem.id] ? "Submitted tests" : "Visible tests"}
          </span>
        </div>

        <div className="grid gap-3">
          {visibleResults.map((test) => (
            <TestCase key={test.name} test={test} />
          ))}
        </div>
      </section>

      <section className="rounded-xl border border-amber-300/20 bg-amber-300/10 p-5 shadow-xl shadow-black/20">
        <h2 className="inline-flex items-center gap-2 font-black text-white">
          <FaBrain className="text-amber-200" />
          Failed-test explanations
        </h2>
        <div className="mt-4 grid gap-3">
          {failedResults.length === 0 ? (
            <div className="rounded-lg border border-white/10 bg-slate-950/45 p-3 text-sm leading-6 text-slate-300">
              <span className="mb-2 inline-flex items-center gap-2 font-black text-emerald-100">
                <FaMagic />
                No failed tests
              </span>
            </div>
          ) : (
            failedResults.map((test) => (
              <div key={test.name} className="rounded-lg border border-amber-300/25 bg-slate-950/35 p-3">
                <p className="text-sm font-black text-amber-100">{test.name}</p>
                <p className="mt-2 text-sm leading-6 text-slate-300">
                  {test.insight}
                </p>
              </div>
            ))
          )}
          {isExplaining && failedResults.length > 0 && (
            <div className="rounded-lg border border-cyan-300/20 bg-cyan-300/10 p-3 text-sm font-bold text-cyan-100">
              Generating explanations...
            </div>
          )}
          {explanationError && (
            <div className="rounded-lg border border-rose-300/25 bg-rose-400/10 p-3 text-sm leading-6 text-rose-100">
              {explanationError}
            </div>
          )}
        </div>
      </section>
    </aside>
  );
}

function TestCase({ test }) {
  const isPassed = test.status === "passed";
  const isFailed = test.status === "failed";
  const icon = isPassed ? <FaCheck /> : isFailed ? <FaTimes /> : <FaRegCircle />;
  const statusClass = isPassed
    ? "border-emerald-300/25 bg-emerald-300/10 text-emerald-100"
    : isFailed
      ? "border-rose-300/25 bg-rose-300/10 text-rose-100"
      : "border-white/10 bg-slate-950/35 text-slate-300";

  return (
    <article className={`rounded-lg border p-3 ${statusClass}`}>
      <div className="flex items-center justify-between gap-3">
        <div className="inline-flex items-center gap-2 font-black">
          {icon}
          {test.name}
        </div>
        <span className="text-xs font-bold uppercase tracking-wide">
          {test.visible ? "sample" : "hidden"}
        </span>
      </div>
      <div className="mt-3 grid gap-2 text-xs leading-5 text-slate-300">
        <p>
          <span className="font-bold text-slate-100">Input:</span> {formatValue(test.input)}
        </p>
        <p>
          <span className="font-bold text-slate-100">Expected:</span> {formatValue(test.expected)}
        </p>
        {test.status !== "idle" && (
          <p>
            <span className="font-bold text-slate-100">Output:</span>{" "}
            {test.error || formatValue(test.output)}{" "}
            <span className="text-slate-500">({test.duration}ms)</span>
          </p>
        )}
      </div>
    </article>
  );
}
