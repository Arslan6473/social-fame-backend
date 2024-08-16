import mongoose, { Schema } from "mongoose";
import { v4 as uuidv4 } from "uuid";

const commentSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "Users",
    },
    postId: {
      type: Schema.Types.ObjectId,
      ref: "Posts",
    },
    comment: {
      type: String,
      required: true,
    },
    from: {
      type: String,
      required: true,
    },
    replies: [
      {
        replyId: {
          type: String,
          default: uuidv4,
        },
        userId: {
          type: Schema.Types.ObjectId,
          ref: "Users",
        },
        from: {
          type: String,
        },
        replyAt: {
          type: String,
        },
        comment: {
          type: String,
        },
        created_At: {
          type: Date,
          default: Date.now(),
        },
        updated_At: {
          type: Date,
          default: Date.now(),
        },
        likes: [{ type: String }],
      },
    ],
    likes: [{ type: String }],
  },
  { timestamps: true }
);

export const Comment = mongoose.model("Comments", commentSchema);
