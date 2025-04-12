"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";

export default function RegisterPage() {
  const router = useRouter();

  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    role: "Participant",
  });

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    try {
      const response = await axios.post("/api/register", formData);
      setSuccess(response.data.message);
      router.push("/login");
    } catch (err) {
      setError(err.response?.data?.message || "Registration failed");
    }
  };

  return (
    <div className="flex min-h-screen justify-center items-center bg-gray-100">
      <form onSubmit={handleSubmit} className="bg-white p-8 rounded shadow-md w-full max-w-md space-y-4">
        <h2 className="text-2xl font-bold text-center">Register for PrepTalk 🚀</h2>

        {error && <p className="text-red-500">{error}</p>}
        {success && <p className="text-green-500">{success}</p>}

        <input
          type="text"
          name="username"
          placeholder="Username"
          value={formData.username}
          onChange={handleChange}
          className="border w-full p-2 rounded"
          required
        />
        <input
          type="email"
          name="email"
          placeholder="Email"
          value={formData.email}
          onChange={handleChange}
          className="border w-full p-2 rounded"
          required
        />
        <input
          type="password"
          name="password"
          placeholder="Password"
          value={formData.password}
          onChange={handleChange}
          className="border w-full p-2 rounded"
          required
        />

        <select name="role" value={formData.role} onChange={handleChange} className="border w-full p-2 rounded">
          <option value="Participant">Participant</option>
          <option value="Moderator">Moderator</option>
          <option value="Evaluator">Evaluator</option>
        </select>

        <button type="submit" className="bg-blue-500 text-white w-full p-2 rounded hover:bg-blue-600 transition">
          Register
        </button>

        <p className="text-center text-sm">
          Already have an account?{" "}
          <span className="text-blue-600 cursor-pointer" onClick={() => router.push("/login")}>
            Login here
          </span>
        </p>
      </form>
    </div>
  );
}
