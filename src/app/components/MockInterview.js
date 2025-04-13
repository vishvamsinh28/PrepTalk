"use client";

import { useState } from "react";
import axios from "axios";
import cleanMarkdown from "@/lib/cleanup";

export default function MockInterview() {
  const [role, setRole] = useState("Software Engineer");
  const roles = ["Software Engineer", "Data Analyst", "Product Manager", "UI/UX Designer", "Cybersecurity Specialist"];

  const [questions, setQuestions] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [userInput, setUserInput] = useState("");
  const [feedback, setFeedback] = useState([]);
  const [loading, setLoading] = useState(false);
  const [interviewStarted, setInterviewStarted] = useState(false);
  const [interviewCompleted, setInterviewCompleted] = useState(false);
  const [summary, setSummary] = useState("");

  const startInterview = async () => {
    setLoading(true);
    try {
      const response = await axios.post("/api/start-mock-interview", {
        role,
        category: "Technical",
        numberOfQuestions: 5,
      });
      setQuestions(response.data.questions);
      setInterviewStarted(true);
    } catch (error) {
      console.error("Error starting interview:", error);
      alert("Failed to start mock interview.");
    } finally {
      setLoading(false);
    }
  };

  const handleNext = async () => {
    if (!userInput.trim()) {
      alert("Please answer the question!");
      return;
    }

    const currentQuestion = questions[currentQuestionIndex];

    try {
      const response = await axios.post("/api/evaluate-answer", {
        question: currentQuestion,
        answer: userInput,
      });

      setFeedback((prev) => [...prev, response.data.feedback]);
    } catch (error) {
      console.error("Error evaluating answer:", error);
      setFeedback((prev) => [...prev, "No feedback available."]);
    }

    setAnswers((prev) => [...prev, userInput]);
    setUserInput("");

    if (currentQuestionIndex + 1 < questions.length) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else {
      generateSummary();
    }
  };

  const generateSummary = async () => {
    try {
      const response = await axios.post("/api/generate-summary", {
        questions,
        answers,
        role,
      });
      setSummary(cleanMarkdown(response.data.summary));
    } catch (error) {
      console.error("Error generating summary:", error);
    } finally {
      setInterviewCompleted(true);
    }
  };

  if (!interviewStarted) {
    return (
      <div className="space-y-4">
        <div>
          <label className="block text-gray-400 mb-2">Select Role for Interview:</label>
          <select
            value={role}
            onChange={(e) => setRole(e.target.value)}
            className="bg-gray-700 border border-gray-600 text-gray-100 w-full p-3 rounded-lg focus:outline-none focus:border-sky-500 transition-colors"
          >
            {roles.map((r) => (
              <option key={r} value={r}>
                {r}
              </option>
            ))}
          </select>
        </div>

        <button
          onClick={startInterview}
          disabled={loading}
          className="bg-gradient-to-r from-sky-500 to-blue-600 text-white px-4 py-3 rounded-lg font-medium transition-all transform hover:scale-105 shadow-md hover:shadow-sky-500/30 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? "Starting Interview..." : "Start AI Mock Interview"}
        </button>
      </div>
    );
  }

  if (interviewCompleted) {
    return (
      <div className="space-y-4">
        <h2 className="text-xl font-bold text-green-400">Interview Completed 🎉</h2>
        <p className="text-gray-300">AI Summary Feedback:</p>
        <div className="bg-gray-700 border border-gray-600 p-4 rounded-lg text-gray-100">
          {summary}
        </div>
        <button
          onClick={() => {
            setInterviewStarted(false);
            setInterviewCompleted(false);
            setQuestions([]);
            setCurrentQuestionIndex(0);
            setAnswers([]);
            setFeedback([]);
            setSummary("");
          }}
          className="bg-gradient-to-r from-sky-500 to-blue-600 text-white px-4 py-2 rounded-lg hover:from-sky-600 hover:to-blue-700 transition"
        >
          Retry Interview
        </button>
      </div>
    );
  }

  const currentQuestion = questions[currentQuestionIndex];

  return (
    <div className="space-y-6">
      <div className="bg-gray-700 border border-gray-600 p-4 rounded-lg shadow-inner">
        <h3 className="text-lg text-gray-200 mb-2">
          Question {currentQuestionIndex + 1} of {questions.length}
        </h3>
        <p className="text-gray-100">{currentQuestion}</p>
      </div>

      <textarea
        value={userInput}
        onChange={(e) => setUserInput(e.target.value)}
        placeholder="Type your answer here..."
        className="w-full bg-gray-800 border border-gray-600 text-gray-300 px-4 py-2 rounded-lg focus:outline-none focus:border-sky-500"
        rows="4"
      />

      <button
        onClick={handleNext}
        className="bg-gradient-to-r from-sky-500 to-blue-600 text-white px-4 py-2 rounded-lg hover:from-sky-600 hover:to-blue-700 transition"
      >
        {currentQuestionIndex + 1 === questions.length ? "Finish Interview" : "Next Question"}
      </button>
    </div>
  );
}
