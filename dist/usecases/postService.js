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
const postRepository_1 = __importDefault(require("../infrastructure/repositories/postRepository"));
const userRepository_1 = __importDefault(require("../infrastructure/repositories/userRepository"));
const postServices = {
    createPost(userId, text) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!userId)
                throw new Error("User not found");
            const user = yield userRepository_1.default.findById(userId);
            if (!user)
                throw new Error("User not found");
            if (user.userStatus === "Blocked")
                throw new Error("User is unable to send a post");
            return yield postRepository_1.default.save({ userId, text });
        });
    },
    getPost(page, limit) {
        return __awaiter(this, void 0, void 0, function* () {
            const skip = (page - 1) * limit;
            const total = yield postRepository_1.default.count(); // Get total post count
            const posts = yield postRepository_1.default.findWithPagination(skip, limit);
            return { posts, total };
        });
    },
    toggleLikeDislike(postId, userId, action) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield postRepository_1.default.updateLikeDislike(postId, userId, action);
        });
    },
    getUserPosts(userId, page, limit) {
        return __awaiter(this, void 0, void 0, function* () {
            const skip = (page - 1) * limit;
            return yield postRepository_1.default.findUserPosts(userId, skip, limit);
        });
    },
    // ✅ Delete a post
    deletePost(postId, userId) {
        return __awaiter(this, void 0, void 0, function* () {
            const deletedPost = yield postRepository_1.default.deletePost(postId, userId);
            if (!deletedPost)
                throw new Error("Post not found or unauthorized");
            return { message: "Post deleted successfully" };
        });
    },
    // ✅ Toggle privacy
    togglePostPrivacy(userId, postId) {
        return __awaiter(this, void 0, void 0, function* () {
            const updatedPost = yield postRepository_1.default.togglePostPrivacy(postId, userId);
            return {
                message: `Post is now ${updatedPost.isPublic ? "Public" : "Private"}`,
            };
        });
    },
    getTopLikedProfiles(limit) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield postRepository_1.default.getTopLikedProfiles(limit);
        });
    },
    getShared(shareId) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield postRepository_1.default.getShared(shareId);
        });
    },
    savePost(userId, postId) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!userId || !postId)
                throw new Error("Dependencies not found");
            // ✅ Check if post is already saved
            const existingSaved = yield postRepository_1.default.findSavedPost(userId, postId);
            if (existingSaved)
                throw new Error("Post is already saved");
            return yield postRepository_1.default.savePost(userId, postId);
        });
    },
    getSavedQuotes(userId) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!userId)
                throw new Error("User ID is required");
            return yield postRepository_1.default.getSavedQuotes(userId);
        });
    },
    removeSavedPost(userId, postId) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!userId || !postId)
                throw new Error("Missing user or post id");
            return yield postRepository_1.default.removeSavedPost(userId, postId);
        });
    },
    getAllsavedQuotes(userId) {
        return __awaiter(this, void 0, void 0, function* () {
            const saved = yield postRepository_1.default.getSavedQuotes(userId);
            if (!saved || !saved.quotes.length) {
                throw new Error("No saved posts found");
            }
            return yield postRepository_1.default.savedQuotesText(saved.quotes);
        });
    },
    clearSavedQuotes(userId) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield postRepository_1.default.clearSavedQuotes(userId);
        });
    },
    getMostlikedPost(limit) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield postRepository_1.default.getMostLiked(limit);
        });
    }
};
exports.default = postServices;
