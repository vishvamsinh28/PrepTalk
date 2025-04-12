"use client";

import { useEffect, useState } from "react";
import io from "socket.io-client";

let socket;

export default function ChatRoom({ sessionId, userEmail }) {
    const [message, setMessage] = useState("");
    const [messages, setMessages] = useState([]);
    const [activeUsers, setActiveUsers] = useState([]);

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
      }, [sessionId]);
      

    const handleSendMessage = () => {
        if (message.trim() === "") return;

        socket.emit("sendMessage", { sessionId, message, sender: userEmail });
        setMessages((prev) => [...prev, { message, sender: "You" }]);
        setMessage("");
    };

    return (
        <div className="w-full max-w-md mt-8">
            <div className="bg-white p-2 rounded shadow mb-4 w-full text-sm text-gray-600">
                <strong>Active Users:</strong> {activeUsers.join(", ") || "No users online"}
            </div>

            <div className="bg-white p-4 rounded shadow h-64 overflow-y-auto space-y-2">
                {messages.map((msg, index) => (
                    <div key={index} className="text-sm">
                        <strong>{msg.sender}: </strong>{msg.message}
                    </div>
                ))}
            </div>

            <div className="flex mt-2">
                <input
                    type="text"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Type your message..."
                    className="border p-2 flex-grow rounded-l"
                />
                <button
                    onClick={handleSendMessage}
                    className="bg-blue-500 text-white px-4 py-2 rounded-r hover:bg-blue-600 transition"
                >
                    Send
                </button>
            </div>
        </div>
    );
}
