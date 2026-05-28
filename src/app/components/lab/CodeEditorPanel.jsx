import { FaCode, FaPlay, FaRocket } from "react-icons/fa";

export default function CodeEditorPanel({
  activeProblemId,
  code,
  isRunning,
  lineNumbers,
  runTests,
  setCodeByProblem,
}) {
  return (
    <section className="overflow-hidden rounded-xl border border-cyan-300/15 bg-[#07101d] shadow-2xl shadow-black/35">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 bg-[#0b1423] px-4 py-3">
        <div>
          <div className="inline-flex items-center gap-2 text-sm font-black text-white">
            <FaCode className="text-cyan-200" />
            Solution editor
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <span className="rounded-md border border-cyan-300/20 bg-cyan-300/10 px-3 py-2 text-sm font-bold text-cyan-100">
            JavaScript
          </span>
          <button
            onClick={() => runTests(false)}
            disabled={isRunning}
            className="inline-flex items-center gap-2 rounded-md border border-cyan-300/35 bg-cyan-300/10 px-3 py-2 text-sm font-black text-cyan-100 transition hover:bg-cyan-300/15 disabled:cursor-not-allowed disabled:opacity-45"
          >
            <FaPlay />
            Run
          </button>
          <button
            onClick={() => runTests(true)}
            disabled={isRunning}
            className="inline-flex items-center gap-2 rounded-md bg-linear-to-r from-cyan-300 via-emerald-300 to-blue-400 px-3 py-2 text-sm font-black text-slate-950 shadow-lg shadow-cyan-500/20 transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-45"
          >
            <FaRocket />
            Submit
          </button>
        </div>
      </div>

      <div className="border-b border-white/10 bg-[#08111f] px-4 py-2">
        <div className="flex items-center gap-2">
          <span className="h-3 w-3 rounded-full bg-rose-400" />
          <span className="h-3 w-3 rounded-full bg-amber-300" />
          <span className="h-3 w-3 rounded-full bg-emerald-300" />
          <span className="ml-3 rounded-md border border-white/10 bg-white/8 px-2 py-1 font-mono text-xs text-slate-300">
            solution.js
          </span>
        </div>
      </div>

      <div className="grid h-[36rem] min-h-[32rem] grid-cols-[3.5rem_minmax(0,1fr)] overflow-hidden">
        <div className="select-none overflow-y-hidden border-r border-white/10 bg-[#091220] py-4 text-right font-mono text-sm leading-6 text-slate-500">
          {lineNumbers.map((line) => (
            <div key={line} className="px-3">
              {line}
            </div>
          ))}
        </div>
        <textarea
          value={code}
          onChange={(event) =>
            setCodeByProblem((previous) => ({
              ...previous,
              [activeProblemId]: event.target.value,
            }))
          }
          spellCheck={false}
          wrap="off"
          className="h-full min-h-0 w-full resize-none overflow-auto whitespace-pre bg-[#07101d] p-4 font-mono text-sm leading-6 text-cyan-50 outline-none selection:bg-cyan-300/25"
          aria-label="Code editor"
        />
      </div>
    </section>
  );
}
