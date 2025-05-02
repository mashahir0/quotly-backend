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
const adminService_1 = __importDefault(require("../../usecases/adminService"));
const tokenService_1 = __importDefault(require("../../usecases/tokenService"));
const postService_1 = __importDefault(require("../../usecases/postService"));
const adminController = {
    login(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { admin, accessToken, refreshToken } = yield adminService_1.default.login(req.body.email, req.body.password);
                res.cookie("adminRefreshToken", refreshToken, {
                    httpOnly: true,
                    secure: process.env.NODE_ENV === "production",
                    sameSite: "strict",
                    path: "/api/admin/refresh-token",
                });
                res.status(200).json({ admin, accessToken });
            }
            catch (error) {
                console.log(error);
                res.status(400).json({ error: error.message });
            }
        });
    },
    refreshToken(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { adminRefreshToken } = req.cookies;
                if (!adminRefreshToken)
                    return res.status(401).json({ error: "No token provided" });
                const newToken = yield tokenService_1.default.refreshToken(adminRefreshToken);
                res.status(200).json(newToken);
            }
            catch (error) {
                res.status(401).json({ error: error.message });
            }
        });
    },
    getUsers(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { page = "1", search = "" } = req.query;
                const result = yield adminService_1.default.getUsers({
                    page: parseInt(page),
                    search: search,
                });
                res.status(200).json(result);
            }
            catch (error) {
                res.status(500).json({ error: error.message });
            }
        });
    },
    blockUser(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { id } = req.body;
                const result = yield adminService_1.default.blockUser(id);
                res.status(200).json(result);
            }
            catch (error) {
                res.status(400).json({ error: error.message });
            }
        });
    },
    deleteUser(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { id } = req.body;
                if (!id) {
                    return res.status(400).json({ error: "User ID is required" });
                }
                const result = yield adminService_1.default.deleteUser(id);
                res.status(200).json(result);
            }
            catch (error) {
                res.status(400).json({ error: error.message });
            }
        });
    },
    getUserPosts(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { userId } = req.params;
                const page = parseInt(req.query.page) || 1;
                const limit = 10;
                const result = yield postService_1.default.getUserPosts(userId, page, limit);
                res.status(200).json(result);
            }
            catch (error) {
                res.status(500).json({ error: error.message });
            }
        });
    },
    deletePost(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { postId, userId } = req.params;
                yield postService_1.default.deletePost(postId, userId);
                res.status(200).json({ message: "Post deleted" });
            }
            catch (error) {
                console.log(error);
                res.status(500).json({ error: error.message });
            }
        });
    },
};
exports.default = adminController;
