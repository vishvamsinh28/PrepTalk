"use client";

import { useEffect, useState } from "react";
import { getJson } from "@/lib/clientApi";
import { SectionHeading } from "./ui/PageHeader";

const labels = {
  communication: "Communication",
  technicalDepth: "Technical depth",
  problemSolving: "Problem solving",
  confidence: "Confidence",
  roleFit: "Role fit",
};

/**
 * Score averages across submitted reports as serif stat figures.
 */
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
    return <p className="app-eyebrow py-8">Loading progress…</p>;
  }

  const averages = progress?.averages || {};
  const total = progress?.totalReports || 0;

  return (
    <section>
      <SectionHeading
        eyebrow="Progress"
        title="Score averages"
        action={
          <p className="text-sm text-ink-soft">
            Across {total} report{total === 1 ? "" : "s"}
          </p>
        }
      />

      {total === 0 ? (
        <div className="border-y border-rule py-14 text-center">
          <p className="app-h3">No scored sessions yet.</p>
          <p className="mt-2 text-sm text-ink-soft">
            Averages appear here once an interviewer submits a scorecard.
          </p>
        </div>
      ) : (
        <dl className="flex flex-wrap gap-x-16 gap-y-6 border-t border-rule pt-8">
          {Object.entries(labels).map(([key, label]) => (
            <div key={key}>
              <dt className="app-eyebrow">{label}</dt>
              <dd className="landing-serif mt-2 text-[2.25rem] leading-none text-ink">
                {averages[key] ?? 0}
                <span className="ml-1 align-baseline text-base text-ink-soft">/5</span>
              </dd>
            </div>
          ))}
        </dl>
      )}
    </section>
  );
}
