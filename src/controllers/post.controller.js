import { Post } from "../models/post.model.js";
import { User } from "../models/user.model.js";
import { Comment } from "../models/comment.model.js";

const createPost = async (req, res) => {
  const { userId } = req.body.user;
  //get data from frontend
  const { description, image } = req.body;

  if (!description) {
    return res
      .status(404)
      .json({ success: false, message: "description is required" });
  }

  try {
    const post = await Post.create({
      userId,
      description,
      image,
    });

    if (!post) {
      return res
        .status(404)
        .json({ success: false, message: "Error while creating post" });
    }

    const createdPost = await Post.findById(post._id).populate({
      path: "userId",
      select: "firstName lastName profileUrl location ",
    });

    return res.status(200).json({
      success: true,
      data: createdPost,
      message: "Post created successfully",
    });
  } catch (error) {
    return res.status(404).json({ success: false, message: error.message });
  }
};

const getAllPosts = async (req, res) => {
  try {
    const { userId } = req.body.user;
    const { search } = req.params;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    const friends = user.friends?.toString().split(" ") ?? [];
    friends.push(userId);

    const searchQuery = search
      ? {
          $or: [
            {
              description: { $regex: search, $options: "i" },
            },
          ],
        }
      : {};

    const posts = await Post.find(searchQuery)
      .populate({
        path: "userId",
        select: "firstName lastName profileUrl location ",
      })
      .sort({ createdAt: -1 });

    if (!posts || posts.length === 0) {
      return res.status(404).json({ success: false, message: "No posts found" });
    }

    const friendsPost = posts.filter((post) =>
      friends.includes(post.userId?._id?.toString())
    );

    const otherPosts = posts.filter(
      (post) => !friends.includes(post.userId?._id?.toString())
    );

    const postRes = search ? friendsPost : [...friendsPost, ...otherPosts];

    return res.status(200).json({
      success: true,
      data: postRes,
      message: "Posts fetched successfully",
    });
  } catch (error) {

    return res.status(500).json({ success: false, message: "Server error" });
  }
};

const getPostsById = async (req, res) => {
  try {
    const { id } = req.params;
    const posts = await Post.find({userId:id}).populate({
      path: "userId",
      select: "firstName lastName profileUrl location ",
    });

    if (posts.length === 0) {
      return res
        .status(404)
        .json({ success: false, message: "Posts not found" });
    }

    return res.status(200).json({
      success: true,
      data: posts,
      message: "Post fetched successfully",
    });
  } catch (error) {
    return res.status(404).json({ success: false, message: error.message });
  }
};

const deletePost = async (req, res) => {
  try {
    const { id } = req.params;

    const response = await Post.findByIdAndDelete(id);

    if (!response) {
      return res.status(404).json({
        success: false,
        message: "Something went wrong while deleting post",
      });
    }

    return res
      .status(200)
      .json({ success: true, message: "Post deleted successfully" });
  } catch (error) {
    return res.status(404).json({ success: false, message: error.message });
  }
};

const getUserPosts = async (req, res) => {
  try {
    const { id } = req.params;

    const posts = await User.find({ userId: id })
      .populate({
        path: "userId",
        select: "firstName lastName profileUrl location -password",
      })
      .sort({ _id: -1 });

    if (!posts) {
      return res.status(404).json({
        success: false,
        message: "Something went wrong while fetching posts",
      });
    }

    return res.status(200).json({
      success: true,
      data: posts,
      message: "Post fetched successfully",
    });
  } catch (error) {
    return res.status(404).json({ success: false, message: error.message });
  }
};

const getAllComments = async (req, res) => {
  try {
    const { id } = req.params;

    const comments = await Comment.find({ postId: id })
      .populate({
        path: "userId",
        select: "firstName lastName profileUrl location ",
      })
      .populate({
        path: "replies.userId",
        select: "firstName lastName profileUrl location ",
      })
      .sort({ _id: -1 });

    if (!comments) {
      return res.status(404).json({
        success: false,
        message: "Something went wrong while fetching comments",
      });
    }

    return res.status(200).json({
      success: true,
      data: comments,
      message: "Comments fetched successfully",
    });
  } catch (error) {
    return res.status(404).json({ success: false, message: error.message });
  }
};

const addLikeToPost = async (req, res) => {
  try {
    const { userId } = req.body.user;

    const { postid } = req.params;

    const post = await Post.findById(postid);

    if (!post) {
      return res.status(404).json({
        success: false,
        message: "Something wrong while fetching post",
      });
    }

    const index = post.likes.findIndex((user) => user === String(userId));

    if (index > -1) {
      post.likes = post.likes.filter((user) => user !== String(userId));
    } else {
      post.likes.push(userId);
    }

    await post.save();

    const likedPost = await Post.findById(post._id).populate({
      path: "userId",
      select: "firstName lastName profileUrl location ",
    });

    return res.status(200).json({
      success: true,
      data: likedPost,
      message: "Successfully added response",
    });
  } catch (error) {
    return res.status(404).json({ success: false, message: error.message });
  }
};

