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
const chatModel_1 = __importDefault(require("../../domain/models/chatModel"));
const userModel_1 = __importDefault(require("../../domain/models/userModel"));
const chatRepository = {
    // ✅ Save a new message
    saveMessage(senderId, receiverId, message) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield chatModel_1.default.create({ senderId, receiverId, message });
        });
    },
    // ✅ Get chat history between two users
    // async getMessages(senderId: string, receiverId: string) {
    //   return await chatModel
    //     .find({ 
    //       $or: [
    //         { senderId, receiverId }, 
    //         { senderId: receiverId, receiverId: senderId }
    //       ]
    //     })
    //     .sort({ createdAt: 1 }) // ✅ Sort messages in ascending order
    //     .populate("senderId", "name photo")
    //     .populate("receiverId", "name photo");
    // },
    getMessages(senderId_1, receiverId_1) {
        return __awaiter(this, arguments, void 0, function* (senderId, receiverId, limit = 70) {
            const messages = yield chatModel_1.default
                .find({
                $or: [
                    { senderId, receiverId },
                    { senderId: receiverId, receiverId: senderId }
                ]
            })
                .sort({ createdAt: -1 }) // ❗️ Get newest messages first
                .limit(limit)
                .populate("senderId", "name photo")
                .populate("receiverId", "name photo");
            return messages.reverse(); // ✅ Return in chronological order
        });
    },
    // ✅ Mark messages as seen
    markMessagesAsSeen(senderId, receiverId) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield chatModel_1.default.updateMany({ senderId: receiverId, receiverId: senderId, seen: false }, { $set: { seen: true } });
        });
    },
    // async getRecentChatUsers(userId: string, limit: number) {
    //   const objectId = new mongoose.Types.ObjectId(userId);
    //   const recentChats = await chatModel.aggregate([
    //     {
    //       $match: {
    //         $or: [
    //           { senderId: objectId },
    //           { receiverId: objectId }
    //         ]
    //       }
    //     },
    //     {
    //       $addFields: {
    //         chatWith: {
    //           $cond: [
    //             { $eq: ["$senderId", objectId] },
    //             "$receiverId",
    //             "$senderId"
    //           ]
    //         },
    //         isSender: { $eq: ["$senderId", objectId] }
    //       }
    //     },
    //     {
    //       $sort: { createdAt: -1 }
    //     },
    //     {
    //       $group: {
    //         _id: "$chatWith",
    //         seen: { $first: "$seen" },
    //         isSender: { $first: "$isSender" },
    //         lastMessageAt: { $first: "$createdAt" }
    //       }
    //     },
    //     {
    //       $lookup: {
    //         from: "users",
    //         localField: "_id",
    //         foreignField: "_id",
    //         as: "user"
    //       }
    //     },
    //     { $unwind: "$user" },
    //     {
    //       $project: {
    //         _id: "$user._id",
    //         name: "$user.name",
    //         photo: "$user.photo",
    //         seen: 1,
    //         isSender: 1,
    //         lastMessageAt: 1
    //       }
    //     },
    //     { $sort: { lastMessageAt: -1 } },
    //     { $limit: limit }
    //   ]);
    //   return { users: recentChats };
    // }
    // async getRecentChatUsersPaginated(userId: string, page: number, limit: number) {
    //   const objectId = new mongoose.Types.ObjectId(userId);
    //   const skip = (page - 1) * limit;
    //   const baseMatch = {
    //     $match: {
    //       $or: [
    //         { senderId: objectId },
    //         { receiverId: objectId }
    //       ]
    //     }
    //   };
    //   const aggregation: mongoose.PipelineStage[] = [
    //     baseMatch,
    //     {
    //       $addFields: {
    //         chatWith: {
    //           $cond: [
    //             { $eq: ["$senderId", objectId] },
    //             "$receiverId",
    //             "$senderId"
    //           ]
    //         },
    //         isSender: { $eq: ["$senderId", objectId] }
    //       }
    //     },
    //     { $sort: { createdAt: -1 } },
    //     {
    //       $group: {
    //         _id: "$chatWith",
    //         seen: { $first: "$seen" },
    //         isSender: { $first: "$isSender" },
    //         lastMessageAt: { $first: "$createdAt" }
    //       }
    //     },
    //     {
    //       $lookup: {
    //         from: "users",
    //         localField: "_id",
    //         foreignField: "_id",
    //         as: "user"
    //       }
    //     },
    //     { $unwind: "$user" },
    //     {
    //       $project: {
    //         _id: "$user._id",
    //         name: "$user.name",
    //         photo: "$user.photo",
    //         seen: 1,
    //         isSender: 1,
    //         lastMessageAt: 1
    //       }
    //     },
    //     { $sort: { lastMessageAt: -1 } },
    //     { $skip: skip },
    //     { $limit: limit }
    //   ];
    //   const users = await chatModel.aggregate(aggregation);
    //   // Count total unique users chatted with
    //   const totalAgg = await chatModel.aggregate([
    //     baseMatch,
    //     {
    //       $addFields: {
    //         chatWith: {
    //           $cond: [
    //             { $eq: ["$senderId", objectId] },
    //             "$receiverId",
    //             "$senderId"
    //           ]
    //         }
    //       }
    //     },
    //     {
    //       $group: { _id: "$chatWith" }
    //     },
    //     { $count: "total" }
    //   ]);
    //   const total = totalAgg[0]?.total || 0;
    //   return {
    //     users,
    //     total
    //   };
    // }
    getRecentChatUsersPaginated(userId, page, limit, search) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a, _b;
            const objectId = new mongoose_1.default.Types.ObjectId(userId);
            const skip = (page - 1) * limit;
            if (search && search.trim()) {
                // 🔥 Search all users (userModel)
                const users = yield userModel_1.default.aggregate([
                    {
                        $match: {
                            name: { $regex: search, $options: "i" } // match name
                        }
                    },
                    {
                        $project: {
                            _id: 1,
                            name: 1,
                            photo: 1
                        }
                    },
                    { $skip: skip },
                    { $limit: limit }
                ]);
                const totalAgg = yield userModel_1.default.aggregate([
                    {
                        $match: {
                            name: { $regex: search, $options: "i" }
                        }
                    },
                    { $count: "total" }
                ]);
                const total = ((_a = totalAgg[0]) === null || _a === void 0 ? void 0 : _a.total) || 0;
                return { users, total };
            }
            else {
                // 🔥 No search -> fetch recently chatted users (chatModel)
                const baseMatch = {
                    $match: {
                        $or: [
                            { senderId: objectId },
                            { receiverId: objectId }
                        ]
                    }
                };
                const aggregation = [
                    baseMatch,
                    {
                        $addFields: {
                            chatWith: {
                                $cond: [
                                    { $eq: ["$senderId", objectId] },
                                    "$receiverId",
                                    "$senderId"
                                ]
                            },
                            isSender: { $eq: ["$senderId", objectId] }
                        }
                    },
                    { $sort: { createdAt: -1 } },
                    {
                        $group: {
                            _id: "$chatWith",
                            seen: { $first: "$seen" },
                            isSender: { $first: "$isSender" },
                            lastMessageAt: { $first: "$createdAt" }
                        }
                    },
                    {
                        $lookup: {
                            from: "users",
                            localField: "_id",
                            foreignField: "_id",
                            as: "user"
                        }
                    },
                    { $unwind: "$user" },
                    {
                        $project: {
                            _id: "$user._id",
                            name: "$user.name",
                            photo: "$user.photo",
                            seen: 1,
                            isSender: 1,
                            lastMessageAt: 1
                        }
                    },
                    { $sort: { lastMessageAt: -1 } },
                    { $skip: skip },
                    { $limit: limit }
                ];
                const users = yield chatModel_1.default.aggregate(aggregation);
                const totalAgg = yield chatModel_1.default.aggregate([
                    baseMatch,
                    {
                        $addFields: {
                            chatWith: {
                                $cond: [
                                    { $eq: ["$senderId", objectId] },
                                    "$receiverId",
                                    "$senderId"
                                ]
                            }
                        }
                    },
                    {
                        $group: { _id: "$chatWith" }
                    },
                    { $count: "total" }
                ]);
                const total = ((_b = totalAgg[0]) === null || _b === void 0 ? void 0 : _b.total) || 0;
                return { users, total };
            }
        });
    }
};
exports.default = chatRepository;
