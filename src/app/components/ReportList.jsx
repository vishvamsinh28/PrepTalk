"use client";

import { useEffect, useState } from "react";
import { deleteJson, getJson } from "@/lib/clientApi";

const scoreLabels = {
  communication: "Communication",
  technicalDepth: "Technical depth",
  problemSolving: "Problem solving",
  confidence: "Confidence",
  roleFit: "Role fit",
};

export default function ReportList() {
  const [reports, setReports] = useState([]);
  const [canDeleteReports, setCanDeleteReports] = useState(false);
  const [deletingId, setDeletingId] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReports = async () => {
      try {
        const response = await getJson("/api/reports");
        setReports(response.reports || []);
        setCanDeleteReports(Boolean(response.canDeleteReports));
      } catch (error) {
        console.error("Error fetching reports:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchReports();
  }, []);

  const deleteReport = async (report) => {
    if (!window.confirm(`Delete report for ${report.intervieweeEmail}?`)) return;

    setDeletingId(report._id);
    try {
      await deleteJson("/api/reports", { reportId: report._id });
      setReports((current) => current.filter((item) => item._id !== report._id));
    } catch (error) {
      console.error("Report delete failed:", error);
    } finally {
      setDeletingId("");
    }
  };

  if (loading) {
    return <p className="app-eyebrow py-8">Loading reports…</p>;
  }

  if (reports.length === 0) {
    return (
      <div className="border-y border-rule py-14 text-center">
        <p className="app-h3">No reports yet.</p>
        <p className="mt-2 text-sm text-ink-soft">
          Completed interview scorecards will appear here.
        </p>
      </div>
    );
  }

  return (
    <ul>
      {reports.map((report) => (
        <li key={report._id} className="row-hair px-1 py-7">
          <div className="flex flex-wrap items-baseline justify-between gap-4">
            <div className="min-w-0">
              <h3 className="app-h3">
                {report.recommendation}
                <span className="ml-3 text-sm font-normal text-ink-soft">
                  {report.intervieweeEmail}
                </span>
              </h3>
            </div>
            <div className="flex items-center gap-5 text-[13px]">
              <time className="text-ink-soft">
                {new Date(report.createdAt).toLocaleDateString()}
              </time>
              {canDeleteReports && (
                <button
                  type="button"
                  onClick={() => deleteReport(report)}
                  disabled={deletingId === report._id}
                  className="text-ink-soft underline decoration-rule decoration-1 underline-offset-4 transition-colors hover:text-accent hover:decoration-accent disabled:opacity-50"
                >
                  {deletingId === report._id ? "Deleting…" : "Delete"}
                </button>
              )}
            </div>
          </div>

          <dl className="mt-5 flex flex-wrap gap-x-12 gap-y-4">
            {Object.entries(report.scores || {}).map(([name, score]) => (
              <div key={name}>
                <dt className="app-eyebrow">{scoreLabels[name] || name}</dt>
                <dd className="landing-serif mt-1 text-[1.5rem] leading-none text-ink">
                  {score}
                  <span className="ml-0.5 text-sm text-ink-soft">/5</span>
                </dd>
              </div>
            ))}
          </dl>

          <div className="mt-5 grid gap-6 text-sm md:grid-cols-2">
            <div>
              <p className="app-eyebrow">Strengths</p>
              <p className="mt-2 whitespace-pre-wrap leading-[1.7] text-ink-soft">
                {report.strengths}
              </p>
            </div>
            <div>
              <p className="app-eyebrow">Next improvements</p>
              <p className="mt-2 whitespace-pre-wrap leading-[1.7] text-ink-soft">
                {report.improvements}
              </p>
            </div>
          </div>

          {report.aiSummary && (
            <div className="mt-5 border-l-2 border-accent pl-4">
              <p className="app-eyebrow">Summary</p>
              <p className="mt-2 whitespace-pre-wrap text-sm leading-[1.7] text-ink">
                {report.aiSummary}
              </p>
              {report.actionItems?.length > 0 && (
                <ul className="mt-3 space-y-1.5 text-sm text-ink-soft">
                  {report.actionItems.map((item) => (
                    <li key={item} className="flex gap-3">
                      <span className="mt-2.5 h-px w-3 shrink-0 bg-accent" />
                      {item}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}
        </li>
      ))}
    </ul>
  );
}
