"use client";

import { useState } from "react";
import axios from "axios";

export default function CreateSessionForm() {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    participants: "",
    evaluators: "",
  });
  const [message, setMessage] = useState("");

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");

    try {
      const payload = {
        title: formData.title,
        description: formData.description,
        participants: formData.participants.split(",").map((email) => email.trim()),
        evaluators: formData.evaluators.split(",").map((email) => email.trim()),
      };

      const response = await axios.post("/api/session", payload);
      setMessage(response.data.message);
      setFormData({ title: "", description: "", participants: "", evaluators: "" });
    } catch (error) {
      setMessage(error.response?.data?.message || "Session creation failed");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 bg-white p-6 rounded shadow-md">
      <h2 className="text-xl font-bold mb-4">Create New Session</h2>

      {message && <p className="text-green-500">{message}</p>}

      <input
        name="title"
        value={formData.title}
        onChange={handleChange}
        placeholder="Session Title"
        className="border w-full p-2 rounded"
        required
      />
      <textarea
        name="description"
        value={formData.description}
        onChange={handleChange}
        placeholder="Session Description"
        className="border w-full p-2 rounded"
      ></textarea>

      <input
        name="participants"
        value={formData.participants}
        onChange={handleChange}
        placeholder="Participants Emails (comma separated)"
        className="border w-full p-2 rounded"
      />
      <input
        name="evaluators"
        value={formData.evaluators}
        onChange={handleChange}
        placeholder="Evaluators Emails (comma separated)"
        className="border w-full p-2 rounded"
      />

      <button type="submit" className="bg-blue-500 text-white w-full p-2 rounded hover:bg-blue-600 transition">
        Create Session
      </button>
    </form>
  );
}
