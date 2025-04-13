"use client";

import { useState } from "react";
import axios from "axios";
import cleanMarkdown from "@/lib/cleanup";

export default function ResumeReviewPage() {
  const [formData, setFormData] = useState({
    fullName: "",
    summary: "",
    experience: "",
    skills: "",
    education: "",
    certifications: "",
    jobRole: "",
  });

  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState("");

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setFeedback("");

    try {
      const response = await axios.post("/api/resume-review", formData);
      setFeedback(cleanMarkdown(response.data.feedback));
    } catch (error) {
      console.error("Error analyzing resume:", error);
      setFeedback("There was an error analyzing your resume. Please try again later.");
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen p-8 mt-15 text-white bg-gray-900">
      <h1 className="text-3xl font-bold mb-6 text-sky-400">AI Resume Review 📝</h1>

      <form onSubmit={handleSubmit} className="space-y-4 bg-gray-800 p-6 rounded-lg shadow-lg">
        {["fullName", "summary", "experience", "skills", "education", "certifications", "jobRole"].map((field) => (
          <div key={field}>
            <label className="block text-sm font-medium mb-1 capitalize">
              {field.replace(/([A-Z])/g, ' $1')}
            </label>
            <textarea
              name={field}
              value={formData[field]}
              onChange={handleChange}
              rows={field === "summary" ? 3 : 2}
              className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500"
              placeholder={`Enter your ${field.replace(/([A-Z])/g, ' $1').toLowerCase()}...`}
              required
            />
          </div>
        ))}

        <button
          type="submit"
          className="bg-gradient-to-r from-sky-500 to-blue-600 text-white w-full p-3 rounded-lg font-medium hover:from-sky-600 hover:to-blue-700 transition-all transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-sky-500 shadow-md hover:shadow-sky-500/30"
          disabled={loading}
        >
          {loading ? "Analyzing..." : "Analyze Resume"}
        </button>
      </form>

      {feedback && (
        <div className="mt-8 bg-gray-800 p-6 rounded-lg shadow-lg">
          <h2 className="text-2xl font-bold mb-4 text-sky-400">AI Feedback 🚀</h2>
          <pre className="whitespace-pre-wrap text-gray-300">{feedback}</pre>
        </div>
      )}
    </div>
  );
}
