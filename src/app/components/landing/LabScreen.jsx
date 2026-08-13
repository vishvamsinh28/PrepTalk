const codeLines = [
  [
    { t: "function", c: "text-[#e4633f]" },
    { t: " solve", c: "text-[#f4f1ea]" },
    { t: "(nums, target) {", c: "text-white/70" },
  ],
  [
    { t: "  const", c: "text-[#e4633f]" },
    { t: " seen = ", c: "text-white/70" },
    { t: "new", c: "text-[#e4633f]" },
    { t: " Map();", c: "text-white/70" },
  ],
  [
    { t: "  for", c: "text-[#e4633f]" },
    { t: " (", c: "text-white/70" },
    { t: "let", c: "text-[#e4633f]" },
    { t: " i = ", c: "text-white/70" },
    { t: "0", c: "text-[#d9a441]" },
    { t: "; i < nums.length; i++) {", c: "text-white/70" },
  ],
  [
    { t: "    const", c: "text-[#e4633f]" },
    { t: " need = target - nums[i];", c: "text-white/70" },
  ],
  [
    { t: "    if", c: "text-[#e4633f]" },
    { t: " (seen.has(need)) {", c: "text-white/70" },
  ],
  [
    { t: "      return", c: "text-[#e4633f]" },
    { t: " [seen.get(need), i];", c: "text-white/70" },
  ],
  [{ t: "    }", c: "text-white/70" }],
  [{ t: "    seen.set(nums[i], i);", c: "text-white/70" }],
  [{ t: "  }", c: "text-white/70" }],
  [{ t: "}", c: "text-white/70" }],
];

const tests = [
  ["Sample 1", "passed"],
  ["Sample 2", "passed"],
  ["Hidden tests", "on submit"],
];

/*
 * Faithful recreation of the real Lab assessment screen
 * (see components/lab/ProblemPanel.jsx + CodeEditorPanel.jsx).
 * Swap the whole block for a captured screenshot when one exists.
 */
export default function LabScreen() {
  return (
    <div
      aria-hidden="true"
      className="select-none overflow-hidden rounded-[3px] bg-[#151311] shadow-2xl shadow-black/25 ring-1 ring-black/10"
    >
      <div className="flex items-center gap-3 border-b border-white/10 bg-[#1e1a17] px-4 py-2.5">
        <span className="flex gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-white/25" />
          <span className="h-2.5 w-2.5 rounded-full bg-white/25" />
          <span className="h-2.5 w-2.5 rounded-full bg-white/25" />
        </span>
        <span className="font-mono text-[11px] text-white/40">
          PrepTalk Lab · Assessment
        </span>
      </div>

      <div className="grid grid-cols-[1fr_1.55fr]">
        <div className="border-r border-white/10 bg-[#1e1a17] p-5">
          <p className="text-sm font-bold text-[#f4f1ea]">Pair Sum</p>
          <p className="mt-1 text-[10px] font-semibold text-white/40">
            Medium · 40 points · 30:00
          </p>
          <p className="mt-4 text-[11px] leading-relaxed text-white/50">
            Given an array of integers and a target, return the indices of the two
            numbers that add up to the target. Each input has exactly one solution, and
            you may not use the same element twice.
          </p>
          <div className="mt-4 rounded border border-white/10 bg-white/5 p-2.5 font-mono text-[10px] text-white/50">
            solve([2, 7, 11, 15], 9) → [0, 1]
          </div>
          <div className="mt-5 space-y-1.5">
            {tests.map(([name, state]) => (
              <div
                key={name}
                className="flex items-center justify-between rounded border border-white/10 bg-white/5 px-2.5 py-1.5"
              >
                <span className="text-[10px] font-semibold text-white/70">{name}</span>
                <span
                  className={`font-mono text-[10px] ${
                    state === "passed" ? "text-[#9db87f]" : "text-white/40"
                  }`}
                >
                  {state}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between border-b border-white/10 bg-[#1e1a17] px-4 py-2">
            <span className="flex items-center gap-2.5">
              <span className="text-xs font-bold text-[#f4f1ea]">Editor</span>
              <span className="rounded border border-white/10 bg-white/8 px-2 py-0.5 text-[10px] font-semibold text-white/70">
                JavaScript
              </span>
            </span>
            <span className="flex items-center gap-2">
              <span className="rounded border border-[#9db87f]/40 bg-[#9db87f]/15 px-2 py-0.5 font-mono text-[10px] font-bold text-[#9db87f]">
                24:31
              </span>
              <span className="rounded bg-accent px-2.5 py-0.5 text-[10px] font-bold text-white">
                Submit
              </span>
            </span>
          </div>

          <div className="grid grid-cols-[2.25rem_1fr]">
            <div className="border-r border-white/10 bg-[#1e1a17] py-3 text-right font-mono text-[11px] leading-5 text-white/30">
              {codeLines.map((_, i) => (
                <div key={i} className="pr-2.5">
                  {i + 1}
                </div>
              ))}
            </div>
            <pre className="overflow-hidden p-3 font-mono text-[11px] leading-5">
              <code>
                {codeLines.map((line, i) => (
                  <div key={i}>
                    {line.map((seg, j) => (
                      <span key={j} className={seg.c}>
                        {seg.t}
                      </span>
                    ))}
                  </div>
                ))}
              </code>
            </pre>
          </div>

          <div className="flex items-center justify-between gap-3 border-t border-white/10 bg-[#1e1a17] px-4 py-2.5">
            <span className="text-[10px] font-semibold text-white/40">
              10 lines · Visible tests run locally. Final score is graded on the server.
            </span>
            <span className="shrink-0 whitespace-nowrap rounded border border-[#9db87f]/40 bg-[#9db87f]/15 px-2.5 py-1 text-[10px] font-bold text-[#9db87f]">
              Run code
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
