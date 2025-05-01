
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import authRoutes from "./interfaces/routes/userRoutes";
import adminRoutes from "./interfaces/routes/adminRoutes";
import postRoutes from "./interfaces/routes/postRoutes";
import chatRoutes from "./interfaces/routes/chatRoutes";
import cookieParser from "cookie-parser";
import connectDB from "./config/db";
import http from "http"; // Required for Socket.io
import { Server } from "socket.io";
import chatRepository from "./infrastructure/repositories/chatRepository";

dotenv.config();
const app = express();

const corsOptions = {
  origin: "http://localhost:5173", // ✅ Correct frontend origin
  methods: ["GET", "POST", "PUT", "DELETE"],
  credentials: true,
};

app.use(cookieParser());
app.use(express.json());
app.set("trust proxy", 1)
app.use(cors(corsOptions));

const server = http.createServer(app); // Create HTTP Server for WebSockets

const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173", // ✅ Fix: Match frontend URL
    methods: ["GET", "POST"],
    credentials: true, // ✅ Allow cross-origin cookies if needed
  },
});

// Store connected users
const users: { [key: string]: string } = {};

// Listen for WebSocket connections
io.on("connection", (socket) => {

  socket.on("register", (userId) => {
    if (!userId) return;
    users[userId] = socket.id;
    socket.join(userId);
  });

  // ✅ Handle typing event
  socket.on("typing", ({ senderId, receiverId }) => {
    if (!senderId || !receiverId || !users[receiverId]) return;
  
    io.to(users[receiverId]).emit("typing", { senderId, receiverId });
  });
  

  socket.on("sendMessage", (data) => {
    const { senderId, receiverId, message } = data;
  
    if (!senderId || !receiverId || !message) return;
  
    // Send only to the specific sockets
    const receiverSocketId = users[receiverId];
    const senderSocketId = users[senderId];
  
    if (receiverSocketId) {
      io.to(receiverSocketId).emit("newMessage", data);
      io.to(receiverSocketId).emit("userListUpdate");
    }
  
    if (senderSocketId && senderSocketId !== receiverSocketId) {
      io.to(senderSocketId).emit("newMessage", data);
      io.to(receiverSocketId).emit("userListUpdate");
    }
  });
  

  socket.on("markSeen", async ({ senderId, receiverId }) => {
    console.log("📥 Received markSeen:", { senderId, receiverId });
  
    if (!senderId || !receiverId) return;
  
    await chatRepository.markMessagesAsSeen(receiverId, senderId);
  
    if (users[senderId]) {
      console.log("📤 Emitting messagesSeen to:", senderId);
      io.to(users[senderId]).emit("messagesSeen", {
        from: receiverId,
      });
      io.to(users[senderId]).emit("userListUpdate");
    }
  });
  
  socket.on("disconnect", () => {
    const userId = Object.keys(users).find((key) => users[key] === socket.id);
    if (userId) delete users[userId]; // Remove user on disconnect
  });
});

app.use("/api/user", authRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/user/post", postRoutes);
app.use("/api/user/chat", chatRoutes);

connectDB();

export { server, io };
server.listen(3000, () => console.log("🚀 Server running on port 3000"));





