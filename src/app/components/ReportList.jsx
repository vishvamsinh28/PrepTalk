"use client";

import { useEffect, useState } from "react";
import { deleteJson, getJson } from "@/lib/clientApi";
import { FaClipboardCheck, FaSpinner, FaTrash } from "react-icons/fa";

const scoreLabels = {
  communication: "Communication",
  technicalDepth: "Technical",
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
    return (
      <div className="flex items-center justify-center gap-2 text-accent">
        <FaSpinner className="animate-spin" />
        <span>Loading reports...</span>
      </div>
    );
  }

  if (reports.length === 0) {
    return (
      <div className="glass-panel rounded-2xl p-8 text-center">
        <FaClipboardCheck className="mx-auto mb-3 text-4xl text-accent" />
        <p className="text-lg font-bold text-ink">No reports yet.</p>
        <p className="text-sm text-ink-soft">Completed interview scorecards will appear here.</p>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {reports.map((report) => (
        <article key={report._id} className="glass-panel rounded-2xl p-6">
          <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between mb-4">
            <div>
              <h3 className="text-xl font-semibold text-ink">{report.recommendation}</h3>
              <p className="text-sm text-ink-soft">{report.intervieweeEmail}</p>
            </div>
            <div className="flex flex-wrap items-center gap-2 md:justify-end">
              <p className="text-xs text-ink-soft">
                {new Date(report.createdAt).toLocaleDateString()}
              </p>
              {canDeleteReports && (
                <button
                  type="button"
                  onClick={() => deleteReport(report)}
                  disabled={deletingId === report._id}
                  className="inline-flex min-h-9 items-center justify-center gap-2 rounded-lg border border-rose-600/40 bg-rose-50 px-3 py-2 text-xs font-bold text-rose-700 disabled:opacity-60"
                >
                  <FaTrash />
                  {deletingId === report._id ? "Deleting..." : "Delete"}
                </button>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-5">
            {Object.entries(report.scores || {}).map(([name, score]) => (
              <div key={name} className="rounded-2xl border border-rule bg-white p-3">
                <p className="text-xs text-ink-soft">{scoreLabels[name] || name}</p>
                <p className="text-2xl font-semibold gradient-text">{score}</p>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <p className="mb-1 font-bold text-ink">Strengths</p>
              <p className="whitespace-pre-wrap text-ink-soft">{report.strengths}</p>
            </div>
            <div>
              <p className="mb-1 font-bold text-ink">Next improvements</p>
              <p className="whitespace-pre-wrap text-ink-soft">{report.improvements}</p>
            </div>
          </div>

          {report.aiSummary && (
            <div className="mt-5 rounded-2xl border border-accent bg-accent/10 p-4">
              <p className="mb-2 font-semibold text-accent">AI summary</p>
              <p className="whitespace-pre-wrap text-sm leading-6 text-ink">{report.aiSummary}</p>
              {report.actionItems?.length > 0 && (
                <ul className="mt-3 space-y-1 text-sm text-ink">
                  {report.actionItems.map((item) => <li key={item}>- {item}</li>)}
                </ul>
              )}
            </div>
          )}
        </article>
      ))}
    </div>
  );
}
