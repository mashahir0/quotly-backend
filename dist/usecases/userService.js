"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
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
const bcryptjs_1 = __importStar(require("bcryptjs"));
const userRepository_1 = __importDefault(require("../infrastructure/repositories/userRepository"));
const tokenService_1 = __importDefault(require("./tokenService"));
const User_1 = require("../domain/User");
const axios_1 = __importDefault(require("axios"));
const postRepository_1 = __importDefault(require("../infrastructure/repositories/postRepository"));
const redis_1 = __importDefault(require("../config/redis"));
const userService = {
    register(userData) {
        return __awaiter(this, void 0, void 0, function* () {
            const nameExist = yield userRepository_1.default.findByName(userData.name);
            if (nameExist)
                throw new Error("userName already exist");
            const existingUser = yield userRepository_1.default.findByEmail(userData.email);
            if (existingUser)
                throw new Error("User already exists");
            const hashedPassword = yield bcryptjs_1.default.hash(userData.password, 10);
            const user = new User_1.User(null, userData.name, userData.email, hashedPassword);
            return yield userRepository_1.default.save(user);
        });
    },
    resetPasswordService(email, newPassword) {
        return __awaiter(this, void 0, void 0, function* () {
            console.log(email);
            const user = yield userRepository_1.default.findByEmail(email);
            console.log(user);
            if (!user) {
                throw new Error("User not found");
            }
            // ✅ Check if this email has been recently verified via OTP
            const isVerified = yield redis_1.default.get(`verified:${email}`);
            if (!isVerified) {
                throw new Error("OTP not verified. Please verify OTP before resetting password.");
            }
            const hashedPassword = yield (0, bcryptjs_1.hash)(newPassword, 10);
            yield userRepository_1.default.updateUserPassword(email, hashedPassword);
            // ❌ Optional: Invalidate all tokens/sessions here
            // 🔒 Clean up
            yield redis_1.default.del(`verified:${email}`);
            return "Password updated successfully";
        });
    },
    login(email, password) {
        return __awaiter(this, void 0, void 0, function* () {
            const user = yield userRepository_1.default.findByEmail(email);
            console.log(user);
            if (!user)
                throw new Error("Invalid credentials");
            if (user.userStatus === "Blocked")
                throw new Error("User Blocked by admin");
            const isMatch = yield bcryptjs_1.default.compare(password, user.password);
            if (!isMatch)
                throw new Error("Invalid credentials");
            const userData = user;
            const accessToken = tokenService_1.default.generateToken(userData, "15m");
            const refreshToken = tokenService_1.default.generateToken(userData, "7d");
            return { user: userData, accessToken, refreshToken };
        });
    },
    getUserDetails(id) {
        return __awaiter(this, void 0, void 0, function* () {
            const user = yield userRepository_1.default.findById(id);
            if (!user) {
                throw new Error("User not found");
            }
            const totalPost = yield postRepository_1.default.count({ userId: id });
            const totalLikes = yield postRepository_1.default.getTotalLikes(id);
            return {
                userData: user,
                totalPost: totalPost,
                totalLikes: totalLikes
            };
        });
    },
    googleLogin(accessToken) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { data: googleUser } = yield axios_1.default.get("https://www.googleapis.com/oauth2/v3/userinfo", {
                    headers: { Authorization: `Bearer ${accessToken}` },
                });
                if (!googleUser || !googleUser.email) {
                    throw new Error("Invalid Google token");
                }
                let user = yield userRepository_1.default.findByEmail(googleUser.email);
                if ((user === null || user === void 0 ? void 0 : user.userStatus) === "Blocked")
                    throw new Error("User Blocked by admin");
                if (!user) {
                    user = yield userRepository_1.default.save({
                        name: googleUser.name,
                        email: googleUser.email,
                        role: "user",
                    });
                }
                const userData = user;
                const newAccessToken = tokenService_1.default.generateToken(userData, "15m"); // Shorter TTL
                const newRefreshToken = tokenService_1.default.generateToken(userData, "7d"); // Longer TTL
                return {
                    user: userData,
                    accessToken: newAccessToken,
                    refreshToken: newRefreshToken,
                };
            }
            catch (error) {
                throw new Error(error);
            }
        });
    },
    updateProfile(userId, name, profilePic) {
        return __awaiter(this, void 0, void 0, function* () {
            if (name) {
                const nameExist = yield userRepository_1.default.findByName(name);
                // If the found name belongs to a different user
                if (nameExist && nameExist._id.toString() !== userId) {
                    throw new Error("Username already exists");
                }
            }
            const user = yield userRepository_1.default.findById(userId);
            if (!user) {
                throw new Error("User not found");
            }
            const updateData = {};
            if (name)
                updateData.name = name;
            if (profilePic)
                updateData.photo = profilePic;
            return yield userRepository_1.default.updateProfile(userId, updateData);
        });
    },
};
exports.default = userService;
