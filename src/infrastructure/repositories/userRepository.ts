import UserModel from "../../domain/models/userModel";
import { IUser, User } from "../../domain/User";
import userModel from "../../domain/models/userModel";
import postRepository from "./postRepository";

const UserRepository = {
  async save(user: User) {
    return await new UserModel(user).save();
  },
  async findByEmail(email: string) {
    return await UserModel.findOne({ email });
  },
  async findByName(name: string) {
    return await UserModel.findOne({ name });
  },
  async findById(id: string) {
    return await UserModel.findById(id).select('-password').exec();
  },
  async getAllUsers({
    page,
    search,
    limit = 10,
  }: {
    page: number;
    search: string;
    limit: number;
  }) {
    const query = {
      role : {$ne : "admin"},
      $or: [
        { name: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
      ],
    };

    const skip = (page - 1) * limit;
    const [users, total] = await Promise.all([
      UserModel.find(query)
        .select("-password")
        .skip(skip)
        .limit(limit)
        .sort({ createdAt: -1 })
        .exec(),
      UserModel.countDocuments(query),
    ]);

    const totalPages = Math.ceil(total / limit);

    return {
      users,
      totalPages,
      currentPage: page,
    };
  },
  async findAndDelete(id: string) {
    // Step 1: Delete all posts by this user
    await postRepository.deletePostsByUser(id);

    // Step 2: Delete the user
    return await userModel.findByIdAndDelete(id);
  },
  async updateProfile(userId: string, updateData: Partial<IUser>) {
    return await userModel.findByIdAndUpdate(userId, updateData, { new: true });
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
async searchUsers(search: string, page: number, limit: number) {
  const query = {
    name: { $regex: search, $options: "i" },
  };

  const [users, total] = await Promise.all([
    userModel
      .find(query)
      .sort({ _id: 1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .select("_id name photo")
      .lean(),

    userModel.countDocuments(query),
  ]);

  return {
    users,
    total,
  };
},

async updateUserPassword (email: string, hashedPassword: string)  {
  return await userModel.updateOne({ email }, { $set: { password: hashedPassword } });
},



};

export default UserRepository;
