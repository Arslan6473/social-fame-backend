import { Router } from "express";
import { userAuth } from "../middlewares/verifyJwt.js";
import {
  createPost,
  deletePost,
  getAllPosts,
  getPostsById,
  getUserPosts,
  getAllComments,
  addLikeToPost,
  addLikeToComment,
  createCommentOnPost,
  repleyOnPostComment,
} from "../controllers/post.controller.js";

const router = Router();

router.route("/create-post").post(userAuth, createPost);
router.route("/:search?").get(userAuth, getAllPosts);
router.route("/get-posts/:id").get(userAuth, getPostsById);
router.route("/delete-post/:id").delete(userAuth, deletePost);
router.route("/get-user-post/:id").get(userAuth, getUserPosts);

//comments and like routes

router.route("/comments/:id").get(userAuth, getAllComments);
router.route("/like/:postid").get(userAuth, addLikeToPost);
router.route("/like-comment/:id/:rid?").get(userAuth, addLikeToComment);
router.route("/comment/:id").post(userAuth, createCommentOnPost);
router.route("/reply-comment/:id").post(userAuth, repleyOnPostComment);

export default router;
