"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { FaStar, FaCheckCircle, FaExclamationTriangle, FaCommentDots } from "react-icons/fa";

export default function FeedbackForm({ sessionId, userEmail, role }) {
  const [rating, setRating] = useState(5);
  const [comments, setComments] = useState("");
  const [message, setMessage] = useState("");
  const [isError, setIsError] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    setMessage("");
    setIsError(false);

    try {
      const res = await fetch("/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId, userEmail, role, rating, comments }),
      });

      if (res.ok) {
        setMessage("Feedback submitted successfully ✅");
        setRating(5);
        setComments("");
        setIsError(false);

        // Auto clear message after 3 seconds
        setTimeout(() => setMessage(""), 3000);
      } else {
        setMessage("Failed to submit feedback ❌");
        setIsError(true);
      }
    } catch (error) {
      setMessage("An error occurred ❌");
      setIsError(true);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="bg-gray-800 border border-gray-700 p-8 rounded-xl shadow-2xl max-w-md w-full mx-auto relative z-10 my-10"
    >
      {/* Header */}
      <div className="text-center mb-6">
        <div className="bg-sky-500/20 p-3 rounded-full inline-flex mb-3">
          <FaCommentDots className="text-3xl text-sky-300" />
        </div>
        <h2 className="text-3xl font-bold text-sky-300 mb-1">Session Feedback 📝</h2>
        <p className="text-gray-400 text-sm">We value your thoughts to improve PrepTalk!</p>
      </div>

      {/* Success / Error message */}
      {message && (
        <div
          className={`flex items-center mb-4 text-sm p-3 rounded-lg ${
            isError
              ? "bg-red-500/10 border border-red-500/50 text-red-400"
              : "bg-green-500/10 border border-green-500/50 text-green-400"
          }`}
        >
          {isError ? (
            <FaExclamationTriangle className="mr-2" />
          ) : (
            <FaCheckCircle className="mr-2" />
          )}
          {message}
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="block text-gray-300 mb-1 font-medium">
            Rate the session (1-5):
          </label>
          <input
            type="number"
            min="1"
            max="5"
            value={rating}
            onChange={(e) => setRating(e.target.value)}
            className="bg-gray-700 border border-gray-600 text-gray-100 w-full p-3 rounded-lg focus:outline-none focus:border-sky-500 transition-colors"
            required
          />
        </div>

        <div>
          <label className="block text-gray-300 mb-1 font-medium">
            Your comments:
          </label>
          <textarea
            value={comments}
            onChange={(e) => setComments(e.target.value)}
            placeholder="Share your experience..."
            className="bg-gray-700 border border-gray-600 text-gray-100 w-full p-3 rounded-lg focus:outline-none focus:border-sky-500 transition-colors"
            rows="4"
          ></textarea>
        </div>

        <button
          type="submit"
          className="bg-gradient-to-r from-sky-400 to-blue-500 text-white w-full p-3 rounded-lg font-medium hover:from-sky-500 hover:to-blue-600 transition-all transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-opacity-50 shadow-lg hover:shadow-sky-500/30"
        >
          Submit Feedback
        </button>
      </form>
    </motion.div>
  );
}
