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
const tokenService_1 = __importDefault(require("./tokenService"));
const userRepository_1 = __importDefault(require("../infrastructure/repositories/userRepository"));
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const userModel_1 = __importDefault(require("../domain/models/userModel"));
const postRepository_1 = __importDefault(require("../infrastructure/repositories/postRepository"));
const adminServices = {
    login(email, password) {
        return __awaiter(this, void 0, void 0, function* () {
            const user = yield userRepository_1.default.findByEmail(email);
            if (!user)
                throw new Error("invalid credentials");
            if (user.role !== "admin")
                throw new Error("user dont have permission to enter");
            const isMatch = yield bcryptjs_1.default.compare(password, user.password);
            if (!isMatch)
                throw new Error("invalid credentials ");
            const admin = yield userRepository_1.default.findById(user.id);
            const userData = admin;
            const accessToken = tokenService_1.default.generateToken(userData, "15m");
            const refreshToken = tokenService_1.default.generateToken(userData, "7d");
            return { admin: userData, accessToken, refreshToken };
        });
    },
    getUsers(_a) {
        return __awaiter(this, arguments, void 0, function* ({ page = 1, search = "", limit = 10, }) {
            return yield userRepository_1.default.getAllUsers({ page, search, limit });
        });
    },
    blockUser(id) {
        return __awaiter(this, void 0, void 0, function* () {
            const user = yield userRepository_1.default.findById(id);
            if (!user)
                throw new Error('user not existing');
            yield userModel_1.default.findByIdAndUpdate(id, { userStatus: user.userStatus === 'Active' ? 'Blocked' : 'Active' });
            return { valueChanged: true };
        });
    },
    deleteUser(id) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!id)
                throw new Error('id not provided');
            yield userRepository_1.default.findAndDelete(id);
            return { userDeleted: true };
        });
    },
    getUserPosts(userId_1) {
        return __awaiter(this, arguments, void 0, function* (userId, page = 1) {
            const limit = 5;
            const skip = (page - 1) * limit;
            const { posts, total } = yield postRepository_1.default.findUserPosts(userId, skip, limit);
            const totalPages = Math.ceil(total / limit);
            return { posts, totalPages, currentPage: page };
        });
    },
    // async deletePost  (postId: string, userId: string)  {
    //   const deletedPost = await postRepository.deletePost(postId, userId);
    //   if (!deletedPost) {
    //     throw new Error("Post not found or unauthorized");
    //   }
    //   return deletedPost;
    // },
};
exports.default = adminServices;
