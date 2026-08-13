const scores = [
  ["Communication", 4],
  ["Technical depth", 3],
  ["Problem solving", 4],
  ["Confidence", 3],
  ["Role fit", 4],
];

const chat = [
  ["Priya", "Walk me through why you reached for a Map here."],
  ["You", "Lookup is O(1), so the scan stays linear instead of nested."],
  ["Priya", "Good. What happens when the array has duplicates?"],
];

/*
 * Faithful recreation of the real session room
 * (see components/VideoRoom.jsx, ChatRoom.jsx, InterviewScorecard.jsx).
 * Swap the whole block for a captured screenshot when one exists.
 */
export default function InterviewScreen() {
  return (
    <div
      aria-hidden="true"
      className="select-none overflow-hidden rounded-md bg-[#07101d] shadow-2xl shadow-black/40 ring-1 ring-white/10"
    >
      <div className="flex items-center gap-3 border-b border-white/10 bg-[#08111f] px-4 py-2.5">
        <span className="flex gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-slate-600/60" />
          <span className="h-2.5 w-2.5 rounded-full bg-slate-600/60" />
          <span className="h-2.5 w-2.5 rounded-full bg-slate-600/60" />
        </span>
        <span className="font-mono text-[11px] text-slate-500">
          PrepTalk · Frontend Engineer · Round 2
        </span>
        <span className="ml-auto inline-flex items-center gap-1.5 rounded border border-rose-400/25 bg-rose-400/10 px-2 py-0.5">
          <span className="h-1.5 w-1.5 rounded-full bg-rose-400" />
          <span className="font-mono text-[10px] font-bold text-rose-200">LIVE 32:07</span>
        </span>
      </div>

      <div className="grid grid-cols-[1.5fr_1fr]">
        <div className="border-r border-white/10 p-4">
          <div className="grid grid-cols-2 gap-3">
            {[
              ["Priya N.", "Interviewer", "from-slate-700 to-slate-800"],
              ["You", "Interviewee", "from-slate-800 to-slate-900"],
            ].map(([name, role, tone]) => (
              <div
                key={name}
                className={`relative aspect-4/3 overflow-hidden rounded-lg bg-linear-to-br ${tone} ring-1 ring-white/10`}
              >
                <div className="absolute bottom-2 left-2">
                  <p className="text-[11px] font-bold text-white">{name}</p>
                  <p className="text-[9px] text-slate-400">{role}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-3 rounded-lg border border-white/10 bg-[#0a1322] p-3">
            <p className="font-mono text-[10px] uppercase tracking-wider text-slate-500">
              Shared workspace
            </p>
            <pre className="mt-2 overflow-hidden font-mono text-[10px] leading-[1.15rem] text-slate-300">
              <code>
                <span className="text-slate-600">// debounce — candidate draft</span>
                {"\n"}
                <span className="text-cyan-300">function</span> debounce(fn, ms) {"{"}
                {"\n"}  <span className="text-cyan-300">let</span> t;
                {"\n"}  <span className="text-cyan-300">return</span> (...args) =&gt; {"{"}
                {"\n"}    clearTimeout(t);
                {"\n"}  {"}"}
                {"\n"}
                {"}"}
              </code>
            </pre>
          </div>
        </div>

        <div className="flex flex-col">
          <div className="border-b border-white/10 p-3.5">
            <p className="font-mono text-[10px] uppercase tracking-wider text-slate-500">
              Chat
            </p>
            <div className="mt-2.5 space-y-2">
              {chat.map(([who, line]) => (
                <div key={line}>
                  <p
                    className={`text-[10px] font-bold ${
                      who === "You" ? "text-cyan-200" : "text-emerald-200"
                    }`}
                  >
                    {who}
                  </p>
                  <p className="text-[10px] leading-snug text-slate-400">{line}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="flex-1 p-3.5">
            <div className="flex items-center justify-between">
              <p className="font-mono text-[10px] uppercase tracking-wider text-slate-500">
                Scorecard
              </p>
              <span className="rounded bg-emerald-300/15 px-1.5 py-0.5 text-[9px] font-bold text-emerald-200">
                Hire
              </span>
            </div>
            <div className="mt-2.5 space-y-2">
              {scores.map(([label, value]) => (
                <div key={label}>
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] text-slate-300">{label}</span>
                    <span className="font-mono text-[10px] text-slate-500">{value}/5</span>
                  </div>
                  <div className="mt-1 flex gap-0.5">
                    {[1, 2, 3, 4, 5].map((step) => (
                      <span
                        key={step}
                        className={`h-1 flex-1 rounded-full ${
                          step <= value ? "bg-emerald-300/80" : "bg-white/10"
                        }`}
                      />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
