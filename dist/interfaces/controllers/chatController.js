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
const chatServices_1 = __importDefault(require("../../usecases/chatServices"));
const chatController = {
    // ✅ Send a new message
    //   async sendMessage(req: AuthenticatedRequest, res: Response) {
    //     try {
    //         console.log('send messag cont')
    //       const { receiverId, message } = req.body;
    //       const senderId = req.user?.id;
    //       if (!senderId || !receiverId || !message) return res.status(400).json({ message: "Invalid data" });
    //       const newMessage = await chatService.sendMessage(senderId, receiverId, message);
    //       console.log(`📩 Sending message from ${senderId} to ${receiverId}`);
    //         console.log(`Message Content:`, newMessage);
    //     io.to(receiverId).emit("newMessage", newMessage);
    //     io.to(senderId).emit("newMessage", newMessage);
    //       res.status(201).json(newMessage);
    //     } catch (error:any) {
    //       res.status(500).json({ message: "Error sending message", error: error.message });
    //     }
    //   },
    sendMessage(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            try {
                const { receiverId, message } = req.body;
                const senderId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
                if (!senderId || !receiverId || !message) {
                    return res.status(400).json({ message: "Invalid data" });
                }
                // Store message in DB
                const newMessage = yield chatServices_1.default.sendMessage(senderId, receiverId, message);
                // ✅ Do NOT emit via WebSocket (handled separately)
                res.status(201).json(newMessage);
            }
            catch (error) {
                res.status(500).json({ message: "Error sending message", error: error.message });
            }
        });
    },
    // ✅ Get message history
    getMessages(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            try {
                const senderId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
                const { receiverId } = req.params;
                if (!senderId || !receiverId)
                    return res.status(400).json({ message: "Invalid data" });
                const messages = yield chatServices_1.default.getMessages(senderId, receiverId);
                res.status(200).json(messages);
            }
            catch (error) {
                res.status(500).json({ message: "Error fetching messages", error: error.message });
            }
        });
    },
    // ✅ Mark messages as seen
    markMessagesAsSeen(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            try {
                const senderId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
                const { receiverId } = req.params;
                if (!senderId) {
                    return res.status(401).json({ message: "Unauthorized: No sender ID found" });
                }
                yield chatServices_1.default.markMessagesAsSeen(senderId, receiverId);
                res.status(200).json({ message: "Messages marked as seen" });
            }
            catch (error) {
                res.status(500).json({ message: "Error marking messages", error: error.message });
            }
        });
    },
    getUsersForChat(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            try {
                const { search = "", page = "1", limit = "20" } = req.query;
                const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
                if (!userId)
                    return res.status(401).json({ message: "Unauthorized" });
                const usersData = yield chatServices_1.default.getRecentUsersPaginated(userId, search, Number(page), Number(limit));
                if (!usersData)
                    return res.status(401).json({ message: "user data not found" });
                res.json({
                    users: usersData.users,
                    total: usersData.total,
                });
            }
            catch (error) {
                console.error("Error getting paginated chat users", error);
                res.status(500).json({ message: "Server error" });
            }
        });
    }
};
exports.default = chatController;
