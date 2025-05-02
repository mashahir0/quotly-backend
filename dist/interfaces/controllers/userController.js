"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const userService_1 = __importDefault(require("../../usecases/userService"));
const tokenService_1 = __importDefault(require("../../usecases/tokenService"));
const authController = {
    register(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const user = yield userService_1.default.register(req.body);
                res.status(201).json(user);
            }
            catch (error) {
                res.status(400).json({ error: error.message });
            }
        });
    },
    resetPasswordController(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { email, newPassword } = req.body;
            try {
                const message = yield userService_1.default.resetPasswordService(email, newPassword);
                res.status(200).json({ message });
            }
            catch (err) {
                console.log('from restcontroller', err);
                res.status(400).json({ error: err.message || "Password reset failed" });
            }
        });
    },
    login(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { user, accessToken, refreshToken } = yield userService_1.default.login(req.body.email, req.body.password);
                res.cookie("userRefreshToken", refreshToken, {
                    httpOnly: true,
                    secure: process.env.NODE_ENV === "production",
                    sameSite: "strict",
                    path: "/api/user/refresh-token",
                });
                res.status(200).json({ user, accessToken });
            }
            catch (error) {
                res.status(400).json({ error: error.message });
            }
        });
    },
    googleAuth(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { token } = req.body; // Expect access token from frontend
                if (!token) {
                    return res.status(400).json({ error: "No Google token provided" });
                }
                const { accessToken, refreshToken, user } = yield userService_1.default.googleLogin(token);
                res.cookie("userRefreshToken", refreshToken, {
                    httpOnly: true,
                    secure: process.env.NODE_ENV === "production",
                    sameSite: "strict",
                    path: "/api/user/refresh-token",
                });
                return res.status(200).json({ accessToken, user });
            }
            catch (error) {
                return res.status(500).json({ error: error.message });
            }
        });
    },
    refreshToken(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { userRefreshToken } = req.cookies;
                if (!userRefreshToken)
                    return res.status(401).json({ error: "No token provided" });
                const newToken = yield tokenService_1.default.refreshToken(userRefreshToken);
                res.status(200).json(newToken);
            }
            catch (error) {
                res.status(401).json({ error: error.message });
            }
        });
    },
    getUserData(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            try {
                const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
                if (!userId) {
                    return res.status(401).json({ error: "Unauthorized" });
                }
                const user = yield userService_1.default.getUserDetails(userId);
                if (!user) {
                    return res.status(404).json({ error: "User not found" });
                }
                res.status(200).json(user);
            }
            catch (error) {
                console.error("Error getting user details:", error);
                res.status(500).json({ error: "Server error" });
            }
        });
    },
    uploadProfileData(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a, _b;
            try {
                const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id; // Ensure user is authenticated
                if (!userId)
                    return res.status(401).json({ message: "Unauthorized" });
                const { name } = req.body;
                const profilePicUrl = (_b = req.file) === null || _b === void 0 ? void 0 : _b.path; // Cloudinary uploaded image URL (if exists)
                const updatedUser = yield userService_1.default.updateProfile(userId, name, profilePicUrl);
                res.status(200).json({ message: "Profile updated successfully", user: updatedUser });
            }
            catch (error) {
                res.status(500).json({ message: "Server error", error: error.message });
            }
        });
    }
};
exports.default = authController;
