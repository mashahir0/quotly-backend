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
const userModel_1 = __importDefault(require("../../domain/models/userModel"));
const userModel_2 = __importDefault(require("../../domain/models/userModel"));
const postRepository_1 = __importDefault(require("./postRepository"));
const UserRepository = {
    save(user) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield new userModel_1.default(user).save();
        });
    },
    findByEmail(email) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield userModel_1.default.findOne({ email });
        });
    },
    findByName(name) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield userModel_1.default.findOne({ name });
        });
    },
    findById(id) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield userModel_1.default.findById(id).select('-password').exec();
        });
    },
    getAllUsers(_a) {
        return __awaiter(this, arguments, void 0, function* ({ page, search, limit = 10, }) {
            const query = {
                role: { $ne: "admin" },
                $or: [
                    { name: { $regex: search, $options: "i" } },
                    { email: { $regex: search, $options: "i" } },
                ],
            };
            const skip = (page - 1) * limit;
            const [users, total] = yield Promise.all([
                userModel_1.default.find(query)
                    .select("-password")
                    .skip(skip)
                    .limit(limit)
                    .sort({ createdAt: -1 })
                    .exec(),
                userModel_1.default.countDocuments(query),
            ]);
            const totalPages = Math.ceil(total / limit);
            return {
                users,
                totalPages,
                currentPage: page,
            };
        });
    },
    findAndDelete(id) {
        return __awaiter(this, void 0, void 0, function* () {
            // Step 1: Delete all posts by this user
            yield postRepository_1.default.deletePostsByUser(id);
            // Step 2: Delete the user
            return yield userModel_2.default.findByIdAndDelete(id);
        });
    },
    updateProfile(userId, updateData) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield userModel_2.default.findByIdAndUpdate(userId, updateData, { new: true });
        });
    },
    //   async getUsersForChat(search: string, page: number, limit: number, lastId?: string) {
    //     const query: any = {};
    //     // ✅ Optimized Search using text index (if available)
    //     if (search) {
    //         query.name = { $regex: `^${search}`, $options: "i" }; // Starts with search term
    //     }
    //     // ✅ Efficient Pagination using `_id`
    //     if (lastId) {
    //         query._id = { $gt: lastId }; // Fetch users greater than last `_id`
    //     }
    //     const users = await userModel
    //         .find(query)
    //         .sort({ _id: 1 }) // ✅ Sorting by `_id` prevents overlaps
    //         .limit(limit)
    //         .select("_id name photo")
    //         .lean();
    //     return {
    //         users,
    //         lastId: users.length > 0 ? users[users.length - 1]._id : null, // ✅ Return last `_id` for frontend pagination
    //     };
    // }
    searchUsers(search, page, limit) {
        return __awaiter(this, void 0, void 0, function* () {
            const query = {
                name: { $regex: search, $options: "i" },
            };
            const [users, total] = yield Promise.all([
                userModel_2.default
                    .find(query)
                    .sort({ _id: 1 })
                    .skip((page - 1) * limit)
                    .limit(limit)
                    .select("_id name photo")
                    .lean(),
                userModel_2.default.countDocuments(query),
            ]);
            return {
                users,
                total,
            };
        });
    },
    updateUserPassword(email, hashedPassword) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield userModel_2.default.updateOne({ email }, { $set: { password: hashedPassword } });
        });
    },
};
exports.default = UserRepository;
