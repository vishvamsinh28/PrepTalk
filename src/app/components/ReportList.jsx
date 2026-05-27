"use client";

import { useEffect, useState } from "react";
import { getJson } from "@/lib/clientApi";
import { FaClipboardCheck, FaSpinner } from "react-icons/fa";

const scoreLabels = {
  communication: "Communication",
  technicalDepth: "Technical",
  problemSolving: "Problem solving",
  confidence: "Confidence",
  roleFit: "Role fit",
};

export default function ReportList() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReports = async () => {
      try {
        const response = await getJson("/api/reports");
        setReports(response.reports || []);
      } catch (error) {
        console.error("Error fetching reports:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchReports();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center gap-2 text-cyan-200">
        <FaSpinner className="animate-spin" />
        <span>Loading reports...</span>
      </div>
    );
  }

  if (reports.length === 0) {
    return (
      <div className="glass-panel rounded-3xl p-8 text-center">
        <FaClipboardCheck className="mx-auto mb-3 text-4xl text-cyan-200" />
        <p className="text-lg font-bold text-white">No reports yet.</p>
        <p className="text-sm text-slate-300">Completed interview scorecards will appear here.</p>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {reports.map((report) => (
        <article key={report._id} className="glass-panel rounded-3xl p-6">
          <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-3 mb-4">
            <div>
              <h3 className="text-xl font-black text-white">{report.recommendation}</h3>
              <p className="text-sm text-slate-300">{report.intervieweeEmail}</p>
            </div>
            <p className="text-xs text-slate-400">
              {new Date(report.createdAt).toLocaleDateString()}
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-5">
            {Object.entries(report.scores || {}).map(([name, score]) => (
              <div key={name} className="rounded-2xl border border-white/10 bg-slate-950/35 p-3">
                <p className="text-xs text-slate-400">{scoreLabels[name] || name}</p>
                <p className="text-2xl font-black gradient-text">{score}</p>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <p className="mb-1 font-bold text-slate-100">Strengths</p>
              <p className="whitespace-pre-wrap text-slate-300">{report.strengths}</p>
            </div>
            <div>
              <p className="mb-1 font-bold text-slate-100">Next improvements</p>
              <p className="whitespace-pre-wrap text-slate-300">{report.improvements}</p>
            </div>
          </div>

          {report.aiSummary && (
            <div className="mt-5 rounded-2xl border border-cyan-300/20 bg-cyan-300/10 p-4">
              <p className="mb-2 font-black text-cyan-100">AI summary</p>
              <p className="whitespace-pre-wrap text-sm leading-6 text-slate-200">{report.aiSummary}</p>
              {report.actionItems?.length > 0 && (
                <ul className="mt-3 space-y-1 text-sm text-slate-200">
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
