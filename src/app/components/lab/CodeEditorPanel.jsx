import { useRef } from "react";

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
    <section className="grid h-[30rem] min-h-0 min-w-0 grid-rows-[auto_minmax(0,1fr)] overflow-hidden lg:h-full lg:grid-rows-[3rem_minmax(0,1fr)]">
      {/* Light chrome — only the code surface below is dark */}
      <div className="flex min-w-0 flex-wrap items-center justify-between gap-2 border-b border-rule px-4 py-2 lg:flex-nowrap lg:py-0">
        <div className="flex min-w-0 items-center gap-3">
          <span className="text-sm font-semibold text-ink">Editor</span>
          <span className="chip hidden sm:inline-flex">JavaScript</span>
          <span className="hidden text-[13px] text-ink-soft md:inline">
            Keep the function name <code className="font-mono text-ink">solve</code>.
          </span>
        </div>
        <div className="flex min-w-0 flex-1 shrink-0 items-center justify-end gap-4 sm:flex-none">
          <span className="app-eyebrow tabular-nums">{formattedTime}</span>
          <button
            onClick={onExit}
            className="text-[13px] text-ink-soft underline decoration-rule decoration-1 underline-offset-4 transition-colors hover:text-accent hover:decoration-accent"
          >
            Exit
          </button>
          <button
            onClick={onSubmit}
            disabled={isRunning}
            className="btn-ink px-4 py-1.5 text-sm"
          >
            Submit
          </button>
        </div>
      </div>

      <div className="grid min-h-0 min-w-0 grid-rows-[minmax(0,1fr)_auto] overflow-hidden">
        <div className="grid min-h-0 min-w-0 grid-cols-[3rem_minmax(0,1fr)] overflow-hidden">
          <div
            ref={lineRef}
            className="min-h-0 select-none overflow-hidden border-r border-white/10 bg-[#1e1a17] py-3 text-right font-mono text-xs leading-6 text-white/35"
          >
            {lineNumbers.map((line) => (
              <div key={line} className="px-2.5">
                {line}
              </div>
            ))}
          </div>
          <div className="relative min-h-0 min-w-0 overflow-hidden bg-[#151311]">
            <pre
              ref={highlightRef}
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 overflow-hidden whitespace-pre p-3 font-mono text-sm leading-6"
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
              className="relative h-full min-h-0 w-full resize-none overflow-auto whitespace-pre bg-transparent p-3 font-mono text-sm leading-6 text-transparent caret-[#e4633f] outline-none selection:bg-[#e4633f]/30"
              aria-label="Code editor"
            />
          </div>
        </div>
        <footer className="flex flex-wrap items-center justify-between gap-3 border-t border-rule px-4 py-2.5">
          <span className="min-w-0 text-[13px] text-ink-soft">
            {lineNumbers.length} lines · Visible tests run locally. Final score is graded
            on the server.
          </span>
          <button
            onClick={() => runTests(false)}
            disabled={isRunning}
            className="btn-quiet shrink-0 px-4 py-1.5 text-sm disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isRunning ? "Running…" : "Run code"}
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
