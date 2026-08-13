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
    <span className="grid h-10 w-10 shrink-0 place-items-center rounded-lg border border-accent bg-accent/10 text-accent sm:h-12 sm:w-12">
      {icons[index % icons.length]}
    </span>
  );
}

export function Metric({ label, value }) {
  return (
    <div className="rounded-lg border border-rule bg-white p-2.5">
      <p className="text-[0.68rem] font-bold uppercase text-ink-soft">{label}</p>
      <p className="mt-0.5 text-lg font-semibold text-ink">{value}</p>
    </div>
  );
}
