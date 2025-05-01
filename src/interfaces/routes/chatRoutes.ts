    import express from "express";
    import chatController from "../controllers/chatController";
import { verifyToken } from "../../infrastructure/middlewares/authMiddleware";


    const router = express.Router();

    router.get("/user-list", verifyToken(),chatController.getUsersForChat);          
    router.post("/send", verifyToken(),chatController.sendMessage);
    router.get("/:receiverId",verifyToken(), chatController.getMessages);
    router.put("/mark-seen/:receiverId", verifyToken(),chatController.markMessagesAsSeen);


    export default router;
