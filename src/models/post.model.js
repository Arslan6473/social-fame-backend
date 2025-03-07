import mongoose, { Schema } from "mongoose";

const postSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "Users",
    },
    description: {
      type: String,
      required: true,
    },
    image: {
      type: String,
    },
    likes: [{ type: String }],
    comments: [
      {
        type: Schema.Types.ObjectId,
        ref: "Comments",
      },
    ],
  },
  { timestamps: true }
);

export const Post = mongoose.model("Posts", postSchema);
