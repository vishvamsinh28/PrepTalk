"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { FaCopy } from "react-icons/fa";

export default function QuestionHistory() {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const response = await axios.get("/api/get-questions");
        setHistory(response.data.questions);
      } catch (error) {
        console.error("Error fetching history:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, []);

  const handleCopy = (question) => {
    navigator.clipboard.writeText(question);
  };

  if (loading) {
    return <p className="text-gray-400">Loading history... 🔄</p>;
  }

  if (history.length === 0) {
    return <p className="text-gray-400">No questions generated yet. Try generating some! 🚀</p>;
  }

  return (
    <div className="space-y-4">
      {history.map((q, index) => (
        <div
          key={index}
          className="bg-gray-700 border border-gray-600 p-4 rounded-lg shadow-inner relative"
        >
          <p className="text-gray-100">{q.question}</p>
          <button
            onClick={() => handleCopy(q.question)}
            className="absolute top-2 right-2 text-gray-400 hover:text-sky-400 transition-colors"
          >
            <FaCopy />
          </button>
          <p className="text-gray-500 text-xs mt-1">Category: {q.category} | {new Date(q.createdAt).toLocaleString()}</p>
        </div>
      ))}
    </div>
  );
}
