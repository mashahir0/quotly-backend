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
const mongoose_1 = __importDefault(require("mongoose"));
const postModel_1 = __importDefault(require("../../domain/models/postModel"));
const savePostModel_1 = __importDefault(require("../../domain/models/savePostModel"));
const postRepository = {
    save(postData) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield postModel_1.default.create({
                userId: new mongoose_1.default.Types.ObjectId(postData.userId),
                text: postData.text,
                likes: 0,
                dislikes: 0,
                likedBy: [],
                dislikedBy: [],
            });
        });
    },
    count() {
        return __awaiter(this, arguments, void 0, function* (filter = {}) {
            return yield postModel_1.default.countDocuments(filter);
        });
    },
    findWithPagination(skip, limit) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield postModel_1.default
                .find({ isPublic: true })
                .sort({ createdAt: -1 }) // Newest posts first
                .skip(skip)
                .limit(limit)
                .populate("userId", "name photo"); // Get only `name` from User model
        });
    },
    deletePostsByUser(userId) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield postModel_1.default.deleteMany({ userId: new mongoose_1.default.Types.ObjectId(userId) });
        });
    },
    updateLikeDislike(postId, userId, action) {
        return __awaiter(this, void 0, void 0, function* () {
            const post = yield postModel_1.default.findById(postId);
            if (!post)
                throw new Error("Post not found");
            const userObjectId = new mongoose_1.default.Types.ObjectId(userId); // Convert to ObjectId
            // Convert `ObjectId[]` to `string[]` before using `.includes()`
            const likedBy = post.likedBy.map((id) => id.toString());
            const dislikedBy = post.dislikedBy.map((id) => id.toString());
            const hasLiked = likedBy.includes(userId);
            const hasDisliked = dislikedBy.includes(userId);
            if (action === "like") {
                if (hasLiked) {
                    post.likes -= 1;
                    post.likedBy = post.likedBy.filter((id) => id.toString() !== userId);
                }
                else {
                    post.likes += 1;
                    post.likedBy.push(userObjectId);
                    if (hasDisliked) {
                        post.dislikes -= 1;
                        post.dislikedBy = post.dislikedBy.filter((id) => id.toString() !== userId);
                    }
                }
            }
            else if (action === "dislike") {
                if (hasDisliked) {
                    post.dislikes -= 1;
                    post.dislikedBy = post.dislikedBy.filter((id) => id.toString() !== userId);
                }
                else {
                    post.dislikes += 1;
                    post.dislikedBy.push(userObjectId);
                    if (hasLiked) {
                        post.likes -= 1;
                        post.likedBy = post.likedBy.filter((id) => id.toString() !== userId);
                    }
                }
            }
            return yield post.save();
        });
    },
    findUserPosts(userId, skip, limit) {
        return __awaiter(this, void 0, void 0, function* () {
            const posts = yield postModel_1.default
                .find({ userId })
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit)
                .select("text likes dislikes isPublic createdAt");
            const total = yield postModel_1.default.countDocuments({ userId });
            return { posts, total };
        });
    },
    deletePost(postId, userId) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield postModel_1.default.findOneAndDelete({ _id: postId, userId });
        });
    },
    togglePostPrivacy(postId, userId) {
        return __awaiter(this, void 0, void 0, function* () {
            const post = yield postModel_1.default.findOne({ _id: postId, userId });
            if (!post)
                throw new Error("Post not found");
            post.isPublic = !post.isPublic;
            return yield post.save();
        });
    },
    getTotalLikes(userId) {
        return __awaiter(this, void 0, void 0, function* () {
            const objectId = new mongoose_1.default.Types.ObjectId(userId);
            const result = yield postModel_1.default.aggregate([
                { $match: { userId: objectId } }, // Match user's posts
                { $group: { _id: null, totalLikes: { $sum: "$likes" } } } // Sum up likes
            ]);
            return result.length > 0 ? result[0].totalLikes : 0; // If no posts, return 0
        });
    },
    getTopLikedProfiles() {
        return __awaiter(this, arguments, void 0, function* (limit = 5) {
            const result = yield postModel_1.default.aggregate([
                {
                    $group: {
                        _id: "$userId",
                        totalLikes: { $sum: "$likes" }, // Sum likes for each user
                    },
                },
                { $sort: { totalLikes: -1 } }, // Sort descending by likes
                { $limit: limit }, // Limit results (default 5)
                {
                    $lookup: {
                        from: "users",
                        localField: "_id",
                        foreignField: "_id",
                        as: "user",
                    },
                },
                { $unwind: "$user" }, // Flatten user array
                {
                    $project: {
                        _id: 0,
                        userId: "$user._id",
                        name: "$user.name",
                        photo: "$user.photo",
                        totalLikes: 1,
                    },
                },
            ]);
            return result;
        });
    },
    getShared(shareId) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield postModel_1.default.findOne({ shareId });
        });
    },
    savePost(userId, postId) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield savePostModel_1.default.findOneAndUpdate({ userId }, // Find by userId
            { $addToSet: { quotes: postId } }, // Add postId only if it's not already there
            { upsert: true, new: true } // Create a new entry if user doesn't exist
            );
        });
    },
    findSavedPost(userId, postId) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield savePostModel_1.default.findOne({
                userId,
                quotes: postId,
            });
        });
    },
    getSavedQuotes(userId) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield savePostModel_1.default.findOne({ userId }, { quotes: 1, _id: 0 });
        });
    },
    removeSavedPost(userId, postId) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield savePostModel_1.default.updateOne({ userId }, { $pull: { quotes: postId } });
        });
    },
    savedQuotesText(quotesIds) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield postModel_1.default.find({ _id: { $in: quotesIds } });
        });
    },
    clearSavedQuotes(userId) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield savePostModel_1.default.updateOne({ userId }, { $set: { quotes: [] } });
        });
    },
    getMostLiked(limit) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield postModel_1.default
                .find({ isPublic: true })
                .sort({ likes: -1 })
                .limit(limit)
                .select("text userId likes shareId") // Only return these fields
                .populate({
                path: "userId",
                select: "name photo", // Only populate name & photo from User
            });
        });
    }
};
exports.default = postRepository;
