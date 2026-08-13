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
      className="select-none overflow-hidden rounded-[3px] bg-[#151311] shadow-2xl shadow-black/40 ring-1 ring-white/10"
    >
      <div className="flex items-center gap-3 border-b border-white/10 bg-[#1e1a17] px-4 py-2.5">
        <span className="flex gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-white/25" />
          <span className="h-2.5 w-2.5 rounded-full bg-white/25" />
          <span className="h-2.5 w-2.5 rounded-full bg-white/25" />
        </span>
        <span className="font-mono text-[11px] text-white/40">
          PrepTalk · Frontend Engineer · Round 2
        </span>
        <span className="ml-auto inline-flex items-center gap-1.5 rounded border border-accent/40 bg-accent/15 px-2 py-0.5">
          <span className="h-1.5 w-1.5 rounded-full bg-accent" />
          <span className="font-mono text-[10px] font-bold text-[#e4633f]">LIVE 32:07</span>
        </span>
      </div>

      <div className="grid grid-cols-[1.5fr_1fr]">
        <div className="border-r border-white/10 p-4">
          <div className="grid grid-cols-2 gap-3">
            {[
              ["Priya N.", "Interviewer", "from-[#2c2620] to-[#1e1a17]"],
              ["You", "Interviewee", "from-[#241f1a] to-[#17140f]"],
            ].map(([name, role, tone]) => (
              <div
                key={name}
                className={`relative aspect-4/3 overflow-hidden rounded-[4px] bg-linear-to-br ${tone} ring-1 ring-white/10`}
              >
                <div className="absolute bottom-2 left-2">
                  <p className="text-[11px] font-bold text-white">{name}</p>
                  <p className="text-[9px] text-white/50">{role}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-3 rounded-[4px] border border-white/10 bg-[#1e1a17] p-3">
            <p className="font-mono text-[10px] uppercase tracking-wider text-white/40">
              Shared workspace
            </p>
            <pre className="mt-2 overflow-hidden font-mono text-[10px] leading-[1.15rem] text-white/70">
              <code>
                <span className="text-white/30">// debounce — candidate draft</span>
                {"\n"}
                <span className="text-[#e4633f]">function</span> debounce(fn, ms) {"{"}
                {"\n"}  <span className="text-[#e4633f]">let</span> t;
                {"\n"}  <span className="text-[#e4633f]">return</span> (...args) =&gt; {"{"}
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
            <p className="font-mono text-[10px] uppercase tracking-wider text-white/40">
              Chat
            </p>
            <div className="mt-2.5 space-y-2">
              {chat.map(([who, line]) => (
                <div key={line}>
                  <p
                    className={`text-[10px] font-bold ${
                      who === "You" ? "text-[#e4633f]" : "text-[#9db87f]"
                    }`}
                  >
                    {who}
                  </p>
                  <p className="text-[10px] leading-snug text-white/50">{line}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="flex-1 p-3.5">
            <div className="flex items-center justify-between">
              <p className="font-mono text-[10px] uppercase tracking-wider text-white/40">
                Scorecard
              </p>
              <span className="rounded bg-[#9db87f]/15 px-1.5 py-0.5 text-[9px] font-bold text-[#9db87f]">
                Hire
              </span>
            </div>
            <div className="mt-2.5 space-y-2">
              {scores.map(([label, value]) => (
                <div key={label}>
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] text-white/70">{label}</span>
                    <span className="font-mono text-[10px] text-white/40">{value}/5</span>
                  </div>
                  <div className="mt-1 flex gap-0.5">
                    {[1, 2, 3, 4, 5].map((step) => (
                      <span
                        key={step}
                        className={`h-1 flex-1 rounded-full ${
                          step <= value ? "bg-[#9db87f]" : "bg-white/10"
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
