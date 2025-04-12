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

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI).then(() => {
  console.log("✅ MongoDB connected inside socket server");
}).catch((err) => {
  console.error("MongoDB connection error:", err);
});

app.prepare().then(() => {
  const server = createServer((req, res) => {
    handle(req, res);
  });

  const io = new Server(server);

  io.on("connection", (socket) => {
    console.log("🟢 New client connected:", socket.id);

    socket.on("joinRoom", async (sessionId) => {
      socket.join(sessionId);
      console.log(`Socket ${socket.id} joined room ${sessionId}`);

      try {
        const messages = await Message.find({ sessionId }).sort({ createdAt: 1 });
        socket.emit("chatHistory", messages);
      } catch (err) {
        console.error("Error fetching messages:", err);
      }
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

    socket.on("disconnect", () => {
      console.log("🔴 Client disconnected:", socket.id);
    });
  });

  const port = process.env.PORT || 3000;
  server.listen(port, "0.0.0.0", () => {
    console.log(`> Ready on http://localhost:${port}`);
  });
});
