const codeLines = [
  [
    { t: "function", c: "text-cyan-300" },
    { t: " solve", c: "text-slate-100" },
    { t: "(nums, target) {", c: "text-slate-300" },
  ],
  [
    { t: "  const", c: "text-cyan-300" },
    { t: " seen = ", c: "text-slate-300" },
    { t: "new", c: "text-cyan-300" },
    { t: " Map();", c: "text-slate-300" },
  ],
  [
    { t: "  for", c: "text-cyan-300" },
    { t: " (", c: "text-slate-300" },
    { t: "let", c: "text-cyan-300" },
    { t: " i = ", c: "text-slate-300" },
    { t: "0", c: "text-amber-300" },
    { t: "; i < nums.length; i++) {", c: "text-slate-300" },
  ],
  [
    { t: "    const", c: "text-cyan-300" },
    { t: " need = target - nums[i];", c: "text-slate-300" },
  ],
  [
    { t: "    if", c: "text-cyan-300" },
    { t: " (seen.has(need)) {", c: "text-slate-300" },
  ],
  [
    { t: "      return", c: "text-cyan-300" },
    { t: " [seen.get(need), i];", c: "text-slate-300" },
  ],
  [{ t: "    }", c: "text-slate-300" }],
  [{ t: "    seen.set(nums[i], i);", c: "text-slate-300" }],
  [{ t: "  }", c: "text-slate-300" }],
  [{ t: "}", c: "text-slate-300" }],
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
      className="select-none overflow-hidden rounded-md bg-[#07101d] shadow-2xl shadow-black/25 ring-1 ring-black/10"
    >
      <div className="flex items-center gap-3 border-b border-white/10 bg-[#08111f] px-4 py-2.5">
        <span className="flex gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-slate-600/60" />
          <span className="h-2.5 w-2.5 rounded-full bg-slate-600/60" />
          <span className="h-2.5 w-2.5 rounded-full bg-slate-600/60" />
        </span>
        <span className="font-mono text-[11px] text-slate-500">
          PrepTalk Lab · Assessment
        </span>
      </div>

      <div className="grid grid-cols-[1fr_1.55fr]">
        <div className="border-r border-white/10 bg-[#0a1322] p-5">
          <p className="text-sm font-bold text-slate-100">Pair Sum</p>
          <p className="mt-1 text-[10px] font-semibold text-slate-500">
            Medium · 40 points · 30:00
          </p>
          <p className="mt-4 text-[11px] leading-relaxed text-slate-400">
            Given an array of integers and a target, return the indices of the two
            numbers that add up to the target. Each input has exactly one solution, and
            you may not use the same element twice.
          </p>
          <div className="mt-4 rounded border border-white/10 bg-white/5 p-2.5 font-mono text-[10px] text-slate-400">
            solve([2, 7, 11, 15], 9) → [0, 1]
          </div>
          <div className="mt-5 space-y-1.5">
            {tests.map(([name, state]) => (
              <div
                key={name}
                className="flex items-center justify-between rounded border border-white/10 bg-white/5 px-2.5 py-1.5"
              >
                <span className="text-[10px] font-semibold text-slate-300">{name}</span>
                <span
                  className={`font-mono text-[10px] ${
                    state === "passed" ? "text-emerald-300" : "text-slate-500"
                  }`}
                >
                  {state}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between border-b border-white/10 bg-[#08111f] px-4 py-2">
            <span className="flex items-center gap-2.5">
              <span className="text-xs font-bold text-slate-100">Editor</span>
              <span className="rounded border border-white/10 bg-white/8 px-2 py-0.5 text-[10px] font-semibold text-slate-300">
                JavaScript
              </span>
            </span>
            <span className="flex items-center gap-2">
              <span className="rounded border border-emerald-300/25 bg-emerald-300/10 px-2 py-0.5 font-mono text-[10px] font-bold text-emerald-200">
                24:31
              </span>
              <span className="rounded bg-linear-to-r from-cyan-300 via-emerald-300 to-blue-400 px-2.5 py-0.5 text-[10px] font-black text-slate-950">
                Submit
              </span>
            </span>
          </div>

          <div className="grid grid-cols-[2.25rem_1fr]">
            <div className="border-r border-white/10 bg-[#08111f] py-3 text-right font-mono text-[11px] leading-5 text-slate-600">
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

          <div className="flex items-center justify-between gap-3 border-t border-white/10 bg-[#08111f] px-4 py-2.5">
            <span className="text-[10px] font-semibold text-slate-500">
              10 lines · Visible tests run locally. Final score is graded on the server.
            </span>
            <span className="shrink-0 whitespace-nowrap rounded border border-emerald-300/35 bg-emerald-300/10 px-2.5 py-1 text-[10px] font-bold text-emerald-200">
              Run code
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
