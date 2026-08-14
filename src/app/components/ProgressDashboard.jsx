"use client";

import { useEffect, useState } from "react";
import { getJson } from "@/lib/clientApi";
import { SectionHeading } from "./ui/PageHeader";

/** @file Score averages block, shown on the dashboard for both roles. */

/** Display names for the five score keys. Order here drives render order. */
const labels = {
  communication: "Communication",
  technicalDepth: "Technical depth",
  problemSolving: "Problem solving",
  confidence: "Confidence",
  roleFit: "Role fit",
};

/**
 * Score averages across the caller's reports, as serif stat figures.
 * The API decides whose reports count — written for interviewers, received for
 * interviewees — so this component needs no role prop.
 * A failed fetch leaves `progress` null and falls through to the same empty
 * state as "no reports yet", which understates the problem but avoids putting
 * an error banner on the dashboard for a non-critical panel.
 * @returns {JSX.Element} The averages section, its empty state, or a loading line.
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
