import { User } from "../models/user.model.js";
import { createJwt } from "../utils/createJwt.js";
import { hashString, verifyPassword } from "../utils/hashPassword.js";
import { verificationEmail } from "../utils/varifyEmail.js";
import { Verification } from "../models/userVerification.model.js";
import { resetPasswordEmail } from "../utils/resetPassword.js";
import { PasswordReset } from "../models/resetPassword.model.js";
import { FriendRequest } from "../models/friendRequest.model.js";

const registerUser = async (req, res) => {
  //get data from frontend
  const { firstName, lastName, email, password } = req.body;
  //validate all field are required
  if (!(firstName || lastName || email || password)) {
    return res
      .status(401)
      .json({ success: false, message: "All felids are required" });
  }
  try {
    //check if user is already register
    const existedUser = await User.findOne({ email });

    if (existedUser) {
      return res
        .status(401)
        .json({ success: false, message: "User already register" });
    }
    //hash password
    const hashPassword = await hashString(password);

    //create user
    const user = await User.create({
      firstName,
      lastName,
      email,
      password: hashPassword,
    });

    if (!user) {
      return res.status(500).json({
        success: false,
        message: "Something went wrong while creating user",
      });
    }

    //send verification email
    verificationEmail(user, res);
  } catch (error) {
    return res.status(404).json({ success: false, message: error.message });
  }
};

const loginUser = async (req, res) => {
  //get data from frontend
  const { email, password } = req.body;
  //validate all field are required
  if (!(email || password)) {
    return res
      .status(401)
      .json({ success: false, message: "All felids are required" });
  }

  try {
    const user = await User.findOne({ email }).populate({
      path: "friends",
      select: "firstName lastName profileUrl location profession",
    });
    //if not user found
    if (!user) {
      return res
        .status(401)
        .json({ success: false, message: "Invalid email or password" });
    }
    //check password
    const isCorrect = await verifyPassword(password, user.password);

    if (!isCorrect) {
      return res
        .status(401)
        .json({ success: false, message: "Invalid password" });
    }
    //check user is verified
    if (!user.verified) {
      return res.status(401).json({
        success: false,
        message: "User is not verified ! Please verify your email first",
      });
    }

    const token = await createJwt(user._id);

    return res.status(200).json({
      data: user,
      token,
      success: true,
      message: "User logged in successfully",
    });
  } catch (error) {
    return res.status(404).json({ message: error.message });
  }
};

const verifyEmail = async (req, res) => {
  //get data from params
  const { userId, token } = req.params;
  //validate all field are required
  if (!(userId || token)) {
    return res
      .status(401)
      .json({ success: false, message: "All felids are required" });
  }
  try {
    const verification = await Verification.findOne({ userId });

    // If no verification document found
    if (!verification) {
      return res
        .status(404)
        .json({ success: false, message: "Verification not found" });
    }
    //check expiry time and token
    if (verification.expiresAt > Date.now() && verification.token === token) {
      //update the user
      const user = await User.findById(userId);
      user.verified = true;
      await user.save();

      return res
        .status(200)
        .json({ success: true, message: "User verified successfully" });
    }
    //if link expires delete user and verification
    const response = await Verification.findOneAndDelete({ userId });
    const userResponse = await User.findOneAndDelete({ userId });

    if (response && userResponse) {
      return res.status(401).json({
        success: false,
        message: "Verification link expires Signup again",
      });
    }

    return res.status(500).json({
      success: false,
      message: "Something went wrong while verifying user",
    });
  } catch (error) {
    return res.status(404).json({ success: false, message: error.message });
  }
};

const resetPassword = async (req, res) => {
  //get email from frontend
  const { email } = req.body;
  //validate email is required
  if (!email) {
    return res
      .status(401)
      .json({ success: false, message: "Email is required" });
  }

  //find user by email
  try {
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(401).json({ success: false, message: "Invalid email" });
    }

    //send verification email
    resetPasswordEmail(user, res);
  } catch (error) {
    return res.status(404).json({ success: false, message: error.message });
  }
};

const verifyResetPassword = async (req, res) => {
  //get data from params
  const { userId, token } = req.params;
  //get password
  const { password } = req.body;
  //validate all field are required
  if (!(userId || token)) {
    return res
      .status(401)
      .json({ success: false, message: "All felids are required" });
  }

  try {
    const resetPassword = await PasswordReset.findOne({ userId });

    // If no reset document found
    if (!resetPassword) {
      return res
        .status(404)
        .json({ success: false, message: "Verification not found" });
    }
    //check expiry time and token
    if (resetPassword.expiresAt > Date.now() && resetPassword.token === token) {
      //update the user password
      const user = await User.findById(userId);
      const hashPassword = await hashString(password);
      user.password = hashPassword;
      await user.save();
      //delete document
      await PasswordReset.findOneAndDelete({ userId });
      return res
        .status(200)
        .json({ success: true, message: "User password reset successfully" });
    }
    const response = await PasswordReset.findOneAndDelete({ userId });

    if (response) {
      return res.status(401).json({
        success: false,
        message: "Resetpassword link expires  verify email again",
      });
    }
    return res.status(500).json({
      success: false,
      message: "Something went wrong while resting user",
    });
  } catch (error) {
    return res.status(404).json({ success: false, message: error.message });
  }
};

