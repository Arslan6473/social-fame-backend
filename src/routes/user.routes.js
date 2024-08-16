import { Router } from "express";
import {
  loginUser,
  registerUser,
  resetPassword,
  verifyEmail,
  verifyResetPassword,
  getUser,
  viewProfile,
  sendFriendRequest,
  updateUser,
  acceptRequest,
  suggestFriends,
  getFriendRequests,
  getUserById
} from "../controllers/user.controller.js";
import { userAuth } from "../middlewares/verifyJwt.js";

const router = Router();

router.route("/register").post(registerUser);
router.route("/login").post(loginUser);
router.route("/verify/:userId/:token").get(verifyEmail);
router.route("/verify/reset-password").post(resetPassword);
router.route("/reset-password/:userId/:token").post(verifyResetPassword);

//secure routes

router.route("/get-user").get(userAuth, getUser);
router.route("/get-user/:id").get(userAuth, getUserById);

router.route("/update-user").put(userAuth, updateUser);
router.route("/view-profile/:id").get(userAuth, viewProfile);
router.route("/send-request/:id").get(userAuth, sendFriendRequest);
router.route("/accept-request").post(userAuth, acceptRequest);
router.route("/friend-requests").get(userAuth, getFriendRequests);
router.route("/suggest-friends").get(userAuth, suggestFriends);



export default router;
