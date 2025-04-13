"use client";

import { useEffect, useState } from "react";
import axios from "axios";

export default function QuizHistory() {
  const [quizHistory, setQuizHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const response = await axios.get("/api/get-quiz-results");
        setQuizHistory(response.data.results);
      } catch (error) {
        console.error("Error fetching quiz history:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, []);

  if (loading) {
    return <p className="text-gray-400">Loading quiz history... 🔄</p>;
  }

  if (quizHistory.length === 0) {
    return <p className="text-gray-400">No quiz history yet. Take a quiz to track your progress! 📊</p>;
  }

  return (
    <div className="space-y-4">
      {quizHistory.map((record, index) => (
        <div
          key={index}
          className="bg-gray-700 border border-gray-600 p-4 rounded-lg shadow-inner"
        >
          <p className="text-gray-100 font-medium mb-1">Date: {new Date(record.date).toLocaleString()}</p>
          <p className="text-gray-300">Score: {record.score} / {record.totalQuestions}</p>
        </div>
      ))}
    </div>
  );
}
