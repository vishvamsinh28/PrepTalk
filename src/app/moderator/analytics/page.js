"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { motion } from "framer-motion";
import { FaChartBar, FaComments, FaClipboardCheck, FaStar, FaArrowLeft } from "react-icons/fa";

export default function AnalyticsPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const response = await axios.get("/api/analytics");
        setData(response.data);
      } catch (error) {
        console.error("Error fetching analytics:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, []);

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { type: "spring", stiffness: 100 }
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-900">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-sky-400 mb-4"></div>
          <p className="text-sky-300 text-lg">Loading analytics data...</p>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-900">
        <div className="bg-red-500/10 border border-red-500/50 text-red-400 p-6 rounded-lg max-w-md text-center">
          <svg className="w-12 h-12 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
          </svg>
          <p className="text-lg font-medium">Failed to load analytics data.</p>
          <p className="mt-2 text-sm">Please check your connection and try again.</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 bg-red-500/20 hover:bg-red-500/30 text-red-400 px-4 py-2 rounded-lg transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100">
      {/* Header with background */}
      <div className="relative py-16 bg-gradient-to-r from-blue-900 to-sky-800">
        <div className="absolute inset-0 bg-[url('/images/pattern.svg')] bg-repeat opacity-10"></div>
        <div className="container mx-auto px-4 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center"
          >
            <div className="bg-sky-500/20 p-3 rounded-full inline-flex mb-4">
              <FaChartBar className="text-3xl text-sky-300" />
            </div>
            <h1 className="text-4xl font-bold mb-4 text-white">PrepTalk Analytics</h1>
            <p className="text-sky-100 max-w-xl mx-auto">
              Track engagement, monitor performance, and gain insights into your sessions
            </p>
          </motion.div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-12">
        {/* Summary Cards */}
        <motion.div
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <motion.div
            variants={itemVariants}
            className="bg-gray-800 border border-gray-700 rounded-xl p-6 shadow-lg hover:shadow-sky-500/10 transition-all duration-300 hover:border-sky-500/50"
          >
            <div className="flex items-center mb-4">
              <div className="bg-sky-500/20 p-2 rounded-lg mr-3">
                <FaChartBar className="text-sky-400 text-xl" />
              </div>
              <h2 className="text-lg font-semibold text-gray-300">Total Sessions</h2>
            </div>
            <p className="text-4xl font-bold text-sky-300">{data.sessionCount}</p>
            <p className="text-gray-500 text-sm mt-2">
              {data.sessionCount > 100 ? "Strong engagement" : "Building momentum"}
            </p>
          </motion.div>

          <motion.div
            variants={itemVariants}
            className="bg-gray-800 border border-gray-700 rounded-xl p-6 shadow-lg hover:shadow-sky-500/10 transition-all duration-300 hover:border-sky-500/50"
          >
            <div className="flex items-center mb-4">
              <div className="bg-sky-500/20 p-2 rounded-lg mr-3">
                <FaComments className="text-sky-400 text-xl" />
              </div>
              <h2 className="text-lg font-semibold text-gray-300">Total Messages</h2>
            </div>
            <p className="text-4xl font-bold text-sky-300">{data.messageCount}</p>
            <p className="text-gray-500 text-sm mt-2">
              ~{Math.round(data.messageCount / data.sessionCount)} messages per session
            </p>
          </motion.div>

          <motion.div
            variants={itemVariants}
            className="bg-gray-800 border border-gray-700 rounded-xl p-6 shadow-lg hover:shadow-sky-500/10 transition-all duration-300 hover:border-sky-500/50"
          >
            <div className="flex items-center mb-4">
              <div className="bg-sky-500/20 p-2 rounded-lg mr-3">
                <FaClipboardCheck className="text-sky-400 text-xl" />
              </div>
              <h2 className="text-lg font-semibold text-gray-300">Total Feedback</h2>
            </div>
            <p className="text-4xl font-bold text-sky-300">{data.feedbackCount}</p>
            <p className="text-gray-500 text-sm mt-2">
              {Math.round((data.feedbackCount / data.sessionCount) * 100)}% feedback rate
            </p>
          </motion.div>

          <motion.div
            variants={itemVariants}
            className="bg-gray-800 border border-gray-700 rounded-xl p-6 shadow-lg hover:shadow-sky-500/10 transition-all duration-300 hover:border-sky-500/50"
          >
            <div className="flex items-center mb-4">
              <div className="bg-sky-500/20 p-2 rounded-lg mr-3">
                <FaStar className="text-sky-400 text-xl" />
              </div>
              <h2 className="text-lg font-semibold text-gray-300">Average Rating</h2>
            </div>
            <p className="text-4xl font-bold text-sky-300">{data.averageRating}</p>
            <div className="flex text-yellow-400 mt-2">
              {[...Array(5)].map((_, i) => (
                <span key={i} className={i < Math.round(data.averageRating) ? "text-yellow-400" : "text-gray-600"}>
                  ★
                </span>
              ))}
            </div>
          </motion.div>
        </motion.div>

        {/* Additional Analytics Sections */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.3 }}
          className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12"
        >
          {/* User Engagement Chart Placeholder */}
          <div className="bg-gray-800 border border-gray-700 rounded-xl p-6 shadow-lg">
            <h2 className="text-xl font-bold text-sky-300 mb-4">User Engagement Over Time</h2>
            <div className="bg-gray-700/50 rounded-lg h-64 flex items-center justify-center">
              <p className="text-gray-400">Chart visualization would appear here</p>
            </div>
          </div>
          
          {/* Top Performing Topics */}
          <div className="bg-gray-800 border border-gray-700 rounded-xl p-6 shadow-lg">
            <h2 className="text-xl font-bold text-sky-300 mb-4">Top Discussion Topics</h2>
            <div className="space-y-4">
              {[
                { topic: "Leadership Skills", engagement: 94 },
                { topic: "Technical Interview Prep", engagement: 87 },
                { topic: "Problem Solving", engagement: 82 },
                { topic: "Communication Skills", engagement: 78 }
              ].map((item, index) => (
                <div key={index} className="bg-gray-700/50 p-3 rounded-lg">
                  <div className="flex justify-between mb-1">
                    <span className="text-gray-300">{item.topic}</span>
                    <span className="text-sky-300">{item.engagement}%</span>
                  </div>
                  <div className="w-full bg-gray-600 rounded-full h-2">
                    <div 
                      className="bg-gradient-to-r from-sky-400 to-blue-500 h-2 rounded-full" 
                      style={{ width: `${item.engagement}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Back Button */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="text-center mt-8"
        >
          <button
            onClick={() => window.location.href = "/moderator"}
            className="flex items-center justify-center mx-auto bg-gray-800 hover:bg-gray-700 text-sky-400 px-6 py-3 rounded-lg border border-sky-500/30 hover:border-sky-500/50 transition-all group"
          >
            <FaArrowLeft className="mr-2 group-hover:-translate-x-1 transition-transform" />
            Back to Moderator Panel
          </button>
        </motion.div>
      </div>
    </div>
  );
}