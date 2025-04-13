"use client";

import QuestionGenerator from "../components/QuestionGenerator";
import QuestionHistory from "../components/QuestionHistory.js";
import Quiz from "../components/Quiz";
import QuizHistory from "../components/QuizHistory";

export default function PracticeAIQuestionsPage() {
  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 p-6 space-y-12">
      <h1 className="text-4xl font-bold text-sky-300 text-center mb-10">
        Practice AI Questions 🤖
      </h1>

      <section className="bg-gray-800 p-6 rounded-lg shadow-lg">
        <h2 className="text-2xl font-semibold text-sky-300 mb-4">Generate Interview Question</h2>
        <QuestionGenerator />
      </section>

      <section className="bg-gray-800 p-6 rounded-lg shadow-lg">
        <h2 className="text-2xl font-semibold text-sky-300 mb-4">Test Yourself - Quiz Mode</h2>
        <Quiz />
      </section>

      <section className="bg-gray-800 p-6 rounded-lg shadow-lg">
        <h2 className="text-2xl font-semibold text-sky-300 mb-4">Your Question History</h2>
        <QuestionHistory />
      </section>
      
      <section className="bg-gray-800 p-6 rounded-lg shadow-lg">
        <h2 className="text-2xl font-semibold text-sky-300 mb-4">Quiz Performance History 📊</h2>
        <QuizHistory />
      </section>


    </div>
  );
}
