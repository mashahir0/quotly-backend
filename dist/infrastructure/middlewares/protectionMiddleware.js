"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.userPostRateLimiter = exports.otpRateLimiter = exports.loginLimiter = void 0;
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
exports.loginLimiter = (0, express_rate_limit_1.default)({
    windowMs: 5 * 60 * 1000,
    max: 5,
    message: {
        error: "Too many login attempts, try agin later ",
    },
    standardHeaders: true,
    legacyHeaders: false,
});
exports.otpRateLimiter = (0, express_rate_limit_1.default)({
    windowMs: 5 * 60 * 1000,
    max: 3,
    message: {
        status: 429,
        error: "Too many OTP requests. Please try again later.",
    },
    standardHeaders: true,
    legacyHeaders: false,
});
exports.userPostRateLimiter = (0, express_rate_limit_1.default)({
    windowMs: 3 * 60 * 1000,
    max: 2,
    keyGenerator: (req) => { var _a; return ((_a = req.user) === null || _a === void 0 ? void 0 : _a.id) || req.ip || "anonymous"; },
    message: {
        error: "Too many posts created, please slow down.",
    },
});
