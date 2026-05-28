import { FaLayerGroup, FaStopwatch, FaTrophy } from "react-icons/fa";

export default function ProblemPanel({ problem }) {
  return (
    <section className="glass-panel rounded-xl p-5">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <Badge icon={<FaLayerGroup />} label={problem.level} tone="amber" />
            <Badge icon={<FaStopwatch />} label={`Problem limit: ${problem.time}`} />
            <Badge icon={<FaTrophy />} label={`${problem.points} points`} />
          </div>
          <h2 className="mt-3 text-3xl font-black text-white">{problem.title}</h2>
          <p className="mt-3 max-w-3xl leading-7 text-slate-300">{problem.prompt}</p>
        </div>
      </div>
    </section>
  );
}

function Badge({ icon, label, tone = "cyan" }) {
  const className = tone === "amber"
    ? "bg-amber-300/15 text-amber-100"
    : "bg-white/8 text-slate-300";

  return (
    <span className={`inline-flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-bold ${className}`}>
      {icon}
      {label}
    </span>
  );
}
