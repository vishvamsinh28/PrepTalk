import { FaChevronRight, FaShieldAlt } from "react-icons/fa";

export default function ChallengeList({
  activeProblemId,
  problems,
  resultsByProblem,
  selectProblem,
}) {
  return (
    <aside className="glass-panel rounded-xl p-3 lg:sticky lg:top-24 lg:self-start">
      <div className="mb-3 flex items-center justify-between px-2">
        <span className="text-xs font-bold uppercase tracking-[0.18em] text-slate-400">Challenge set</span>
        <span className="rounded-md bg-cyan-300/10 px-2 py-1 text-xs font-bold text-cyan-100">
          {problems.length}
        </span>
      </div>

      <div className="grid gap-2">
        {problems.map((problem, index) => {
          const isActive = problem.id === activeProblemId;
          const results = resultsByProblem[problem.id] || [];
          const passed = results.filter((result) => result.status === "passed").length;

          return (
            <button
              key={problem.id}
              onClick={() => selectProblem(problem.id)}
              className={`rounded-lg border p-3 text-left transition ${
                isActive
                  ? "border-cyan-300/45 bg-cyan-300/10"
                  : "border-white/10 bg-slate-950/30 hover:border-white/20 hover:bg-white/8"
              }`}
            >
              <div className="flex items-center justify-between gap-3">
                <span className="text-xs font-black text-cyan-100">0{index + 1}</span>
                <FaChevronRight className={isActive ? "text-cyan-200" : "text-slate-600"} />
              </div>
              <h2 className="mt-2 font-black text-white">{problem.title}</h2>
              <div className="mt-3 flex flex-wrap gap-2 text-xs font-bold text-slate-300">
                <span className="rounded-md bg-white/8 px-2 py-1">{problem.level}</span>
                <span className="rounded-md bg-white/8 px-2 py-1">{problem.points} pts</span>
                <span className="rounded-md bg-white/8 px-2 py-1">{passed}/{problem.tests.length}</span>
              </div>
            </button>
          );
        })}
      </div>

      <div className="mt-4 rounded-lg border border-emerald-300/20 bg-emerald-300/10 p-3">
        <div className="flex items-center gap-2 text-sm font-black text-emerald-100">
          <FaShieldAlt />
          Sandboxed runs
        </div>
        <p className="mt-2 text-xs leading-5 text-slate-300">
          Code runs in a disposable worker with blocked browser APIs and per-test timeouts.
        </p>
      </div>
    </aside>
  );
}
