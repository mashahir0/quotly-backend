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
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const userRepository_1 = __importDefault(require("../infrastructure/repositories/userRepository"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
    throw new Error("JWT_SECRET is not defined in .env");
}
const tokenService = {
    generateToken: (user, expiresIn) => {
        if (typeof expiresIn !== "string" && typeof expiresIn !== "number") {
            throw new Error("expiresIn must be a valid string or number");
        }
        const options = {
            expiresIn: expiresIn,
        };
        return jsonwebtoken_1.default.sign({ id: user._id, email: user.email, role: user.role, status: user.userStatus }, JWT_SECRET, options);
    },
    refreshToken(token) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const payload = jsonwebtoken_1.default.verify(token, JWT_SECRET);
                if (!payload.id)
                    throw new Error("Invalid token");
                const user = yield userRepository_1.default.findById(payload.id);
                if (!user)
                    throw new Error("User not found");
                const userData = user;
                const newAccessToken = this.generateToken(userData, "15m");
                return { accessToken: newAccessToken };
            }
            catch (error) {
                throw new Error("Invalid or expired refresh token");
            }
        });
    },
};
exports.default = tokenService;
