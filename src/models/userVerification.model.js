import mongoose, { Schema } from "mongoose";

const userVerificationSchema = new Schema({
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

export const Verification = mongoose.model(
  "Verification",
  userVerificationSchema
);
