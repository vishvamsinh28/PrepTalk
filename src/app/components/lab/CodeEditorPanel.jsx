import { useRef } from "react";
import { FaClock, FaCode, FaPlay } from "react-icons/fa";

export default function CodeEditorPanel({
  activeProblemId,
  code,
  formattedTime,
  isRunning,
  lineNumbers,
  onExit,
  onSubmit,
  runTests,
  setCodeByProblem,
}) {
  const highlightRef = useRef(null);
  const lineRef = useRef(null);

  const syncScroll = (event) => {
    if (highlightRef.current) {
      highlightRef.current.scrollTop = event.currentTarget.scrollTop;
      highlightRef.current.scrollLeft = event.currentTarget.scrollLeft;
    }
    if (lineRef.current) {
      lineRef.current.scrollTop = event.currentTarget.scrollTop;
    }
  };

  return (
    <section className="grid h-full min-h-0 min-w-0 grid-rows-[4.25rem_minmax(0,1fr)] overflow-hidden bg-[#07101d]">
      <div className="flex min-w-0 items-center justify-between gap-4 border-b border-white/10 bg-[#08111f] px-6">
        <div className="flex min-w-0 items-center gap-4">
          <span className="inline-flex items-center gap-2 font-black text-white"><FaCode className="text-cyan-200" /> Editor</span>
          <span className="hidden rounded-lg border border-white/10 bg-white/8 px-4 py-2 text-sm font-bold text-slate-200 sm:inline-flex">
            JavaScript
          </span>
          <span className="hidden text-xs font-semibold text-slate-400 md:inline">
            Keep the function name <code className="text-cyan-100">solve</code>.
          </span>
        </div>
        <div className="flex shrink-0 items-center gap-3">
          <span className="inline-flex items-center gap-2 rounded-md border border-emerald-300/25 bg-emerald-300/10 px-3 py-2 font-mono text-sm font-black text-emerald-100">
            <FaClock /> {formattedTime}
          </span>
          <button onClick={onExit} className="rounded-md border border-rose-300/25 bg-rose-400/10 px-4 py-2 text-sm font-bold text-rose-100">
            Exit
          </button>
          <button onClick={onSubmit} disabled={isRunning} className="rounded-md bg-linear-to-r from-cyan-300 via-emerald-300 to-blue-400 px-4 py-2 text-sm font-black text-slate-950 disabled:opacity-60">
            Submit
          </button>
        </div>
      </div>

      <div className="grid min-h-0 min-w-0 grid-rows-[minmax(0,1fr)_auto] overflow-hidden">
        <div className="grid min-h-0 min-w-0 grid-cols-[4rem_minmax(0,1fr)] overflow-hidden">
          <div ref={lineRef} className="min-h-0 select-none overflow-hidden border-r border-white/10 bg-[#08111f] py-4 text-right font-mono text-sm leading-7 text-slate-500">
            {lineNumbers.map((line) => (
              <div key={line} className="px-3">
                {line}
              </div>
            ))}
          </div>
          <div className="relative min-h-0 min-w-0 overflow-hidden bg-[#07101d]">
            <pre
              ref={highlightRef}
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 overflow-hidden whitespace-pre p-4 font-mono text-base leading-7"
            >
              <code>{highlightJavaScript(code)}</code>
            </pre>
            <textarea
              value={code}
              onChange={(event) =>
                setCodeByProblem((previous) => ({
                  ...previous,
                  [activeProblemId]: event.target.value,
                }))
              }
              onScroll={syncScroll}
              spellCheck={false}
              wrap="off"
              className="relative h-full min-h-0 w-full resize-none overflow-auto whitespace-pre bg-transparent p-4 font-mono text-base leading-7 text-transparent caret-cyan-100 outline-none selection:bg-cyan-300/25"
              aria-label="Code editor"
            />
          </div>
        </div>
        <footer className="flex flex-wrap items-center justify-between gap-3 border-t border-white/10 bg-[#08111f] px-6 py-3">
          <div className="flex min-w-0 flex-wrap items-center gap-x-6 gap-y-2 text-sm font-semibold text-slate-400">
            <span>{lineNumbers.length} lines</span>
            <span>Visible tests run locally. Final score is graded on the server. Do not rename <code className="text-cyan-100">solve</code>.</span>
          </div>
          <button
            onClick={() => runTests(false)}
            disabled={isRunning}
            className="inline-flex shrink-0 items-center gap-2 rounded-lg border border-emerald-300/35 bg-emerald-300/10 px-5 py-2 font-black text-emerald-100 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <FaPlay />
            {isRunning ? "Running..." : "Run Code"}
          </button>
        </footer>
      </div>
    </section>
  );
}

function highlightJavaScript(code) {
  const tokens = [];
  const pattern = /(\/\/.*|\/\*[\s\S]*?\*\/|"(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*'|`(?:\\.|[^`\\])*`|\b(?:async|await|break|case|catch|class|const|continue|default|else|false|for|function|if|let|new|null|return|switch|throw|true|try|typeof|undefined|var|while)\b|\b\d+(?:\.\d+)?\b|[{}()[\].,;:+\-*/%=<>!&|?]+)/g;
  let lastIndex = 0;
  let match;

  while ((match = pattern.exec(code)) !== null) {
    if (match.index > lastIndex) {
      tokens.push(<span key={`text-${lastIndex}`} className="text-cyan-50">{code.slice(lastIndex, match.index)}</span>);
    }

    const value = match[0];
    tokens.push(
      <span key={`${match.index}-${value}`} className={tokenClass(value)}>
        {value}
      </span>
    );
    lastIndex = match.index + value.length;
  }

  if (lastIndex < code.length) {
    tokens.push(<span key={`text-${lastIndex}`} className="text-cyan-50">{code.slice(lastIndex)}</span>);
  }

  return tokens.length ? tokens : <span className="text-cyan-50"> </span>;
}

function tokenClass(value) {
  if (value.startsWith("//") || value.startsWith("/*")) return "text-slate-500";
  if (value.startsWith("\"") || value.startsWith("'") || value.startsWith("`")) return "text-emerald-200";
  if (/^\d/.test(value)) return "text-amber-200";
  if (/^[{}()[\].,;:+\-*/%=<>!&|?]+$/.test(value)) return "text-slate-300";
  if (["true", "false", "null", "undefined"].includes(value)) return "text-rose-200";
  return "text-cyan-200";
}
