"use client";

import { useEffect, useState } from "react";
import { getJson } from "@/lib/clientApi";
import { motion } from "framer-motion";
import { FaChartBar, FaComments, FaClipboardCheck, FaStar, FaArrowLeft } from "react-icons/fa";

function MetricCard({ icon, title, value, detail }) {
  return (
    <motion.div
      variants={{
        hidden: { y: 20, opacity: 0 },
        visible: { y: 0, opacity: 1, transition: { type: "spring", stiffness: 100 } },
      }}
      className="bg-gray-800 border border-gray-700 rounded-xl p-6 shadow-lg hover:shadow-sky-500/10 transition-all duration-300 hover:border-sky-500/50"
    >
      <div className="flex items-center mb-4">
        <div className="bg-sky-500/20 p-2 rounded-lg mr-3">{icon}</div>
        <h2 className="text-lg font-semibold text-gray-300">{title}</h2>
      </div>
      <p className="text-4xl font-bold text-sky-300">{value}</p>
      <p className="text-gray-500 text-sm mt-2">{detail}</p>
    </motion.div>
  );
}

export default function AnalyticsPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const response = await getJson("/api/analytics");
        setData(response);
      } catch (error) {
        console.error("Error fetching analytics:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, []);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
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

  const sessionCount = Number(data.sessionCount) || 0;
  const messageCount = Number(data.messageCount) || 0;
  const feedbackCount = Number(data.feedbackCount) || 0;
  const averageRating = Number(data.averageRating) || 0;
  const messagesPerSession = sessionCount > 0 ? Math.round(messageCount / sessionCount) : 0;
  const feedbackRate = sessionCount > 0 ? Math.round((feedbackCount / sessionCount) * 100) : 0;

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

      <div className="container mx-auto px-4 py-12">
        <motion.div
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <MetricCard
            icon={<FaChartBar className="text-sky-400 text-xl" />}
            title="Total Sessions"
            value={sessionCount}
            detail={sessionCount > 0 ? "Sessions created across the platform" : "No sessions created yet"}
          />
          <MetricCard
            icon={<FaComments className="text-sky-400 text-xl" />}
            title="Total Messages"
            value={messageCount}
            detail={`${messagesPerSession} messages per session`}
          />
          <MetricCard
            icon={<FaClipboardCheck className="text-sky-400 text-xl" />}
            title="Total Feedback"
            value={feedbackCount}
            detail={`${feedbackRate}% feedback rate`}
          />
          <MetricCard
            icon={<FaStar className="text-sky-400 text-xl" />}
            title="Average Rating"
            value={averageRating.toFixed(2)}
            detail={feedbackCount > 0 ? "Average across submitted feedback" : "No ratings submitted yet"}
          />
        </motion.div>

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
