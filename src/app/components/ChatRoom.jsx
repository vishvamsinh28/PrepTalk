"use client";

import { useEffect, useState, useRef } from "react";
import * as Ably from "ably";
import { motion, AnimatePresence } from "framer-motion";
import { FaPaperPlane, FaUsers } from "react-icons/fa";
import { getJson, postJson } from "@/lib/clientApi";

function uniqueUsers(members) {
  return [...new Set(members.map((member) => member.clientId).filter(Boolean))];
}

export default function ChatRoom({ sessionId, userEmail }) {
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [activeUsers, setActiveUsers] = useState([]);

  const messagesEndRef = useRef(null);

  useEffect(() => {
    let isMounted = true;
    const ably = new Ably.Realtime({ authUrl: `/api/ably/token?sessionId=${encodeURIComponent(sessionId)}` });
    const channel = ably.channels.get(`chat:${sessionId}`);

    getJson(`/api/messages?sessionId=${encodeURIComponent(sessionId)}`)
      .then((data) => {
        if (isMounted) setMessages(data.messages);
      })
      .catch((error) => console.error("Error fetching messages:", error));

    const handleMessage = (event) => {
      setMessages((prev) => {
        if (prev.some((msg) => msg._id === event.data._id)) return prev;
        return [...prev, event.data];
      });
    };

    const updatePresence = async () => {
      const members = await channel.presence.get();
      if (isMounted) setActiveUsers(uniqueUsers(members));
    };

    channel.subscribe("message", handleMessage);
    channel.presence.subscribe(updatePresence);
    channel.presence.enter({ userEmail }).then(updatePresence).catch((error) => {
      console.error("Error entering chat presence:", error);
    });

    return () => {
      isMounted = false;
      channel.presence.leave().catch(() => {});
      channel.unsubscribe("message", handleMessage);
      channel.presence.unsubscribe(updatePresence);
      ably.close();
    };
  }, [sessionId, userEmail]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = async () => {
    if (message.trim() === "") return;

    const text = message.trim();
    setMessage("");

    try {
      const saved = await postJson("/api/messages", { sessionId, message: text });
      setMessages((prev) => (
        prev.some((msg) => msg._id === saved.message._id) ? prev : [...prev, saved.message]
      ));
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };

  return (
    <div className="relative z-10 flex h-120 w-full flex-col">
      <div className="mb-4 flex items-center rounded-xl border border-rule bg-white p-3 text-sm text-ink-soft">
        <FaUsers className="mr-2 text-accent" />
        <strong className="mr-2 text-ink">Active:</strong>
        {activeUsers.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {activeUsers.map((user, idx) => (
              <span key={idx} className="rounded-lg border border-accent bg-accent/10 px-2.5 py-1 text-xs font-bold text-accent">
                {user}
              </span>
            ))}
          </div>
        ) : (
          <span className="text-ink-soft">No users online</span>
        )}
      </div>

      <div className="mb-4 min-h-0 flex-1 space-y-3 overflow-y-auto rounded-xl border border-rule bg-white p-4 custom-scroll">
        <AnimatePresence>
          {messages.map((msg, index) => (
            <motion.div
            key={msg._id || index}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className={`flex ${
                msg.sender === userEmail ? "justify-end" : "justify-start"
              }`}
            >
              <div
                className={`px-3 py-2 rounded-lg text-sm ${
                  msg.sender === userEmail
                    ? "rounded-br-none bg-ink font-semibold text-canvas"
                    : "rounded-bl-none border border-rule bg-black/5 text-ink"
                }`}
              >
                <strong className="mb-1 block text-xs opacity-70">
                  {msg.sender === userEmail ? "You" : msg.sender}
                </strong>
                {msg.message}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
        <div ref={messagesEndRef} />
      </div>

      <div className="flex">
        <input
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Type your message..."
          className="field-surface min-w-0 grow rounded-l-lg border-r-0 px-4 py-3 transition"
        />
        <button
          onClick={handleSendMessage}
          className="rounded-r-lg bg-ink px-5 py-3 text-canvas transition hover:brightness-110"
          aria-label="Send message"
        >
          <FaPaperPlane />
        </button>
      </div>
    </div>
  );
}
