
import mongoose from "mongoose";
import postModel ,{IPost} from "../../domain/models/postModel";
import savePostModel from "../../domain/models/savePostModel";

const postRepository = {
  async save(postData: { userId: string; text: string }) {
    return await postModel.create({
      userId: new mongoose.Types.ObjectId(postData.userId),
      text: postData.text,
      likes: 0,
      dislikes: 0,
      likedBy: [],
      dislikedBy: [],
    });
  },

  async count(filter = {}) {
    return await postModel.countDocuments(filter);
  },

  async findWithPagination(skip: number, limit: number) {
    return await postModel
      .find({ isPublic: true })
      .sort({ createdAt: -1 }) // Newest posts first
      .skip(skip)
      .limit(limit)
      .populate("userId", "name photo"); // Get only `name` from User model
  },

  async deletePostsByUser(userId: string) {
    return await postModel.deleteMany({ userId: new mongoose.Types.ObjectId(userId) });
  },

  async updateLikeDislike(postId: string, userId: string, action: "like" | "dislike") {
    const post = await postModel.findById(postId);
    if (!post) throw new Error("Post not found");

    const userObjectId = new mongoose.Types.ObjectId(userId); // Convert to ObjectId

    // Convert `ObjectId[]` to `string[]` before using `.includes()`
    const likedBy = post.likedBy.map((id : any) => id.toString());
    const dislikedBy = post.dislikedBy.map((id :any) => id.toString());

    const hasLiked = likedBy.includes(userId);
    const hasDisliked = dislikedBy.includes(userId);

    if (action === "like") {
      if (hasLiked) {
        post.likes -= 1;
        post.likedBy = post.likedBy.filter((id : any) => id.toString() !== userId);
      } else {
        post.likes += 1;
        post.likedBy.push(userObjectId);
        if (hasDisliked) {
          post.dislikes -= 1;
          post.dislikedBy = post.dislikedBy.filter((id : any) => id.toString() !== userId);
        }
      }
    } else if (action === "dislike") {
      if (hasDisliked) {
        post.dislikes -= 1;
        post.dislikedBy = post.dislikedBy.filter((id : any) => id.toString() !== userId);
      } else {
        post.dislikes += 1;
        post.dislikedBy.push(userObjectId);
        if (hasLiked) {
          post.likes -= 1;
          post.likedBy = post.likedBy.filter((id : any) => id.toString() !== userId);
        }
      }
    }

    return await post.save();
  },
  async findUserPosts(userId: string, skip: number, limit: number) {
    const posts = await postModel
      .find({ userId })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .select("text likes dislikes isPublic createdAt");

    const total = await postModel.countDocuments({ userId });

    return { posts, total };
  },
  async deletePost(postId: string, userId: string) {
    return await postModel.findOneAndDelete({ _id: postId, userId });
  },
  async togglePostPrivacy(postId: string, userId: string) {
    const post = await postModel.findOne({ _id: postId, userId });
    if (!post) throw new Error("Post not found");
    post.isPublic = !post.isPublic;
    return await post.save();
  },
  async getTotalLikes(userId: string) {
    const objectId = new mongoose.Types.ObjectId(userId); 
    const result = await postModel.aggregate([
        { $match: { userId: objectId } }, // Match user's posts
        { $group: { _id: null, totalLikes: { $sum: "$likes" } } } // Sum up likes
    ]);
    return result.length > 0 ? result[0].totalLikes : 0; // If no posts, return 0
},
async getTopLikedProfiles(limit: number = 5) {
  const result = await postModel.aggregate([
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
},
async getShared(shareId :string){
  return await postModel.findOne({shareId})
},
async savePost(userId: string, postId: string) {
  return await savePostModel.findOneAndUpdate(
    { userId }, // Find by userId
    { $addToSet: { quotes: postId } }, // Add postId only if it's not already there
    { upsert: true, new: true } // Create a new entry if user doesn't exist
  );
},

async findSavedPost(userId: string, postId: string) {
  return await savePostModel.findOne({
    userId,
    quotes: postId,
  });
},
  async getSavedQuotes(userId: string) {
    return await savePostModel.findOne({ userId }, { quotes: 1, _id: 0 });
  },
  async removeSavedPost(userId: string, postId: string) {
    return await savePostModel.updateOne(
      { userId },
      { $pull: { quotes: postId } }
    );
  },
  async savedQuotesText(quotesIds: string[]) {
    return await postModel.find({ _id: { $in: quotesIds } });
  },
  async  clearSavedQuotes(userId: string) {
    return await savePostModel.updateOne(
      { userId },
      { $set: { quotes: [] } }
    );
  },
  async getMostLiked(limit: number) {
    return await postModel
      .find({isPublic : true})
      .sort({ likes: -1 })
      .limit(limit)
      .select("text userId likes shareId") // Only return these fields
      .populate({
        path: "userId",
        select: "name photo", // Only populate name & photo from User
      });
  }
  
};

export default postRepository;
