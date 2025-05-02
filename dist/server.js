"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.io = exports.server = void 0;
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const userRoutes_1 = __importDefault(require("./interfaces/routes/userRoutes"));
const adminRoutes_1 = __importDefault(require("./interfaces/routes/adminRoutes"));
const postRoutes_1 = __importDefault(require("./interfaces/routes/postRoutes"));
const chatRoutes_1 = __importDefault(require("./interfaces/routes/chatRoutes"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const db_1 = __importDefault(require("./config/db"));
const http_1 = __importDefault(require("http")); // Required for Socket.io
const socket_io_1 = require("socket.io");
const chatRepository_1 = __importDefault(require("./infrastructure/repositories/chatRepository"));
dotenv_1.default.config();
const app = (0, express_1.default)();
const corsOptions = {
    origin: "http://localhost:5173", // ✅ Correct frontend origin
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
};
app.use((0, cookie_parser_1.default)());
app.use(express_1.default.json());
app.set("trust proxy", 1);
app.use((0, cors_1.default)(corsOptions));
const server = http_1.default.createServer(app); // Create HTTP Server for WebSockets
exports.server = server;
const io = new socket_io_1.Server(server, {
    cors: {
        origin: "http://localhost:5173", // ✅ Fix: Match frontend URL
        methods: ["GET", "POST"],
        credentials: true, // ✅ Allow cross-origin cookies if needed
    },
});
exports.io = io;
// Store connected users
const users = {};
// Listen for WebSocket connections
io.on("connection", (socket) => {
    socket.on("register", (userId) => {
        if (!userId)
            return;
        users[userId] = socket.id;
        socket.join(userId);
    });
    // ✅ Handle typing event
    socket.on("typing", ({ senderId, receiverId }) => {
        if (!senderId || !receiverId || !users[receiverId])
            return;
        io.to(users[receiverId]).emit("typing", { senderId, receiverId });
    });
    socket.on("sendMessage", (data) => {
        const { senderId, receiverId, message } = data;
        if (!senderId || !receiverId || !message)
            return;
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
    socket.on("markSeen", (_a) => __awaiter(void 0, [_a], void 0, function* ({ senderId, receiverId }) {
        console.log("📥 Received markSeen:", { senderId, receiverId });
        if (!senderId || !receiverId)
            return;
        yield chatRepository_1.default.markMessagesAsSeen(receiverId, senderId);
        if (users[senderId]) {
            console.log("📤 Emitting messagesSeen to:", senderId);
            io.to(users[senderId]).emit("messagesSeen", {
                from: receiverId,
            });
            io.to(users[senderId]).emit("userListUpdate");
        }
    }));
    socket.on("disconnect", () => {
        const userId = Object.keys(users).find((key) => users[key] === socket.id);
        if (userId)
            delete users[userId]; // Remove user on disconnect
    });
});
app.use("/api/user", userRoutes_1.default);
app.use("/api/admin", adminRoutes_1.default);
app.use("/api/user/post", postRoutes_1.default);
app.use("/api/user/chat", chatRoutes_1.default);
(0, db_1.default)();
server.listen(3000, () => console.log("🚀 Server running on port 3000"));
