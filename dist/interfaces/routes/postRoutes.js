"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const postController_1 = __importDefault(require("../controllers/postController"));
const authMiddleware_1 = require("../../infrastructure/middlewares/authMiddleware");
const protectionMiddleware_1 = require("../../infrastructure/middlewares/protectionMiddleware");
const router = express_1.default.Router();
router.post("/add-post", (0, authMiddleware_1.verifyToken)(), (0, authMiddleware_1.authorizeRoles)(["user", "admin"]), protectionMiddleware_1.userPostRateLimiter, postController_1.default.addPost);
router.get("/get-post", (0, authMiddleware_1.verifyToken)(), (0, authMiddleware_1.authorizeRoles)(["user", "admin"]), postController_1.default.getPosts);
router.put("/toggle-like-dislike", (0, authMiddleware_1.verifyToken)(), postController_1.default.toggleLikeDislike);
router.get("/my-posts", (0, authMiddleware_1.verifyToken)(), postController_1.default.getUserPosts);
router.delete("/:postId", (0, authMiddleware_1.verifyToken)(), postController_1.default.deletePost);
router.put("/toggle-privacy/:postId", (0, authMiddleware_1.verifyToken)(), postController_1.default.togglePostPrivacy);
router.get("/top-liked-profiles", (0, authMiddleware_1.verifyToken)(), postController_1.default.getTopLikedProfiles);
router.get("/quotes/:shareId", postController_1.default.getSharedQuote);
router.get("/saved-quotes", (0, authMiddleware_1.verifyToken)(), postController_1.default.getSavedQuotesController);
router.post("/saved-quotes/save", (0, authMiddleware_1.verifyToken)(), postController_1.default.savePost);
router.delete("/saved-quotes/remove", (0, authMiddleware_1.verifyToken)(), postController_1.default.removeSavedPost);
router.get("/list-saved-quotes", (0, authMiddleware_1.verifyToken)(), postController_1.default.listSavedQuotes);
//error need to fix (the route is not callling)
router.post("/clear-quotes", (0, authMiddleware_1.verifyToken)(), postController_1.default.clearSavedQuote);
router.get('/most-liked', (0, authMiddleware_1.verifyToken)(), postController_1.default.getMostLikedPost);
exports.default = router;
