"use client";

import { useEffect, useState, useRef } from "react";
import io from "socket.io-client";
import { motion, AnimatePresence } from "framer-motion";
import { FaPaperPlane, FaUsers } from "react-icons/fa";

let socket;

export default function ChatRoom({ sessionId, userEmail }) {
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [activeUsers, setActiveUsers] = useState([]);

  const messagesEndRef = useRef(null);

  useEffect(() => {
    socket = io();

    socket.emit("joinRoom", sessionId, userEmail);

    socket.on("chatHistory", (history) => {
      setMessages(history);
    });

    socket.on("receiveMessage", (data) => {
      setMessages((prev) => [...prev, data]);
    });

    socket.on("activeUsers", (users) => {
      setActiveUsers(users);
    });

    return () => {
      socket.disconnect();
    };
  }, [sessionId, userEmail]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = () => {
    if (message.trim() === "") return;

    socket.emit("sendMessage", { sessionId, message, sender: userEmail });
    setMessages((prev) => [...prev, { message, sender: "You" }]);
    setMessage("");
  };

  return (
    <div className="w-full max-w-2xl bg-gray-800 border border-gray-700 rounded-xl shadow-xl p-6 relative z-10">
      {/* Active Users */}
      <div className="flex items-center mb-4 bg-gray-700 p-3 rounded-lg text-gray-300 text-sm">
        <FaUsers className="text-sky-400 mr-2" />
        <strong className="mr-2">Active Users:</strong>
        {activeUsers.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {activeUsers.map((user, idx) => (
              <span key={idx} className="bg-sky-500/20 px-2 py-0.5 rounded text-sky-300 text-xs">
                {user}
              </span>
            ))}
          </div>
        ) : (
          <span className="text-gray-400">No users online</span>
        )}
      </div>

      {/* Messages */}
      <div className="bg-gray-700 rounded-lg p-4 h-64 overflow-y-auto space-y-3 mb-4 custom-scroll">
        <AnimatePresence>
          {messages.map((msg, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className={`flex ${
                msg.sender === "You" ? "justify-end" : "justify-start"
              }`}
            >
              <div
                className={`px-3 py-2 rounded-lg text-sm ${
                  msg.sender === "You"
                    ? "bg-sky-500 text-white rounded-br-none"
                    : "bg-gray-600 text-gray-200 rounded-bl-none"
                }`}
              >
                <strong className="block text-xs opacity-70 mb-1">
                  {msg.sender}
                </strong>
                {msg.message}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="flex mt-2">
        <input
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Type your message..."
          className="flex-grow bg-gray-700 border border-gray-600 text-gray-100 p-3 rounded-l-lg focus:outline-none focus:border-sky-500"
        />
        <button
          onClick={handleSendMessage}
          className="bg-gradient-to-r from-sky-500 to-blue-500 text-white px-5 py-3 rounded-r-lg hover:scale-105 transform transition duration-300"
        >
          <FaPaperPlane />
        </button>
      </div>
    </div>
  );
}
