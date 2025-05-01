import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import UserRepository from "../../infrastructure/repositories/userRepository";
import { IUser } from "../../domain/User";
dotenv.config();



export interface AuthenticatedRequest extends Request {
  user?: { id: string; email: string; role: "admin" | "user" };
}

// ✅ Verify Token Middleware (Basic Authentication)
export const verifyToken = () => {
  return async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {  
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ message: "No access token" });
    }

    const token = authHeader.split(" ")[1];

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as {
        id: string;
        email: string;
        role: "admin" | "user";
        status : string
      };
      if(decoded.status === 'Blocked') res.status(400).json({message : 'user unable to share post'})
      req.user = decoded;
      next();
    } catch (error) {
      return res.status(401).json({ message: "Invalid or expired token" });
    }
  };
};

// ✅ Role-Based Authorization Middleware (RBAC)
export const authorizeRoles = (allowedRoles: string[]) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.user || !allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ message: "Access denied: Insufficient role" });
    }
    next();
  };
};