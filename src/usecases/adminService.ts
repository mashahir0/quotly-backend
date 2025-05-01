import { IUser } from "../domain/User";
import tokenService from "./tokenService";
import UserRepository from "../infrastructure/repositories/userRepository";
import bcrypt from "bcryptjs";
import userModel from "../domain/models/userModel";
import postRepository from "../infrastructure/repositories/postRepository";

const adminServices = {
  async login(email: string, password: string) {
    const user = await UserRepository.findByEmail(email);
    if (!user) throw new Error("invalid credentials");
    if (user.role !== "admin")
      throw new Error("user dont have permission to enter");

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) throw new Error("invalid credentials ");

    const admin = await UserRepository.findById(user.id)
    const userData = admin as IUser

    const accessToken = tokenService.generateToken(userData, "15m");
    const refreshToken = tokenService.generateToken(userData, "7d");
    return { admin: userData, accessToken, refreshToken };
  },
  async getUsers({
    page = 1,
    search = "",
    limit = 10,
  }: {
    page: number;
    search: string;
    limit?: number;
  }) {
    return await UserRepository.getAllUsers({ page, search, limit });
  },
  async blockUser(id : string){
    const  user = await UserRepository.findById(id)
    if(!user) throw new Error('user not existing')
    await userModel.findByIdAndUpdate(id ,{userStatus : user.userStatus === 'Active' ? 'Blocked' : 'Active'})
    return { valueChanged : true}
  },
  async deleteUser(id:string){
    if(!id) throw new Error('id not provided')
    await UserRepository.findAndDelete(id)
    return {userDeleted : true}
  },
  async getUserPosts  (userId: string, page: number = 1)  {
    const limit = 5;
    const skip = (page - 1) * limit;
  
    const { posts, total } = await postRepository.findUserPosts(userId, skip, limit);
    const totalPages = Math.ceil(total / limit);
  
    return { posts, totalPages, currentPage: page };
  },
  
  // async deletePost  (postId: string, userId: string)  {
  //   const deletedPost = await postRepository.deletePost(postId, userId);
  //   if (!deletedPost) {
  //     throw new Error("Post not found or unauthorized");
  //   }
  //   return deletedPost;
  // },
};

export default adminServices;