const addLikeToComment = async (req, res) => {
  try {
    const { userId } = req.body.user;
    const { id, rid } = req.params;

    // Check if the request is for a comment or a reply
    if (rid === undefined || rid === null || rid === "false") {
      // Handle liking/unliking the comment itself
      const comment = await Comment.findById(id);

      if (!comment) {
        return res.status(404).json({
          success: false,
          message: "Something went wrong while fetching the comment",
        });
      }

      const index = comment.likes.findIndex((user) => user === String(userId));

      if (index > -1) {
        // User already liked the comment, so remove the like
        comment.likes = comment.likes.filter((user) => user !== String(userId));
      } else {
        // Add the like
        comment.likes.push(userId);
      }

      await comment.save();

      const updatedComment = await Comment.findById(comment._id)
        .populate({
          path: "userId",
          select: "firstName lastName profileUrl location",
        })
        .populate({
          path: "replies.userId",
          select: "firstName lastName profileUrl location",
        });

      return res.status(200).json({
        success: true,
        data: updatedComment,
        message: "Successfully updated like status on comment",
      });
    } else {
      // Handle liking/unliking a reply
      const comment = await Comment.findOne({
        _id: id,

      });
    
      if (!comment) {
        return res.status(404).json({
          success: false,
          message: "Something went wrong while fetching the comment",
        });
      }
      const index = comment.replies.findIndex((reply)=> reply.replyId === String(rid));
      const likeIndex = comment.replies[index].likes.findIndex((user) => user === String(userId));

      if (likeIndex > -1) {
        // User already liked the reply, so remove the like
        comment.replies[index].likes = comment.replies[index].likes.filter((user) => user !== String(userId));
      } else {
        // Add the like
        comment.replies[index].likes.push(userId);
      }
      await comment.save();

      const updatedComment = await Comment.findById(comment._id)
        .populate({
          path: "userId",
          select: "firstName lastName profileUrl location",
        })
        .populate({
          path: "replies.userId",
          select: "firstName lastName profileUrl location",
        }).sort({createdAt:-1});

      return res.status(200).json({
        success: true,
        data: updatedComment,
        message: "Successfully updated like status on reply",
      });
    }
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};


const createCommentOnPost = async (req, res) => {
  const { userId } = req.body.user;

  const { id } = req.params;

  const { comment, from } = req.body;

  if (!(comment || from)) {
    return res.status(404).json({
      success: false,
      message: "Comment required",
    });
  }
  try {
    const newComment = await Comment.create({
      userId,
      postId: id,
      comment,
      from,
    });

    if (!newComment) {
      return res.status(404).json({
        success: false,
        message: "Something went wrong while creating comment",
      });
    }

    //update the post add comment
    const post = await Post.findById(id);

    if (!post) {
      return res.status(404).json({
        success: false,
        message: "Something went wrong while fetching post",
      });
    }

    post.comments.push(newComment._id);

    await post.save();

    const newCreatedComment = await Comment.findById(newComment._id)
      .populate({
        path: "userId",
        select: "firstName lastName profileUrl location ",
      })
      .populate({
        path: "replies.userId",
        select: "firstName lastName profileUrl location ",
      });

    return res.status(200).json({
      success: true,
      data: newCreatedComment,
      message: "Successfully added comment",
    });
  } catch (error) {
    return res.status(404).json({ success: false, message: error.message });
  }
};

const repleyOnPostComment = async (req, res) => {
  const { userId } = req.body.user;

  const { id } = req.params;

  const { comment, from, replyAt } = req.body;

  if (!comment) {
    return res.status(404).json({
      success: false,
      message: "Comment required",
    });
  }

  try {
    const preComment = await Comment.findById(id);

    if (!preComment) {
      return res.status(404).json({
        success: false,
        message: "Something went wrong while fetching comment",
      });
    }

    preComment.replies.push({
      userId,
      from,
      replyAt,
      comment,
    });

    await preComment.save();

    const newCreatedComment = await Comment.findById(preComment._id)
      .populate({
        path: "userId",
        select: "firstName lastName profileUrl location ",
      })
      .populate({
        path: "replies.userId",
        select: "firstName lastName profileUrl location ",
      });

    return res.status(200).json({
      success: true,
      data: newCreatedComment,
      message: "Successfully added comment",
    });
  } catch (error) {
    return res.status(404).json({ success: false, message: error.message });
  }
};

export {
  createPost,
  getAllPosts,
  getPostsById,
  deletePost,
  getUserPosts,
  getAllComments,
  addLikeToPost,
  addLikeToComment,
  createCommentOnPost,
  repleyOnPostComment,
};
