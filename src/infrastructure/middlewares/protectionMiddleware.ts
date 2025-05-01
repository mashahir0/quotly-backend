import rateLimit from "express-rate-limit";
import { Request, Response, NextFunction } from "express";


interface AuthenticatedRequest extends Request {
  user?: { id: string; name: string; email: string; role: string }; 
}

export const loginLimiter = rateLimit({
  windowMs: 5 * 60 * 1000,
  max: 5,
  message: {
    error: "Too many login attempts, try agin later ",
  },
  standardHeaders: true,
  legacyHeaders: false,
});



export const otpRateLimiter = rateLimit({
  windowMs: 5 * 60 * 1000, 
  max: 3,
  message: {
    status: 429,
    error: "Too many OTP requests. Please try again later.",
  },
  standardHeaders: true,
  legacyHeaders: false,
})



export const userPostRateLimiter = rateLimit({
  windowMs: 3 * 60 * 1000, 
  max: 2,
  keyGenerator: (req : AuthenticatedRequest) => req.user?.id || req.ip|| "anonymous", 
  message: {
    error: "Too many posts created, please slow down.",
  },
})