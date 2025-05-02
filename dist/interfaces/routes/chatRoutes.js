"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const chatController_1 = __importDefault(require("../controllers/chatController"));
const authMiddleware_1 = require("../../infrastructure/middlewares/authMiddleware");
const router = express_1.default.Router();
router.get("/user-list", (0, authMiddleware_1.verifyToken)(), chatController_1.default.getUsersForChat);
router.post("/send", (0, authMiddleware_1.verifyToken)(), chatController_1.default.sendMessage);
router.get("/:receiverId", (0, authMiddleware_1.verifyToken)(), chatController_1.default.getMessages);
router.put("/mark-seen/:receiverId", (0, authMiddleware_1.verifyToken)(), chatController_1.default.markMessagesAsSeen);
exports.default = router;
