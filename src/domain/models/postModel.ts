import mongoose, { Document, Schema } from "mongoose";
import { v4 as uuidv4 } from "uuid"; 



export interface IPost extends Document {
  userId: mongoose.Types.ObjectId;
  text: string;
  likes: number;
  dislikes: number;
  likedBy: mongoose.Types.ObjectId[];
  dislikedBy: mongoose.Types.ObjectId[];
  createdAt?: Date;
  updatedAt?: Date;
  shareId?:string;
  isPublic:boolean
}


const postSchema = new Schema<IPost>(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    text: { type: String, required: true },
    likes: { type: Number, default: 0 },
    dislikes: { type: Number, default: 0 },
    likedBy: [{ type: mongoose.Schema.Types.ObjectId, ref: "User", default: [] }], // Fixed
    dislikedBy: [{ type: mongoose.Schema.Types.ObjectId, ref: "User", default: [] }],
    shareId: { type: String, default: uuidv4, unique: true },
    isPublic: { type: Boolean, default: true },
  },
  { timestamps: true }
);

const postModel = mongoose.model<IPost>("Post", postSchema);
export default postModel;
