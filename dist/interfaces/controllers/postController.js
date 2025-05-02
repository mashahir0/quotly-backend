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
const postService_1 = __importDefault(require("../../usecases/postService"));
const server_1 = require("../../server");
const postController = {
    addPost(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            try {
                const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
                if (!userId)
                    throw new Error("user is not authenticated ");
                const { text } = req.body;
                const len = text.trim().length;
                if (len < 100 || len > 310) {
                    return res.status(400).json({
                        message: "Text must be between 100 and 300 characters.",
                    });
                }
                yield postService_1.default.createPost(userId, text);
                res.status(200).json({ message: "post created successfully" });
            }
            catch (error) {
                console.log(error);
                res.status(400).json({ error: error.message });
            }
        });
    },
    getPosts(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const page = parseInt(req.query.page) || 1;
                const limit = parseInt(req.query.limit) || 9;
                const { posts, total } = yield postService_1.default.getPost(page, limit);
                res.status(200).json({
                    posts,
                    currentPage: page,
                    totalPages: Math.ceil(total / limit),
                    hasMore: page * limit < total,
                });
            }
            catch (error) {
                console.error("Error fetching posts:", error);
                res.status(500).json({ message: "Internal Server Error" });
            }
        });
    },
    toggleLikeDislike(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            try {
                const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id; // Ensure user is authenticated
                const { postId, action } = req.body; // "like" or "dislike"
                if (!userId)
                    return res.status(401).json({ message: "Unauthorized" });
                const updatedPost = yield postService_1.default.toggleLikeDislike(postId, userId, action);
                // Emit like update event to all connected clients
                server_1.io.emit("updateLikes", {
                    postId,
                    likes: updatedPost.likes,
                    dislikes: updatedPost.dislikes,
                });
                const topLikedPosts = yield postService_1.default.getMostlikedPost(5);
                server_1.io.emit("updateTopPosts", topLikedPosts);
                const topProfiles = yield postService_1.default.getTopLikedProfiles(5);
                server_1.io.emit("updateScoreboard", topProfiles);
                res.status(200).json(updatedPost);
            }
            catch (error) {
                console.log(error);
                res.status(500).json({ message: "Server Error", error: error.message });
            }
        });
    },
    getUserPosts(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            try {
                const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
                if (!userId)
                    return res.status(401).json({ message: "Unauthorized" });
                const page = parseInt(req.query.page) || 1;
                const limit = parseInt(req.query.limit) || 5;
                const result = yield postService_1.default.getUserPosts(userId, page, limit);
                res.status(200).json(result);
            }
            catch (error) {
                res
                    .status(500)
                    .json({ message: "Error fetching user posts", error: error.message });
            }
        });
    },
    // ✅ Delete a post
    deletePost(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            try {
                const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
                const { postId } = req.params;
                if (!userId)
                    return res.status(401).json({ message: "Unauthorized" });
                const result = yield postService_1.default.deletePost(postId, userId);
                res.status(200).json(result);
            }
            catch (error) {
                console.log(error);
                res.status(400).json({ message: error.message });
            }
        });
    },
    // ✅ Toggle post privacy
    togglePostPrivacy(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            try {
                const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
                const { postId } = req.params;
                if (!userId)
                    return res.status(401).json({ message: "Unauthorized" });
                const result = yield postService_1.default.togglePostPrivacy(userId, postId);
                res.status(200).json(result);
            }
            catch (error) {
                res.status(400).json({ message: error.message });
            }
        });
    },
    getTopLikedProfiles(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const limit = parseInt(req.query.limit) || 5;
                const topProfiles = yield postService_1.default.getTopLikedProfiles(limit);
                // ✅ Emit live updates to clients
                server_1.io.emit("updateScoreboard", topProfiles);
                // example inside your like controller
                res.status(200).json(topProfiles);
            }
            catch (error) {
                res
                    .status(500)
                    .json({ message: "Error fetching top profiles", error: error.message });
            }
        });
    },
    getSharedQuote(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { shareId } = req.params;
                if (!shareId)
                    res.status(401).json({ message: 'shareId not found' });
                const post = yield postService_1.default.getShared(shareId);
                res.status(200).json(post);
            }
            catch (error) {
                res.status(500).json({ message: "Error fetching post", error: error });
            }
        });
    },
    savePost(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            try {
                const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id; // ✅ Ensure it's a string
                const { postId } = req.body;
                if (!userId || !postId) {
                    return res.status(400).json({ message: "Missing userId or postId" });
                }
                const response = yield postService_1.default.savePost(userId, postId);
                res.status(200).json(response);
            }
            catch (error) {
                res.status(500).json({
                    message: "Error occurred while saving post",
                    error: error.message,
                });
            }
        });
    },
    getSavedQuotesController(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            try {
                const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
                if (!userId) {
                    return res.status(401).json({ message: "User not authenticated" });
                }
                const savedQuotes = yield postService_1.default.getSavedQuotes(userId);
                res.status(200).json(savedQuotes);
            }
            catch (error) {
                res.status(500).json({
                    message: "Error retrieving saved quotes",
                    error: error.message,
                });
            }
        });
    },
    removeSavedPost(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            try {
                const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
                const { postId } = req.body;
                if (!userId || !postId) {
                    return res.status(400).json({ message: "Missing userId or postId" });
                }
                const result = yield postService_1.default.removeSavedPost(userId, postId);
                res.status(200).json({ message: "Removed from saved successfully", result });
            }
            catch (error) {
                res.status(500).json({
                    message: "Error removing saved post",
                    error: error.message,
                });
            }
        });
    },
    listSavedQuotes(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            try {
                const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
                if (!userId) {
                    return res.status(401).json({ message: "User not authenticated" });
                }
                const savedQuotes = yield postService_1.default.getAllsavedQuotes(userId);
                res.status(200).json(savedQuotes);
            }
            catch (error) {
                res.status(500).json({
                    message: "Error retrieving saved quotes",
                    error: error.message,
                });
            }
        });
    },
    clearSavedQuote(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            try {
                const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
                if (!userId) {
                    return res.status(401).json({ message: "Unauthorized" });
                }
                yield postService_1.default.clearSavedQuotes(userId);
                res.status(200).json({ message: "Saved quotes cleared successfully" });
            }
            catch (error) {
                console.error("Error clearing saved quotes:", error);
                res.status(500).json({ message: "Something went wrong while clearing saved quotes" });
            }
        });
    },
    getMostLikedPost(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const limit = parseInt(req.query.limit) || 5; // ✅ Convert string to number
                if (isNaN(limit)) {
                    return res.status(400).json({ error: "Invalid limit value" });
                }
                const posts = yield postService_1.default.getMostlikedPost(limit);
                res.status(200).json(posts);
            }
            catch (error) {
                res.status(500).json({ error: "Failed to fetch posts" });
            }
        });
    }
};
exports.default = postController;
