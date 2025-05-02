"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const adminController_1 = __importDefault(require("../controllers/adminController"));
const authMiddleware_1 = require("../../infrastructure/middlewares/authMiddleware");
const router = express_1.default.Router();
router.post('/login', adminController_1.default.login);
router.post('/refresh-token', adminController_1.default.refreshToken);
router.get("/users", (0, authMiddleware_1.verifyToken)(), (0, authMiddleware_1.authorizeRoles)(['admin']), adminController_1.default.getUsers);
router.post('/block-user', (0, authMiddleware_1.verifyToken)(), (0, authMiddleware_1.authorizeRoles)(['admin']), adminController_1.default.blockUser);
router.delete('/delete-user', (0, authMiddleware_1.verifyToken)(), (0, authMiddleware_1.authorizeRoles)(['admin']), adminController_1.default.deleteUser);
router.get('/user-posts/:userId', (0, authMiddleware_1.verifyToken)(), (0, authMiddleware_1.authorizeRoles)(['admin']), adminController_1.default.getUserPosts);
router.delete("/users/:userId/posts/:postId", (0, authMiddleware_1.verifyToken)(), (0, authMiddleware_1.authorizeRoles)(["admin"]), adminController_1.default.deletePost);
exports.default = router;
