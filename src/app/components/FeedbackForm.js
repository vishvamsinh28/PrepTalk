"use client";

import { useState } from "react";

export default function FeedbackForm({ sessionId, userEmail, role }) {
  const [rating, setRating] = useState(5);
  const [comments, setComments] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    const res = await fetch("/api/feedback", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sessionId, userEmail, role, rating, comments }),
    });

    if (res.ok) {
      alert("Feedback submitted successfully ✅");
    } else {
      alert("Failed to submit feedback ❌");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4 bg-white p-4 my-8 w-1/4 shadow rounded">
      <label className="font-semibold">Rate the session (1-5):</label>
      <input
        type="number"
        min="1"
        max="5"
        value={rating}
        onChange={(e) => setRating(e.target.value)}
        className="border rounded px-2 py-1"
      />

      <label className="font-semibold">Your comments:</label>
      <textarea
        value={comments}
        onChange={(e) => setComments(e.target.value)}
        className="border rounded px-2 py-1"
      />

      <button type="submit" className="bg-blue-500 text-white rounded py-2 hover:bg-blue-600 transition">
        Submit Feedback
      </button>
    </form>
  );
}
