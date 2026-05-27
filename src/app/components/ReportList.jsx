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
      <div className="flex justify-center items-center gap-2 text-sky-400">
        <FaSpinner className="animate-spin" />
        <span>Loading reports...</span>
      </div>
    );
  }

  if (reports.length === 0) {
    return (
      <div className="text-center bg-gray-800 p-6 rounded-xl border border-gray-700">
        <FaClipboardCheck className="text-4xl text-sky-500 mb-3 mx-auto" />
        <p className="text-lg text-sky-400">No reports yet.</p>
        <p className="text-gray-400 text-sm">Completed interview scorecards will appear here.</p>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {reports.map((report) => (
        <article key={report._id} className="bg-gray-800 border border-gray-700 p-6 rounded-xl shadow-lg">
          <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-3 mb-4">
            <div>
              <h3 className="text-xl font-bold text-sky-300">{report.recommendation}</h3>
              <p className="text-sm text-gray-400">{report.intervieweeEmail}</p>
            </div>
            <p className="text-xs text-gray-500">
              {new Date(report.createdAt).toLocaleDateString()}
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-5">
            {Object.entries(report.scores || {}).map(([name, score]) => (
              <div key={name} className="bg-gray-900 border border-gray-700 rounded-lg p-3">
                <p className="text-xs text-gray-400">{scoreLabels[name] || name}</p>
                <p className="text-2xl font-bold text-sky-300">{score}</p>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <p className="font-semibold text-gray-200 mb-1">Strengths</p>
              <p className="text-gray-400 whitespace-pre-wrap">{report.strengths}</p>
            </div>
            <div>
              <p className="font-semibold text-gray-200 mb-1">Next improvements</p>
              <p className="text-gray-400 whitespace-pre-wrap">{report.improvements}</p>
            </div>
          </div>
        </article>
      ))}
    </div>
  );
}
