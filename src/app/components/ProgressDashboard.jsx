"use client";

import { useEffect, useState } from "react";
import { getJson } from "@/lib/clientApi";
import { FaChartLine, FaSpinner } from "react-icons/fa";

const labels = {
  communication: "Communication",
  technicalDepth: "Technical",
  problemSolving: "Problem solving",
  confidence: "Confidence",
  roleFit: "Role fit",
};

export default function ProgressDashboard() {
  const [progress, setProgress] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getJson("/api/progress")
      .then(setProgress)
      .catch((error) => console.error("Progress fetch error:", error))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="glass-panel rounded-2xl p-6 text-accent">
        <FaSpinner className="mr-2 inline animate-spin" />
        Loading progress...
      </div>
    );
  }

  const averages = progress?.averages || {};

  return (
    <section className="glass-panel rounded-2xl p-6">
      <div className="mb-5 flex items-center justify-between gap-4">
        <div>
          <p className="text-sm font-bold uppercase tracking-[0.18em] text-accent">Progress</p>
          <h2 className="mt-1 text-2xl font-semibold text-ink">Score averages</h2>
        </div>
        <div className="grid h-12 w-12 place-items-center rounded-2xl bg-ink text-canvas">
          <FaChartLine />
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-5">
        {Object.entries(labels).map(([key, label]) => (
          <div key={key} className="rounded-2xl border border-rule bg-white p-3">
            <p className="text-xs text-ink-soft">{label}</p>
            <p className="mt-1 text-3xl font-semibold gradient-text">{averages[key] || 0}</p>
          </div>
        ))}
      </div>

      <p className="mt-4 text-sm text-ink-soft">
        Based on {progress?.totalReports || 0} submitted report{progress?.totalReports === 1 ? "" : "s"}.
      </p>
    </section>
  );
}
