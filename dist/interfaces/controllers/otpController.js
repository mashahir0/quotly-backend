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
exports.verifyOtp = exports.sendOtp = void 0;
const redis_1 = __importDefault(require("../../config/redis"));
const mailer_1 = require("../../utils/mailer");
const sendOtp = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { email } = req.body;
        if (!email)
            return res.status(400).json({ error: "Email is required" });
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        yield redis_1.default.set(`otp:${email}`, otp, { EX: 300 }); // expires in 5 mins
        const html = `<p>Your OTP code is <b>${otp}</b>. It expires in 5 minutes.</p>`;
        yield (0, mailer_1.sendMail)(email, "Your OTP Code", html);
        res.json({ message: "OTP sent to email." });
    }
    catch (error) {
        console.error("Error sending OTP:", error);
        res.status(500).json({ error: "Failed to send OTP. Please try again." });
    }
});
exports.sendOtp = sendOtp;
const verifyOtp = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { email, otp } = req.body;
        if (!email || !otp)
            return res.status(400).json({ error: "Missing fields" });
        const storedOtp = yield redis_1.default.get(`otp:${email}`);
        if (!storedOtp)
            return res.status(410).json({ error: "OTP expired or invalid" });
        if (storedOtp !== otp)
            return res.status(401).json({ error: "Incorrect OTP" });
        // After verifying OTP
        yield redis_1.default.setEx(`verified:${email}`, 600, "true"); // valid for 10 mins
        yield redis_1.default.del(`otp:${email}`); // Remove after verification
        res.json({ message: "OTP verified successfully" });
    }
    catch (error) {
        console.error("Error verifying OTP:", error);
        res.status(500).json({ error: "Failed to verify OTP. Please try again." });
    }
});
exports.verifyOtp = verifyOtp;
