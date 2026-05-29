import { FaBookmark } from "react-icons/fa";

export default function ProblemPanel({ problem, panelWidth = 560 }) {
  const isNarrow = panelWidth < 460;
  const isTight = panelWidth < 400;

  return (
    <section className={`min-h-0 overflow-y-auto bg-slate-950/35 text-slate-50 ${isTight ? "px-5 py-5" : isNarrow ? "px-6 py-6" : "px-8 py-7"}`}>
      <div className={`mb-7 flex min-w-0 items-start ${isNarrow ? "gap-3" : "gap-5"}`}>
        <FaBookmark className={`${isNarrow ? "mt-1 text-2xl" : "mt-2 text-3xl"} shrink-0 text-cyan-200`} />
        <div className="min-w-0">
          <h1 className={`${isTight ? "text-2xl leading-8" : isNarrow ? "text-3xl leading-10" : "text-4xl"} break-words font-black tracking-tight [overflow-wrap:anywhere]`}>
            {problem.title}
          </h1>
          <p className="mt-3 text-sm font-bold text-slate-400">{problem.level} · {problem.points} points · {problem.time}</p>
        </div>
      </div>
      <div className={`problem-copy max-w-[42rem] whitespace-pre-wrap text-slate-200 ${isNarrow ? "text-base leading-7" : "text-lg leading-8"}`}>
        {problem.prompt}
      </div>
      <div className={`${isNarrow ? "mt-8" : "mt-10"} max-w-[42rem]`}>
        <h2 className={`${isNarrow ? "text-lg" : "text-xl"} mb-3 font-black`}>Example</h2>
        <div className={`rounded-lg border border-white/10 bg-white/5 text-slate-300 ${isNarrow ? "p-4" : "p-5"}`}>
          <p className={`font-mono ${isNarrow ? "text-xs leading-6" : "text-sm"}`}>Array input is passed as <b>solve(...input)</b>, so <b>[1, {"{"}x: 2{"}"}]</b> calls <b>solve(1, {"{"}x: 2{"}"})</b>. Other input is passed as <b>solve(input)</b>. Do not rename <b>solve</b>.</p>
          <p className={`mt-3 text-slate-400 ${isNarrow ? "text-xs leading-6" : "text-sm"}`}>Run code to check visible test cases before submitting.</p>
        </div>
      </div>
    </section>
  );
}
