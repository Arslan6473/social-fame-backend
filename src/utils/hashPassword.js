import bcrypt from "bcryptjs";

export const hashString = async (password) => {
  const salt = await bcrypt.genSalt(10);
  const hashPassword = await bcrypt.hash(password, salt);

  return hashPassword;
};

export const verifyPassword = async (password, hashPassword) => {
  const response = await bcrypt.compare(password, hashPassword);
  return response;
};
