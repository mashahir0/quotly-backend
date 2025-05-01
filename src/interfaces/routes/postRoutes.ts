import express from "express";
import postController from "../controllers/postController";
import {
  authorizeRoles,
  verifyToken,
} from "../../infrastructure/middlewares/authMiddleware";
import { userPostRateLimiter } from "../../infrastructure/middlewares/protectionMiddleware";

const router = express.Router();

router.post(
  "/add-post",
  verifyToken(),
  authorizeRoles(["user", "admin"]),
  userPostRateLimiter,
  postController.addPost
);
router.get(
  "/get-post",
  verifyToken(),
  authorizeRoles(["user", "admin"]),
  postController.getPosts
);
router.put(
  "/toggle-like-dislike",
  verifyToken(),
  postController.toggleLikeDislike
);
router.get("/my-posts", verifyToken(), postController.getUserPosts);
router.delete("/:postId", verifyToken(), postController.deletePost);
router.put(
  "/toggle-privacy/:postId",
  verifyToken(),
  postController.togglePostPrivacy
);
router.get("/top-liked-profiles",verifyToken(), postController.getTopLikedProfiles);
router.get("/quotes/:shareId", postController.getSharedQuote);
router.get(
  "/saved-quotes",
  verifyToken(),
  postController.getSavedQuotesController
);
router.post("/saved-quotes/save", verifyToken(), postController.savePost);
router.delete(
  "/saved-quotes/remove",
  verifyToken(),
  postController.removeSavedPost
);
router.get("/list-saved-quotes",verifyToken(),postController.listSavedQuotes)

//error need to fix (the route is not callling)
router.post("/clear-quotes",verifyToken() , postController.clearSavedQuote);
router.get('/most-liked',verifyToken(),postController.getMostLikedPost)


export default router;
