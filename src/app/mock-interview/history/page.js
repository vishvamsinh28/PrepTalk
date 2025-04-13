"use client";

import { useEffect, useState } from "react";
import axios from "axios";

export default function InterviewHistoryPage() {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const response = await axios.get("/api/get-interview-results");
        setHistory(response.data.results);
      } catch (error) {
        console.error("Error fetching interview history:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, []);

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 mt-15 py-10 px-4">
      <div className="max-w-4xl mx-auto space-y-8">
        <h1 className="text-3xl font-bold text-sky-300 text-center">Interview History 🗂️</h1>

        {loading ? (
          <p className="text-gray-400 text-center">Loading interview history... 🔄</p>
        ) : history.length === 0 ? (
          <p className="text-gray-400 text-center">No interviews found. Try completing a mock interview! 🚀</p>
        ) : (
          history.map((record, index) => (
            <div key={index} className="bg-gray-700 border border-gray-600 p-6 rounded-lg shadow-md">
              <p className="text-sky-400 mb-2 font-medium">Role: {record.role}</p>
              <p className="text-gray-400 text-sm mb-3">Date: {new Date(record.date).toLocaleString()}</p>
              <p className="text-gray-100 whitespace-pre-wrap">{record.summary}</p>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
