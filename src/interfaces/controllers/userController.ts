import { Request, Response } from "express";
import userService from "../../usecases/userService";
import tokenService from "../../usecases/tokenService";


interface AuthenticatedRequest extends Request {
  user?: { id: string; name: string; email: string; role: string }; 
}

const authController = {
  async register(req: Request, res: Response) {
    try {
      const user = await userService.register(req.body);
      res.status(201).json(user);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  },
  
  async resetPasswordController  (req: Request, res: Response) {
    const { email, newPassword } = req.body;
  
    try {
      const message = await userService.resetPasswordService(email, newPassword);
      res.status(200).json({ message });
    } catch (err: any) {
      console.log('from restcontroller',err)
      res.status(400).json({ error: err.message || "Password reset failed" });
    }
  },
  

  async login(req: Request, res: Response) {
    try {
      
      const { user, accessToken, refreshToken } = await userService.login(
        req.body.email,
        req.body.password
      );
      res.cookie("userRefreshToken", refreshToken, {
        httpOnly: true, 
        secure: process.env.NODE_ENV === "production", 
        sameSite: "strict", 
        path: "/api/user/refresh-token", 
      });
      res.status(200).json({ user, accessToken });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  },
  async googleAuth(req: Request, res: Response) {
    try {

      const { token } = req.body; // Expect access token from frontend

      if (!token) {
        return res.status(400).json({ error: "No Google token provided" });
      }

      const { accessToken, refreshToken, user } = await userService.googleLogin(
        token
      );

      
      res.cookie("userRefreshToken", refreshToken, {
        httpOnly: true, 
        secure: process.env.NODE_ENV === "production", 
        sameSite: "strict", 
        path: "/api/user/refresh-token", 
      });
      return res.status(200).json({ accessToken, user });
    } catch (error: any) {
      return res.status(500).json({ error: error.message });
    }
  },

  async refreshToken(req: Request, res: Response) {
    try {
      const { userRefreshToken } = req.cookies;
      if (!userRefreshToken)
        return res.status(401).json({ error: "No token provided" });

      const newToken = await tokenService.refreshToken(userRefreshToken);

      res.status(200).json(newToken);
    } catch (error: any) {
      res.status(401).json({ error: error.message });
    }
  },

  async getUserData(req: AuthenticatedRequest, res: Response) {
    try {
      const userId = req.user?.id;

      if (!userId) {
        return res.status(401).json({ error: "Unauthorized" });
      }

      const user = await userService.getUserDetails(userId);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }

      res.status(200).json(user);
    } catch (error: any) {
      console.error("Error getting user details:", error);
      res.status(500).json({ error: "Server error" });
    }
  },

  async uploadProfileData(req:AuthenticatedRequest,res:Response){
    try {
      const userId = req.user?.id; // Ensure user is authenticated
      if (!userId) return res.status(401).json({ message: "Unauthorized" });
  
      const { name } = req.body;
      const profilePicUrl = req.file?.path; // Cloudinary uploaded image URL (if exists)
  
      const updatedUser = await userService.updateProfile(userId, name, profilePicUrl);
  
      res.status(200).json({ message: "Profile updated successfully", user: updatedUser });
    } catch (error:any) {
      res.status(500).json({ message: "Server error", error: error.message });
    }
  }
};

export default authController;
