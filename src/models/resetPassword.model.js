import mongoose, { Schema } from "mongoose";

const resetPasswordSchema = new Schema({
  userId: {
    type: String,
    required: true,
  },
  token: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    required: true,
  },
  expiresAt: {
    type: Date,
    required: true,
  },
});

export const PasswordReset = mongoose.model(
  "PasswordReset",
  resetPasswordSchema
);
