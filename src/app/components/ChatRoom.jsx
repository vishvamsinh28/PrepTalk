"use client";

import { useEffect, useState, useRef } from "react";
import * as Ably from "ably";
import { motion, AnimatePresence } from "framer-motion";
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
    <div className="flex h-[30rem] w-full flex-col">
      <p className="app-eyebrow shrink-0">
        {activeUsers.length > 0 ? `Active · ${activeUsers.join(", ")}` : "Nobody else here yet"}
      </p>

      <div className="mt-4 min-h-0 flex-1 overflow-y-auto border-t border-rule">
        {messages.length === 0 ? (
          <p className="py-10 text-center text-sm text-ink-soft">
            No messages yet. Say hello.
          </p>
        ) : (
          <ul className="space-y-4 py-4">
            <AnimatePresence>
              {messages.map((msg, index) => {
                const isSelf = msg.sender === userEmail;
                return (
                  <motion.li
                    key={msg._id || index}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className={isSelf ? "pl-10 text-right" : "pr-10"}
                  >
                    <p className="app-eyebrow">{isSelf ? "You" : msg.sender}</p>
                    <p
                      className={`mt-1 inline-block max-w-full whitespace-pre-wrap break-words rounded-[4px] px-3 py-2 text-left text-sm leading-[1.5] ${
                        isSelf ? "bg-ink text-canvas" : "border border-rule bg-white text-ink"
                      }`}
                    >
                      {msg.message}
                    </p>
                  </motion.li>
                );
              })}
            </AnimatePresence>
            <div ref={messagesEndRef} />
          </ul>
        )}
      </div>

      <div className="mt-4 flex shrink-0 gap-2 border-t border-rule pt-4">
        <input
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              handleSendMessage();
            }
          }}
          placeholder="Type your message…"
          className="field-surface min-w-0 grow rounded-[4px] px-4 py-2.5 text-sm"
        />
        <button onClick={handleSendMessage} className="btn-ink shrink-0 px-5 py-2.5 text-sm">
          Send
        </button>
      </div>
    </div>
  );
}
