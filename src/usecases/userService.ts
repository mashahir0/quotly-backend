import bcrypt, { hash } from "bcryptjs";
import UserRepository from "../infrastructure/repositories/userRepository";
import tokenService from "./tokenService";
import { User, IUser } from "../domain/User";
import axios from "axios";
import postRepository from "../infrastructure/repositories/postRepository";
import redisClient from "../config/redis";

const userService = {
  async register(userData: { name: string; email: string; password: string }) {
    const nameExist = await UserRepository.findByName(userData.name)
    if(nameExist) throw new Error("userName already exist")
    const existingUser = await UserRepository.findByEmail(userData.email);
    if (existingUser) throw new Error("User already exists");
    const hashedPassword = await bcrypt.hash(userData.password, 10);
    const user = new User(null, userData.name, userData.email, hashedPassword);
    return await UserRepository.save(user);
  },

  async resetPasswordService  (email: string, newPassword: string)  {
    console.log(email)
    const user = await UserRepository.findByEmail(email);
    console.log(user)
  
    if (!user) {
      throw new Error("User not found");
    }
  
    // ✅ Check if this email has been recently verified via OTP
    const isVerified = await redisClient.get(`verified:${email}`);
  
    if (!isVerified) {
      throw new Error("OTP not verified. Please verify OTP before resetting password.");
    }
  
    const hashedPassword = await hash(newPassword, 10);
    await UserRepository.updateUserPassword(email, hashedPassword);
  
    // ❌ Optional: Invalidate all tokens/sessions here
  
    // 🔒 Clean up
    await redisClient.del(`verified:${email}`);
  
    return "Password updated successfully";
  },

  async login(email: string, password: string) {
    const user = await UserRepository.findByEmail(email);
    console.log(user)
    if (!user) throw new Error("Invalid credentials");

    if (user.userStatus === "Blocked") throw new Error("User Blocked by admin");

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) throw new Error("Invalid credentials");

    const userData = user as IUser;

    const accessToken = tokenService.generateToken(userData, "15m");
    const refreshToken = tokenService.generateToken(userData, "7d");

    return { user: userData, accessToken, refreshToken };
  },
  async getUserDetails(id: string) {
    const user = await UserRepository.findById(id);

    if (!user) {
      throw new Error("User not found");
    }
    const totalPost = await postRepository.count({ userId :id });
    const totalLikes = await postRepository.getTotalLikes(id)

    return {
       userData: user, 
       totalPost: totalPost ,
       totalLikes : totalLikes
      };
  },
  async googleLogin(accessToken: string) {
    try {
      const { data: googleUser } = await axios.get(
        "https://www.googleapis.com/oauth2/v3/userinfo",
        {
          headers: { Authorization: `Bearer ${accessToken}` },
        }
      );

      if (!googleUser || !googleUser.email) {
        throw new Error("Invalid Google token");
      }

      let user = await UserRepository.findByEmail(googleUser.email);

      if (user?.userStatus === "Blocked")
        throw new Error("User Blocked by admin");

      if (!user) {
        user = await UserRepository.save({
          name: googleUser.name,
          email: googleUser.email,
          role: "user",
        } as User);
      }

      const userData = user as IUser;

      const newAccessToken = tokenService.generateToken(userData, "15m"); // Shorter TTL
      const newRefreshToken = tokenService.generateToken(userData, "7d"); // Longer TTL

      return {
        user: userData,
        accessToken: newAccessToken,
        refreshToken: newRefreshToken,
      };
    } catch (error: any) {
      throw new Error(error);
    }
  },
  async updateProfile(userId: string, name?: string, profilePic?: string) {
    
    if (name) {
      const nameExist = await UserRepository.findByName(name);
      
      // If the found name belongs to a different user
      if (nameExist && nameExist._id.toString() !== userId) {
        throw new Error("Username already exists");
      }
    }
    const user = await UserRepository.findById(userId);
    if (!user) {
      throw new Error("User not found");
    }

    const updateData: Partial<{ name: string; photo: string }> = {};
    if (name) updateData.name = name;
    if (profilePic) updateData.photo = profilePic;

    return await UserRepository.updateProfile(userId, updateData);
  },
  
};

export default userService;
