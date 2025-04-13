import { createServer } from "http";
import { Server } from "socket.io";
import next from "next";
import mongoose from "mongoose";
import dotenv from "dotenv";
import Message from "./src/models/Message.js";
import Session from "./src/models/Session.js";

dotenv.config();

const dev = process.env.NODE_ENV !== "production";
const app = next({ dev });
const handle = app.getRequestHandler();

const activeUsers = {};

mongoose.connect(process.env.MONGODB_URI).then(() => {
  console.log("✅ MongoDB connected inside socket server");
}).catch((err) => {
  console.error("MongoDB connection error:", err);
});

app.prepare().then(() => {
  const server = createServer((req, res) => {
    handle(req, res);
  });

  const io = new Server(server, {
    cors: {
      origin: ["https://preptalk.onrender.com/"],
      methods: ["GET", "POST"]
    }
  });

  io.on("connection", (socket) => {
    console.log("🟢 New client connected:", socket.id);

    socket.on("joinRoom", async (sessionId, userEmail) => {
      socket.join(sessionId);
      console.log(`💬 ${userEmail} joined chat room: ${sessionId}`);

      if (!activeUsers[sessionId]) activeUsers[sessionId] = [];
      activeUsers[sessionId].push({ socketId: socket.id, userEmail });

      try {
        const messages = await Message.find({ sessionId }).sort({ createdAt: 1 });
        socket.emit("chatHistory", messages);
      } catch (err) {
        console.error("Error fetching messages:", err);
      }

      io.to(sessionId).emit("activeUsers", activeUsers[sessionId].map((u) => u.userEmail));
    });

    socket.on("sendMessage", async ({ sessionId, message, sender }) => {
      try {
        const newMessage = new Message({ sessionId, message, sender });
        await newMessage.save();
      } catch (err) {
        console.error("Error saving message:", err);
      }

      io.to(sessionId).emit("receiveMessage", { message, sender });
    });

    socket.on("joinVideoRoom", (sessionId, userEmail) => {
      socket.join(sessionId);
      console.log(`🎥 ${userEmail} joined video room: ${sessionId}`);

      socket.to(sessionId).emit("userJoinedVideoRoom", { socketId: socket.id, userEmail });
    });

    socket.on("sendingSignal", ({ userToSignal, callerId, signal }) => {
      io.to(userToSignal).emit("userIncomingSignal", { signal, callerId });
    });

    socket.on("returningSignal", ({ callerId, signal }) => {
      io.to(callerId).emit("receivingReturnedSignal", { signal, id: socket.id });
    });

    socket.on("disconnect", () => {
      console.log("🔴 Client disconnected:", socket.id);

      for (const sessionId in activeUsers) {
        activeUsers[sessionId] = activeUsers[sessionId].filter(user => user.socketId !== socket.id);
        io.to(sessionId).emit("activeUsers", activeUsers[sessionId].map((u) => u.userEmail));

        io.to(sessionId).emit("userLeftVideoRoom", { socketId: socket.id });
      }
    });
  });

  const port = process.env.PORT || 3000;
  server.listen(port, "0.0.0.0", () => {
    console.log(`> Ready on http://localhost:${port}`);
  });
});
