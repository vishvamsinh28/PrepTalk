const { createServer } = require("http");
const { Server } = require("socket.io");
const next = require("next");
const mongoose = require("mongoose");
const dotenv = require("dotenv");

// Import Message model
const Message = require("./models/Message");
const Session = require("./models/Session");

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

      // Send existing messages when user joins
      try {
        const messages = await Message.find({ sessionId }).sort({ createdAt: 1 });
        socket.emit("chatHistory", messages);
      } catch (err) {
        console.error("Error fetching messages:", err);
      }
    });

    socket.on("sendMessage", async ({ sessionId, message, sender }) => {
      // Save message to DB
      try {
        const newMessage = new Message({ sessionId, message, sender });
        await newMessage.save();
      } catch (err) {
        console.error("Error saving message:", err);
      }

      // Broadcast to room
      io.to(sessionId).emit("receiveMessage", { message, sender });
    });

    socket.on("disconnect", () => {
      console.log("🔴 Client disconnected:", socket.id);
    });
  });

  const port = process.env.PORT || 3000;
  server.listen(port, () => {
    console.log(`> Ready on http://localhost:${port}`);
  });
});
