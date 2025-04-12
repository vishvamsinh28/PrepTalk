"use client";

import { useEffect, useState } from "react";
import axios from "axios";

export default function AnalyticsPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const response = await axios.get("/api/analytics");
        setData(response.data);
      } catch (error) {
        console.error("Error fetching analytics:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, []);

  if (loading) {
    return <p className="text-center mt-10">Loading analytics...</p>;
  }

  if (!data) {
    return <p className="text-center mt-10 text-red-500">Failed to load analytics.</p>;
  }

  return (
    <div className="flex flex-col min-h-screen justify-center items-center bg-gradient-to-br from-purple-100 to-pink-200 text-gray-800 p-4">
      <h1 className="text-3xl font-bold mb-8 text-purple-700">📊 PrepTalk Analytics</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-4xl text-center">
        <div className="bg-white p-6 rounded shadow hover:shadow-lg transition transform hover:scale-105">
          <h2 className="text-xl font-bold text-purple-600 mb-2">Total Sessions</h2>
          <p className="text-2xl">{data.sessionCount}</p>
        </div>

        <div className="bg-white p-6 rounded shadow hover:shadow-lg transition transform hover:scale-105">
          <h2 className="text-xl font-bold text-purple-600 mb-2">Total Messages</h2>
          <p className="text-2xl">{data.messageCount}</p>
        </div>

        <div className="bg-white p-6 rounded shadow hover:shadow-lg transition transform hover:scale-105">
          <h2 className="text-xl font-bold text-purple-600 mb-2">Total Feedback</h2>
          <p className="text-2xl">{data.feedbackCount}</p>
        </div>

        <div className="bg-white p-6 rounded shadow hover:shadow-lg transition transform hover:scale-105">
          <h2 className="text-xl font-bold text-purple-600 mb-2">Average Rating</h2>
          <p className="text-2xl">{data.averageRating} ⭐️</p>
        </div>
      </div>

      <button
        onClick={() => window.location.href = "/moderator"}
        className="mt-10 bg-purple-600 text-white px-6 py-3 rounded-lg shadow hover:bg-purple-700 transition"
      >
        Back to Moderator Panel
      </button>
    </div>
  );
}
