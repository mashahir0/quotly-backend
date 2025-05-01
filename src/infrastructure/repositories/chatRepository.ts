import mongoose from "mongoose";
import chatModel from "../../domain/models/chatModel";
import userModel from "../../domain/models/userModel";

const chatRepository = {
    // ✅ Save a new message
    async saveMessage(senderId: string, receiverId: string, message: string) {
      return await chatModel.create({ senderId, receiverId, message });
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
    async getMessages(senderId: string, receiverId: string, limit = 70) {
      const messages = await chatModel
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
    },
    
  
    // ✅ Mark messages as seen
    async markMessagesAsSeen(senderId: string, receiverId: string) {
      return await chatModel.updateMany(
        { senderId: receiverId, receiverId: senderId, seen: false },
        { $set: { seen: true } }
      );
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
    async getRecentChatUsersPaginated(userId: string, page: number, limit: number, search?: string) {
      const objectId = new mongoose.Types.ObjectId(userId);
      const skip = (page - 1) * limit;
    
      if (search && search.trim()) {
        // 🔥 Search all users (userModel)
        const users = await userModel.aggregate([
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
    
        const totalAgg = await userModel.aggregate([
          {
            $match: {
              name: { $regex: search, $options: "i" }
            }
          },
          { $count: "total" }
        ]);
    
        const total = totalAgg[0]?.total || 0;
    
        return { users, total };
    
      } else {
        // 🔥 No search -> fetch recently chatted users (chatModel)
        const baseMatch = {
          $match: {
            $or: [
              { senderId: objectId },
              { receiverId: objectId }
            ]
          }
        };
    
        const aggregation: mongoose.PipelineStage[] = [
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
    
        const users = await chatModel.aggregate(aggregation);
    
        const totalAgg = await chatModel.aggregate([
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
    
        const total = totalAgg[0]?.total || 0;
    
        return { users, total };
      }
    }
    
    
    
  };
  
  export default chatRepository;
  