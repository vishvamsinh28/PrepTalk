import { FaBookmark } from "react-icons/fa";

export default function ProblemPanel({ problem, panelWidth = 560 }) {
  const isNarrow = panelWidth < 460;
  const isTight = panelWidth < 400;

  return (
    <section className={`min-h-0 overflow-visible bg-slate-950/35 px-4 py-4 text-slate-50 sm:px-5 sm:py-5 lg:overflow-y-auto ${isTight ? "lg:px-5 lg:py-5" : isNarrow ? "lg:px-6 lg:py-6" : "lg:px-7 lg:py-6"}`}>
      <div className={`mb-5 flex min-w-0 items-start gap-3 lg:mb-6 ${isNarrow ? "lg:gap-3" : "lg:gap-4"}`}>
        <FaBookmark className={`${isNarrow ? "lg:text-2xl" : "lg:text-3xl"} mt-1 shrink-0 text-2xl text-cyan-200`} />
        <div className="min-w-0">
          <h1 className={`${isTight ? "lg:text-2xl lg:leading-8" : isNarrow ? "lg:text-3xl lg:leading-10" : "lg:text-3xl"} break-words text-2xl font-black leading-tight tracking-tight [overflow-wrap:anywhere]`}>
            {problem.title}
          </h1>
          <p className="mt-2 text-xs font-bold text-slate-400 sm:text-sm">{problem.level} · {problem.points} points · {problem.time}</p>
        </div>
      </div>
      <div className={`problem-copy max-w-[42rem] whitespace-pre-wrap text-sm leading-6 text-slate-200 sm:text-base sm:leading-7 ${isNarrow ? "lg:text-base lg:leading-7" : "lg:text-base lg:leading-7"}`}>
        {problem.prompt}
      </div>
      <div className="mt-5 max-w-[42rem] lg:mt-7">
        <h2 className="mb-2 text-lg font-black">Example</h2>
        <div className="rounded-lg border border-white/10 bg-white/5 p-3 text-slate-300 sm:p-4">
          <p className="font-mono text-xs leading-5 sm:leading-6">Array input is passed as <b>solve(...input)</b>, so <b>[1, {"{"}x: 2{"}"}]</b> calls <b>solve(1, {"{"}x: 2{"}"})</b>. Other input is passed as <b>solve(input)</b>. Do not rename <b>solve</b>.</p>
          <p className="mt-2 text-xs leading-5 text-slate-400 sm:leading-6">Run code to check visible test cases before submitting.</p>
        </div>
      </div>
    </section>
  );
}
