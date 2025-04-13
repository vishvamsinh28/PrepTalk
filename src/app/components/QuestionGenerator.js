"use client";

import { useState } from "react";
import axios from "axios";
import { motion } from "framer-motion";
import { FaRobot, FaCopy } from "react-icons/fa";

export default function QuestionGenerator() {
  const [category, setCategory] = useState("Technical");
  const [loading, setLoading] = useState(false);
  const [question, setQuestion] = useState("");
  const [history, setHistory] = useState([]);

  const categories = ["Technical", "Behavioral", "Group Discussion"];

  const handleGenerate = async () => {
    setLoading(true);
    setQuestion("");

    try {
      const response = await axios.post("/api/generate-question", {
        category,
      });

      const generatedQuestion = response.data.question;
      await axios.post("/api/save-question", {
        category,
        question: generatedQuestion,
      });
      
      setQuestion(generatedQuestion);
      setHistory((prevHistory) => [generatedQuestion, ...prevHistory]);
    } catch (error) {
      console.error("Error generating question:", error);
      setQuestion("Failed to generate question. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(question);
  };

  return (
    <div className="space-y-6">
      {/* Category Selection */}
      <div>
        <label className="block text-gray-400 mb-2">Select Category:</label>
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="bg-gray-700 border border-gray-600 text-gray-100 w-full p-3 rounded-lg focus:outline-none focus:border-sky-500 transition-colors"
        >
          {categories.map((cat) => (
            <option key={cat} value={cat}>
              {cat}
            </option>
          ))}
        </select>
      </div>

      {/* Generate Button */}
      <button
        onClick={handleGenerate}
        disabled={loading}
        className="flex items-center justify-center bg-gradient-to-r from-sky-500 to-blue-600 text-white px-4 py-3 rounded-lg font-medium transition-all transform hover:scale-105 shadow-md hover:shadow-sky-500/30 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <FaRobot className="mr-2" />
        {loading ? "AI is thinking..." : "Generate Question"}
      </button>

      {/* Result */}
      {question && (
        <motion.div
          initial={{ opacity: 0.3 }}
          animate={{ opacity: 1 }}
          className="bg-gray-700 border border-gray-600 p-4 rounded-lg shadow-inner relative"
        >
          <p className="text-gray-100">{question}</p>
          <button
            onClick={handleCopy}
            className="absolute top-2 right-2 text-gray-400 hover:text-sky-400 transition-colors"
          >
            <FaCopy />
          </button>
        </motion.div>
      )}
    </div>
  );
}
