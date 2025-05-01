import { Request, Response } from "express";
import postServices from "../../usecases/postService";
import UserRepository from "../../infrastructure/repositories/userRepository";
import { io } from "../../server";
import postRepository from "../../infrastructure/repositories/postRepository";



interface AuthenticatedRequest extends Request {
  user?: { id: string; name: string; email: string; role: string };
}

const postController = {
  async addPost(req: AuthenticatedRequest, res: Response) {
    try {
      const userId = req.user?.id;
      if (!userId) throw new Error("user is not authenticated ");
      const { text } = req.body;
      const len = text.trim().length;
      if (len < 100 || len > 310) {
        return res.status(400).json({
          message: "Text must be between 100 and 300 characters.",
        });
      }
      await postServices.createPost(userId, text);
      res.status(200).json({ message: "post created successfully" });
    } catch (error: any) {
      console.log(error)
      res.status(400).json({ error: error.message });
    }
  },
  async getPosts(req: Request, res: Response) {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 9;

      const { posts, total } = await postServices.getPost(page, limit);

      res.status(200).json({
        posts,
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        hasMore: page * limit < total,
      });
    } catch (error) {
      console.error("Error fetching posts:", error);
      res.status(500).json({ message: "Internal Server Error" });
    }
  },

  async toggleLikeDislike(req: AuthenticatedRequest, res: Response) {
    try {
      const userId = req.user?.id; // Ensure user is authenticated
      const { postId, action } = req.body; // "like" or "dislike"

      if (!userId) return res.status(401).json({ message: "Unauthorized" });

      const updatedPost = await postServices.toggleLikeDislike(
        postId,
        userId,
        action
      );

      // Emit like update event to all connected clients
      io.emit("updateLikes", {
        postId,
        likes: updatedPost.likes,
        dislikes: updatedPost.dislikes,
      });
      const topLikedPosts = await postServices.getMostlikedPost(5)
      io.emit("updateTopPosts", topLikedPosts);

      const topProfiles = await postServices.getTopLikedProfiles(5);
      io.emit("updateScoreboard", topProfiles);

      res.status(200).json(updatedPost);
    } catch (error: any) {
      console.log(error);
      res.status(500).json({ message: "Server Error", error: error.message });
    }
  },
  async getUserPosts(req: AuthenticatedRequest, res: Response) {
    try {
      const userId = req.user?.id;
      if (!userId) return res.status(401).json({ message: "Unauthorized" });
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 5;
      const result = await postServices.getUserPosts(userId, page, limit);
      res.status(200).json(result);
    } catch (error: any) {
      res
        .status(500)
        .json({ message: "Error fetching user posts", error: error.message });
    }
  },

  // ✅ Delete a post
  async deletePost(req: AuthenticatedRequest, res: Response) {
    try {
      const userId = req.user?.id;
      const { postId } = req.params;
      if (!userId) return res.status(401).json({ message: "Unauthorized" });
      const result = await postServices.deletePost(postId, userId);
      res.status(200).json(result);
    } catch (error: any) {
      console.log(error)
      res.status(400).json({ message: error.message });
    }
  },

  // ✅ Toggle post privacy
  async togglePostPrivacy(req: AuthenticatedRequest, res: Response) {
    try {
      const userId = req.user?.id;
      const { postId } = req.params;
      if (!userId) return res.status(401).json({ message: "Unauthorized" });
      const result = await postServices.togglePostPrivacy(userId, postId);
      res.status(200).json(result);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  },
  async getTopLikedProfiles(req: Request, res: Response) {
    try {
      const limit = parseInt(req.query.limit as string) || 5;
      const topProfiles = await postServices.getTopLikedProfiles(limit);

      // ✅ Emit live updates to clients
      io.emit("updateScoreboard", topProfiles);
      // example inside your like controller
      


      res.status(200).json(topProfiles);
    } catch (error: any) {
      res
        .status(500)
        .json({ message: "Error fetching top profiles", error: error.message });
    }
  },
  async getSharedQuote(req:AuthenticatedRequest,res:Response){
    try {
      const {shareId} = req.params
      if(!shareId) res.status(401).json({message:'shareId not found'})
      const post = await postServices.getShared(shareId)
      res.status(200).json(post)
    } catch (error : any) {
      res.status(500).json({ message: "Error fetching post", error: error });
    }
  },
  async savePost(req:AuthenticatedRequest, res: Response){
    try {
      const userId = req.user?.id as string; // ✅ Ensure it's a string
      const { postId } = req.body;
  
      if (!userId || !postId) {
        return res.status(400).json({ message: "Missing userId or postId" });
      }
      const response = await postServices.savePost(userId, postId);
      res.status(200).json(response);
    } catch (error: any) {
      res.status(500).json({
        message: "Error occurred while saving post",
        error: error.message,
      });
    }
  },
  async getSavedQuotesController (req: AuthenticatedRequest, res: Response){
    try {
      const userId = req.user?.id ; 
  
      if (!userId) {
        return res.status(401).json({ message: "User not authenticated" });
      }
  
      const savedQuotes = await postServices.getSavedQuotes(userId);
      res.status(200).json(savedQuotes);
    } catch (error: any) {
      res.status(500).json({
        message: "Error retrieving saved quotes",
        error: error.message,
      });
    }
  },
async removeSavedPost(req: AuthenticatedRequest, res: Response) {
  try {
    const userId = req.user?.id;
    const { postId } = req.body;

    if (!userId || !postId) {
      return res.status(400).json({ message: "Missing userId or postId" });
    }

    const result = await postServices.removeSavedPost(userId, postId);
    res.status(200).json({ message: "Removed from saved successfully", result });
  } catch (error: any) {
    res.status(500).json({
      message: "Error removing saved post",
      error: error.message,
    });
  }
},
async listSavedQuotes(req : AuthenticatedRequest , res : Response){
  try {
    const userId = req.user?.id ; 

    if (!userId) {
      return res.status(401).json({ message: "User not authenticated" });
    }

    const savedQuotes = await postServices.getAllsavedQuotes(userId);
    res.status(200).json(savedQuotes);
  } catch (error: any) {
    res.status(500).json({
      message: "Error retrieving saved quotes",
      error: error.message,
    });
  }
},
async clearSavedQuote(req:AuthenticatedRequest , res:Response){
  try {

    const userId = req.user?.id;
    
    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    await postServices.clearSavedQuotes(userId);
    res.status(200).json({ message: "Saved quotes cleared successfully" });
  } catch (error) {
    console.error("Error clearing saved quotes:", error);
    res.status(500).json({ message: "Something went wrong while clearing saved quotes" });
  }
},
async getMostLikedPost(req: Request, res: Response) {
  try {
    const limit = parseInt(req.query.limit as string) || 5; // ✅ Convert string to number

    if (isNaN(limit)) {
      return res.status(400).json({ error: "Invalid limit value" });
    }

    const posts = await postServices.getMostlikedPost(limit);
    res.status(200).json(posts);
  } catch (error: any) {
    res.status(500).json({ error: "Failed to fetch posts" });
  }
}
};

export default postController;
