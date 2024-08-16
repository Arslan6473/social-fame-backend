import mongoose, { Schema } from "mongoose";

const userSchema = new Schema(
  {
    firstName: {
      type: String,
      required: [true, "First name is required"],
    },
    lastName: {
      type: String,
      required: [true, "Last name is required"],
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: [6, "Password length should be greater than 6 characters"],
    },
    location: {
      type: String,
    },
    profileUrl: {
      type: String,
    },
    profession: {
      type: String,
    },
    friends: [
      {
        type: Schema.Types.ObjectId,
        ref: "Users",
      },
    ],
    verified: {
      type: Boolean,
      default: false,
    },
    views: [
      {
        type: String,
      },
    ],
  },
  { timestamps: true }
);

export const User = mongoose.model("Users", userSchema);