const getUser = async (req, res) => {
  const { userId } = req.body.user;
  try {
    const user = await User.findById(userId).populate({
      path: "friends",
      select: "firstName lastName profileUrl location profession",
    });

    if (!user) {
      return res
        .status(401)
        .json({ success: false, message: "Invalid user id" });
    }

    return res.status(200).json({
      success: true,
      data: user,
      message: "User fetched successfully",
    });
  } catch (error) {
    return res.status(404).json({ success: false, message: error.message });
  }
};

const getUserById = async (req, res) => {
  const { id } = req.params;
  try {
    const user = await User.findById(id).populate({
      path: "friends",
      select: "firstName lastName profileUrl location profession",
    });;

    if (!user) {
      return res
        .status(401)
        .json({ success: false, message: "Invalid user id" });
    }

    return res.status(200).json({
      success: true,
      data: user,
      message: "User fetched successfully",
    });
  } catch (error) {
    return res.status(404).json({ success: false, message: error.message });
  }
};

const updateUser = async (req, res) => {
  const { userId } = req.body.user;
  //get update from frontend
  const { firstName, lastName, location, profileUrl, profession } = req.body;
  try {
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { firstName, lastName, location, profileUrl, profession },
      { new: true }
    ).populate({
      path: "friends",
      select: "firstName lastName profileUrl location profession",
    });;

    if (!updatedUser) {
      return res
        .status(401)
        .json({ success: false, message: "user not found or update" });
    }

    return res.status(200).json({
      success: true,
      message: "User updated successfully",
      data: updatedUser,
    });
  } catch (error) {
    return res.status(404).json({ success: false, message: error.message });
  }
};

const viewProfile = async (req, res) => {
  const { userId } = req.body.user;
  //get id from params
  const { id } = req.params;

  try {
    //find view user profile
    const viewUser = await User.findById(id);

    if (!viewUser) {
      return res.status(400).json({ success: false, message: "Invalid user" });
    }
    if(!(viewUser.views.includes(userId))){
      viewUser.views.push(userId);
    }
    viewUser.save();

    return res
      .status(200)
      .json({ success: true, message: "User profile viewed successfully" });
  } catch (error) {
    return res.status(404).json({ success: false, message: error.message });
  }
};

const sendFriendRequest = async (req, res) => {
  const { userId } = req.body.user;
  //get id from params
  const { id } = req.params;

  //create a friend request

  try {
    const existedRequest = await FriendRequest.findOne({
      requestTo: id,
      requestFrom: userId,
    });

    if (existedRequest) {
      return res
        .status(401)
        .json({ success: false, message: "Request already send" });
    } else {
      const friendRequest = await FriendRequest.create({
        requestTo: id,
        requestFrom: userId,
      });

      if (!friendRequest) {
        return res
          .status(401)
          .json({ success: false, message: "Invalid user" });
      }

      return res
        .status(200)
        .json({ success: true, message: "Request send successfully" });
    }
  } catch (error) {
    return res.status(404).json({ success: false, message: error.message });
  }
};

const acceptRequest = async (req, res) => {
  const { userId } = req.body.user;
  //get id from params

  const { rid, status } = req.body;


  try {
    const updatedRequest = await FriendRequest.findByIdAndUpdate(
      rid,
      { requestStatus: status },
      { new: true }
    );

    if (!updatedRequest) {
      return res
        .status(404)
        .json({ success: false, message: "Request not found" });
    }

    if (status === "accept") {
      const user = await User.findById(userId);
      if (!user) {
        return res
          .status(401)
          .json({ success: false, message: "Invalid user" });
      }
      user.friends.push(updatedRequest.requestFrom);
      await user.save();

      const friendProfile = await User.findById(updatedRequest.requestFrom);
      if (!friendProfile) {
        return res
          .status(401)
          .json({ success: false, message: "Invalid friend profile" });
      }
      friendProfile.friends.push(updatedRequest.requestTo);
      await friendProfile.save();

      return res
        .status(200)
        .json({ success: true, message: "Request accepted successfully" });
    }

    return res
      .status(400)
      .json({ success: false, message: "Request not accepted" });
  } catch (error) {
    return res.status(404).json({ success: false, message: error.message });
  }
};

const getFriendRequests = async (req, res) => {
  const { userId } = req.body.user;

  try {
    const friendRequest = await FriendRequest.find({
      requestTo: userId,
      requestStatus: "pending",
    })
      .populate({
        path: "requestFrom",
        select: "firstName lastName profileUrl location profession",
      })
      .limit(10)
      .sort({ _id: -1 });

    if (!friendRequest) {
      return res
        .status(404)
        .json({ success: false, message: "No friend request found" });
    }

    return res.status(200).json({
      success: true,
      data: friendRequest,
      message: "Request fetched successfully",
    });
  } catch (error) {
    return res.status(404).json({ success: false, message: error.message });
  }
};

const suggestFriends = async (req, res) => {
  const { userId } = req.body.user;
  try {
    const queryObject = {
      _id: { $ne: userId },
      friends: { $nin: [userId] },
    };

    const queryResult = User.find(queryObject)
      .select("firstName lastName profileUrl location profession")
      .limit(15);

    const suggestedFriends = await queryResult;

    return res.status(200).json({
      success: true,
      data: suggestedFriends,
      message: "Suggested friends fetched successfully",
    });
  } catch (error) {
    return res.status(404).json({ success: false, message: error.message });
  }
};

export {
  registerUser,
  loginUser,
  verifyEmail,
  resetPassword,
  verifyResetPassword,
  getUser,
  updateUser,
  viewProfile,
  sendFriendRequest,
  acceptRequest,
  getFriendRequests,
  suggestFriends,
  getUserById,
};
