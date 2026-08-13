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
    <section className="grid h-[34rem] min-h-0 min-w-0 grid-rows-[auto_minmax(0,1fr)] overflow-hidden bg-[#151311] lg:h-full lg:grid-rows-[4rem_minmax(0,1fr)]">
      <div className="flex min-w-0 flex-wrap items-center justify-between gap-2 border-b border-white/10 bg-[#1e1a17] px-3 py-3 sm:px-4 lg:flex-nowrap lg:px-5 lg:py-0">
        <div className="flex min-w-0 items-center gap-2 sm:gap-3">
          <span className="inline-flex items-center gap-2 font-semibold text-white"><FaCode className="text-[#e4633f]" /> Editor</span>
          <span className="hidden rounded-[4px] border border-white/10 bg-white/8 px-4 py-2 text-sm font-bold text-white/85 sm:inline-flex">
            JavaScript
          </span>
          <span className="hidden text-xs font-semibold text-white/50 md:inline">
            Keep the function name <code className="text-[#e4633f]">solve</code>.
          </span>
        </div>
        <div className="flex min-w-0 flex-1 shrink-0 items-center justify-end gap-2 sm:flex-none">
          <span className="inline-flex items-center gap-1.5 rounded-[3px] border border-[#9db87f]/40 bg-[#9db87f]/15 px-2.5 py-2 font-mono text-xs font-semibold text-[#9db87f] sm:text-sm">
            <FaClock /> {formattedTime}
          </span>
          <button onClick={onExit} className="rounded-[3px] border border-accent/40 bg-accent/15 px-3 py-2 text-xs font-bold text-[#e4633f] sm:text-sm">
            Exit
          </button>
          <button onClick={onSubmit} disabled={isRunning} className="rounded-[3px] bg-accent px-3 py-2 text-xs font-semibold text-white disabled:opacity-60 sm:text-sm">
            Submit
          </button>
        </div>
      </div>

      <div className="grid min-h-0 min-w-0 grid-rows-[minmax(0,1fr)_auto] overflow-hidden">
        <div className="grid min-h-0 min-w-0 grid-cols-[3rem_minmax(0,1fr)] overflow-hidden lg:grid-cols-[3.5rem_minmax(0,1fr)]">
          <div ref={lineRef} className="min-h-0 select-none overflow-hidden border-r border-white/10 bg-[#1e1a17] py-3 text-right font-mono text-xs leading-6 text-white/40 sm:text-sm lg:leading-7">
            {lineNumbers.map((line) => (
              <div key={line} className="px-2 sm:px-3">
                {line}
              </div>
            ))}
          </div>
          <div className="relative min-h-0 min-w-0 overflow-hidden bg-[#151311]">
            <pre
              ref={highlightRef}
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 overflow-hidden whitespace-pre p-3 font-mono text-sm leading-6 sm:text-base lg:leading-7"
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
              className="relative h-full min-h-0 w-full resize-none overflow-auto whitespace-pre bg-transparent p-3 font-mono text-sm leading-6 text-transparent caret-[#e4633f] outline-none selection:bg-[#e4633f]/30 sm:text-base lg:leading-7"
              aria-label="Code editor"
            />
          </div>
        </div>
        <footer className="flex flex-wrap items-center justify-between gap-3 border-t border-white/10 bg-[#1e1a17] px-3 py-3 sm:px-4 lg:px-5">
          <div className="flex min-w-0 flex-wrap items-center gap-x-4 gap-y-2 text-xs font-semibold text-white/50 sm:text-sm">
            <span>{lineNumbers.length} lines</span>
            <span>Visible tests run locally. Final score is graded on the server. Do not rename <code className="text-[#e4633f]">solve</code>.</span>
          </div>
          <button
            onClick={() => runTests(false)}
            disabled={isRunning}
            className="inline-flex shrink-0 items-center gap-2 rounded-[4px] border border-[#9db87f]/40 bg-[#9db87f]/15 px-4 py-2 text-sm font-semibold text-[#9db87f] disabled:cursor-not-allowed disabled:opacity-50"
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
      tokens.push(<span key={`text-${lastIndex}`} className="text-white/85">{code.slice(lastIndex, match.index)}</span>);
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
    tokens.push(<span key={`text-${lastIndex}`} className="text-white/85">{code.slice(lastIndex)}</span>);
  }

  return tokens.length ? tokens : <span className="text-white/85"> </span>;
}

function tokenClass(value) {
  if (value.startsWith("//") || value.startsWith("/*")) return "text-white/40";
  if (value.startsWith("\"") || value.startsWith("'") || value.startsWith("`")) return "text-[#9db87f]";
  if (/^\d/.test(value)) return "text-amber-200";
  if (/^[{}()[\].,;:+\-*/%=<>!&|?]+$/.test(value)) return "text-white/70";
  if (["true", "false", "null", "undefined"].includes(value)) return "text-[#e4633f]";
  return "text-[#e4633f]";
}
