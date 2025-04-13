"use client";

import { useState } from "react";
import axios from "axios";
import { motion } from "framer-motion";
import { FaRocket, FaCheckCircle, FaExclamationTriangle } from "react-icons/fa";

export default function CreateSessionForm() {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    participants: "",
    evaluators: "",
    topic: "",
  });
  const [message, setMessage] = useState("");
  const [isError, setIsError] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    setIsError(false);

    try {
      const payload = {
        title: formData.title,
        description: formData.description,
        topic: formData.topic,
        participants: formData.participants
          .split(",")
          .map((email) => email.trim()),
        evaluators: formData.evaluators
          .split(",")
          .map((email) => email.trim()),
      };

      const response = await axios.post("/api/session", payload);
      setMessage(response.data.message);
      setIsError(false);

      setFormData({
        title: "",
        description: "",
        participants: "",
        evaluators: "",
        topic: "",
      });
    } catch (error) {
      setMessage(error.response?.data?.message || "Session creation failed");
      setIsError(true);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="bg-gray-800 border border-gray-700 p-8 rounded-xl shadow-2xl max-w-xl w-full mx-auto relative z-10"
    >
      {/* Header */}
      <div className="text-center mb-6">
        <div className="bg-sky-500/20 p-3 rounded-full inline-flex mb-3">
          <FaRocket className="text-3xl text-sky-300" />
        </div>
        <h2 className="text-3xl font-bold text-sky-300 mb-1">Create New Session 🚀</h2>
        <p className="text-gray-400 text-sm">Launch your next discussion effortlessly.</p>
      </div>

      {/* Success or error message */}
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
        <input
          name="title"
          value={formData.title}
          onChange={handleChange}
          placeholder="Session Title"
          className="bg-gray-700 border border-gray-600 text-gray-100 w-full p-3 rounded-lg focus:outline-none focus:border-sky-500 transition-colors"
          required
        />

        <textarea
          name="description"
          value={formData.description}
          onChange={handleChange}
          placeholder="Session Description"
          className="bg-gray-700 border border-gray-600 text-gray-100 w-full p-3 rounded-lg focus:outline-none focus:border-sky-500 transition-colors"
        ></textarea>

        <select
          name="topic"
          value={formData.topic}
          onChange={handleChange}
          className="bg-gray-700 border border-gray-600 text-gray-400 w-full p-3 rounded-lg focus:outline-none focus:border-sky-500 transition-colors"
          required
        >
          <option value="">-- Select a Topic --</option>
          <option value="Artificial Intelligence">Artificial Intelligence</option>
          <option value="Climate Change">Climate Change</option>
          <option value="Future of Work">Future of Work</option>
          <option value="Education System">Education System</option>
          <option value="Mental Health Awareness">Mental Health Awareness</option>
          <option value="Women Empowerment">Women Empowerment</option>
        </select>

        <input
          name="participants"
          value={formData.participants}
          onChange={handleChange}
          placeholder="Participants Emails (comma separated)"
          className="bg-gray-700 border border-gray-600 text-gray-100 w-full p-3 rounded-lg focus:outline-none focus:border-sky-500 transition-colors"
        />

        <input
          name="evaluators"
          value={formData.evaluators}
          onChange={handleChange}
          placeholder="Evaluators Emails (comma separated)"
          className="bg-gray-700 border border-gray-600 text-gray-100 w-full p-3 rounded-lg focus:outline-none focus:border-sky-500 transition-colors"
        />

        <button
          type="submit"
          className="bg-gradient-to-r from-sky-400 to-blue-500 text-white w-full p-3 rounded-lg font-medium hover:from-sky-500 hover:to-blue-600 transition-all transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-opacity-50 shadow-lg hover:shadow-sky-500/30"
        >
          Create Session
        </button>
      </form>
    </motion.div>
  );
}
