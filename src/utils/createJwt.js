import jwt from "jsonwebtoken";

export const createJwt = async (_id) => {
  return jwt.sign({ userId: _id }, process.env.JWT_SECRET, { expiresIn: "1d" });
};
