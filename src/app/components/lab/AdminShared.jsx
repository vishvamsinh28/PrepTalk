"use client";

import { FaCode, FaDatabase, FaPuzzlePiece } from "react-icons/fa";

export function Toast({ tone, text }) {
  const classes = tone === "success" ? "border-[#b7e4c7] bg-[#edf9f1] text-[#1f7a3b]" : "border-[#f1b6b6] bg-[#fff1f1] text-[#b42318]";
  return (
    <div className={`min-h-12 w-full max-w-sm rounded-lg border px-4 py-3 text-sm font-bold shadow-lg ${classes}`} role="status">
      {text}
    </div>
  );
}

export function SkillIcon({ index }) {
  const icons = [<FaPuzzlePiece key="p" />, <FaCode key="c" />, <FaDatabase key="d" />];
  return (
    <span className="grid h-12 w-12 shrink-0 place-items-center rounded-xl border border-cyan-300/25 bg-cyan-300/10 text-cyan-100 sm:h-14 sm:w-14">
      {icons[index % icons.length]}
    </span>
  );
}

export function Metric({ label, value }) {
  return (
    <div className="rounded-lg border border-white/10 bg-slate-950/35 p-3">
      <p className="text-xs font-bold uppercase text-slate-400">{label}</p>
      <p className="mt-1 text-xl font-black text-white">{value}</p>
    </div>
  );
}
