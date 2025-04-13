"use client";

import { motion } from "framer-motion";
import { FaRegCommentDots, FaComments, FaCheckCircle, FaArrowLeft, FaStar, FaClipboardList, FaChartBar } from "react-icons/fa";

export default function FeedbackClient({ feedbacks, sessions }) {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.2, delayChildren: 0.3 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  const totalRatings = feedbacks.reduce((sum, fb) => sum + fb.rating, 0);
  const averageRating = feedbacks.length > 0 ? (totalRatings / feedbacks.length).toFixed(1) : 0;

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 relative px-4 py-10 mt-15">
      {/* Background pattern */}
      <div className="absolute inset-0 bg-[url('/images/pattern.svg')] bg-repeat opacity-5"></div>

      {/* Main container */}
      <motion.div
        initial="hidden"
        animate="visible"
        variants={containerVariants}
        className="max-w-6xl mx-auto relative z-10"
      >
        {/* Top: Back Button */}
        <motion.div variants={itemVariants} className="mb-8">
          <button
            onClick={() => window.location.href = "/moderator"}
            className="flex items-center bg-gray-800 hover:bg-gray-700 text-sky-400 px-4 py-2 rounded-lg border border-sky-500/30 hover:border-sky-500/50 transition-all group"
          >
            <FaArrowLeft className="mr-2 group-hover:-translate-x-1 transition-transform" />
            Back to Dashboard
          </button>
        </motion.div>

        {/* Header */}
        <motion.div variants={itemVariants} className="text-center mb-10">
          <div className="bg-sky-500/20 p-3 rounded-full inline-flex mb-4">
            <FaRegCommentDots className="text-3xl text-sky-300" />
          </div>
          <h1 className="text-4xl font-bold text-sky-300 mb-3">All Feedbacks 📝</h1>
          <p className="text-gray-400">See what participants are saying about your sessions.</p>
        </motion.div>

        {/* Stats Summary */}
        <motion.div variants={itemVariants} className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-10">
          <div className="bg-gray-800 p-4 rounded-lg text-center border border-gray-700">
            <FaClipboardList className="text-sky-400 text-3xl mb-2 mx-auto" />
            <h3 className="text-xl font-bold text-sky-300">{feedbacks.length}</h3>
            <p className="text-gray-400 text-sm">Total Feedbacks</p>
          </div>
          <div className="bg-gray-800 p-4 rounded-lg text-center border border-gray-700">
            <FaStar className="text-yellow-400 text-3xl mb-2 mx-auto" />
            <h3 className="text-xl font-bold text-yellow-300">{averageRating}</h3>
            <p className="text-gray-400 text-sm">Average Rating</p>
          </div>
          <div className="bg-gray-800 p-4 rounded-lg text-center border border-gray-700">
            <FaChartBar className="text-sky-400 text-3xl mb-2 mx-auto" />
            <h3 className="text-xl font-bold text-sky-300">{Object.keys(sessions).length}</h3>
            <p className="text-gray-400 text-sm">Total Sessions</p>
          </div>
        </motion.div>

        {/* Filter options (placeholders for now) */}
        <motion.div variants={itemVariants} className="flex flex-wrap gap-4 mb-8 justify-center">
          <select className="bg-gray-800 border border-gray-700 text-gray-400 p-2 rounded-lg focus:outline-none focus:border-sky-500">
            <option>Filter by Session</option>
            {Object.values(sessions).map((session) => (
              <option key={session._id} value={session._id}>
                {session.title}
              </option>
            ))}
          </select>
          <select className="bg-gray-800 border border-gray-700 text-gray-400 p-2 rounded-lg focus:outline-none focus:border-sky-500">
            <option>Filter by Rating</option>
            {[5, 4, 3, 2, 1].map((rating) => (
              <option key={rating} value={rating}>{rating} Stars</option>
            ))}
          </select>
        </motion.div>

        {/* No Feedback State */}
        {feedbacks.length === 0 ? (
          <motion.div variants={itemVariants} className="text-center text-gray-400 bg-gray-800 p-8 rounded-xl border border-gray-700">
            <FaComments className="text-5xl text-sky-500 mb-4 mx-auto" />
            <p className="text-lg">No feedback submitted yet.</p>
            <p className="text-sm text-gray-500">Encourage participants to share their thoughts!</p>
          </motion.div>
        ) : (
          // Feedback List
          <motion.div className="grid grid-cols-1 md:grid-cols-2 gap-6" variants={containerVariants}>
            {feedbacks.map((fb) => {
              const session = sessions[fb.sessionId] || {};

              return (
                <motion.div
                  key={fb._id}
                  variants={itemVariants}
                  className="bg-gray-800 border border-gray-700 p-6 rounded-xl shadow-lg hover:border-sky-500/50 transition-all duration-300"
                >
                  <div className="mb-4">
                    <h3 className="text-xl font-semibold text-sky-300 mb-1">{session.title || "Unknown Session"}</h3>
                    <p className="text-gray-400 text-sm italic">{session.topic || "Unknown Topic"}</p>
                  </div>

                  <div className="text-gray-300 space-y-1 mb-4">
                    <p><strong>By:</strong> {fb.userEmail} ({fb.role})</p>
                    <p><strong>Rating:</strong> {fb.rating} / 5</p>
                    <p><strong>Comments:</strong> {fb.comments || "No comments"}</p>
                  </div>

                  <div className="text-gray-500 text-sm flex items-center gap-2">
                    <FaCheckCircle className="text-sky-400" />
                    {new Date(fb.createdAt).toLocaleString()}
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        )}

        {/* Engagement nudge */}
        <motion.div variants={itemVariants} className="text-center text-gray-500 text-sm mt-12">
          <p>🙏 Thank you for helping improve PrepTalk with your valuable feedback!</p>
        </motion.div>
      </motion.div>
    </div>
  );
}
