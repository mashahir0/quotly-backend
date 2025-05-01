import express from "express";
import userController from "../controllers/userController";
import { loginLimiter, otpRateLimiter } from "../../infrastructure/middlewares/protectionMiddleware";
import { authorizeRoles, verifyToken } from "../../infrastructure/middlewares/authMiddleware";
import upload from "../../infrastructure/middlewares/upload";
import { sendOtp, verifyOtp } from "../controllers/otpController";
const app = express()
const router = express.Router();
router.post("/refresh-token", userController.refreshToken);

router.post("/register", userController.register);
router.post("/send-otp",otpRateLimiter,sendOtp);
router.post("/verify-otp", verifyOtp);
router.post("/reset-password",userController.resetPasswordController);
router.post("/login",userController.login);

router.post("/auth/google", userController.googleAuth);

router.get(
  "/get-details",
  verifyToken(),
  authorizeRoles(["user", "admin"]),
  userController.getUserData
);

router.put("/update-profile", verifyToken(), upload.single("profilePic"), userController.uploadProfileData);



export default router;
