import mongoose, { Schema } from "mongoose";

const requestSchema = new Schema(
  {
    requestTo: {
      type: Schema.Types.ObjectId,
      ref: "Users",
    },
    requestFrom: {
      type: Schema.Types.ObjectId,
      ref: "Users",
    },
    requestStatus: {
      type: String,
      default: "pending",
    },
  },
  {
    timestamps: true,
  }
);

export const FriendRequest = mongoose.model("FriendRequest", requestSchema);
