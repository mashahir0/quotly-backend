import express from "express";
import adminController from "../controllers/adminController";
import tokenService from "../../usecases/tokenService";
import { authorizeRoles, verifyToken } from "../../infrastructure/middlewares/authMiddleware";
import { loginLimiter } from "../../infrastructure/middlewares/protectionMiddleware";

const router = express.Router();
router.post('/login',loginLimiter,adminController.login)
router.post('/refresh-token',adminController.refreshToken)
router.get("/users",verifyToken(),authorizeRoles(['admin']),adminController.getUsers);
router.post('/block-user',verifyToken(),authorizeRoles(['admin']),adminController.blockUser)
router.delete('/delete-user',verifyToken(),authorizeRoles(['admin']),adminController.deleteUser)
router.get('/user-posts/:userId', verifyToken(), authorizeRoles(['admin']), adminController.getUserPosts);
router.delete("/users/:userId/posts/:postId", verifyToken(), authorizeRoles(["admin"]), adminController.deletePost);


export default router;
