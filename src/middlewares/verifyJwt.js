import jwt from "jsonwebtoken";

const userAuth = async (req, res, next) => {
  //get token from header
  const authHeader = req?.headers?.authorization;

  if (!authHeader || !authHeader?.startsWith("Bearer")) {
    return res
      .status(500)
      .json({ success: false, message: "Authentication Failed!" });
  }
  //get Token
  const token = authHeader.split(" ")[1];

  try {
    //verify token
    const userToken = jwt.verify(token, process.env.JWT_SECRET);

    req.body.user = {
      userId: userToken.userId,
    };
    next();
  } catch (error) {
    return res.status(500).json({ success: false, message: "Invalid token!" });
  }
};

export { userAuth };
