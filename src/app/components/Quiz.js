"use client";

import { useEffect, useState } from "react";
import axios from "axios";

export default function Quiz() {
  const [quizData, setQuizData] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [quizCompleted, setQuizCompleted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [quizStarted, setQuizStarted] = useState(false);

  const startQuiz = async () => {
    setLoading(true);
    try {
      const response = await axios.post("/api/generate-quiz", {
        category: "Technical", // You can make this dynamic later ✅
        numberOfQuestions: 5,
      });

      setQuizData(response.data.quiz);
      setQuizStarted(true);
      setCurrentQuestionIndex(0);
      setScore(0);
      setQuizCompleted(false);
    } catch (error) {
      console.error("Error fetching quiz:", error);
      alert("Failed to load quiz. Please try again!");
    } finally {
      setLoading(false);
    }
  };

  const handleAnswer = async (selectedOption) => {
    const currentQuestion = quizData[currentQuestionIndex];

    if (selectedOption === currentQuestion.answer) {
      setScore(score + 1);
    }

    const nextIndex = currentQuestionIndex + 1;
    if (nextIndex < quizData.length) {
      setCurrentQuestionIndex(nextIndex);
    } else {
      setQuizCompleted(true);
      saveQuizPerformance();
    }
  };

  const saveQuizPerformance = async () => {
    try {
      await axios.post("/api/save-quiz-result", {
        totalQuestions: quizData.length,
        score,
      });
    } catch (error) {
      console.error("Error saving quiz result:", error);
    }
  };

  // Show start quiz button
  if (!quizStarted) {
    return (
      <button
        onClick={startQuiz}
        disabled={loading}
        className="bg-gradient-to-r from-sky-500 to-blue-600 text-white px-4 py-3 rounded-lg font-medium transition-all transform hover:scale-105 shadow-md hover:shadow-sky-500/30 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? "Generating Quiz... 🤖" : "Start AI Powered Quiz"}
      </button>
    );
  }

  // Quiz completed
  if (quizCompleted) {
    return (
      <div className="text-center space-y-4">
        <h3 className="text-2xl font-bold text-green-400">Quiz Completed! 🎉</h3>
        <p className="text-gray-300">Your Score: {score} / {quizData.length}</p>
        <button
          onClick={startQuiz}
          className="bg-gradient-to-r from-sky-500 to-blue-600 text-white px-4 py-2 rounded-lg hover:from-sky-600 hover:to-blue-700 transition"
        >
          Retry Quiz
        </button>
      </div>
    );
  }

  const currentQuestion = quizData[currentQuestionIndex];

  return (
    <div className="space-y-6">
      <div className="bg-gray-700 border border-gray-600 p-4 rounded-lg shadow-inner">
        <h3 className="text-lg text-gray-200 mb-2">
          Question {currentQuestionIndex + 1} of {quizData.length}
        </h3>
        <p className="text-gray-100">{currentQuestion.question}</p>
      </div>

      <div className="space-y-3">
        {currentQuestion.options.map((option, index) => (
          <button
            key={index}
            onClick={() => handleAnswer(option)}
            className="w-full bg-gray-800 border border-gray-600 text-gray-300 px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors"
          >
            {option}
          </button>
        ))}
      </div>
    </div>
  );
}
