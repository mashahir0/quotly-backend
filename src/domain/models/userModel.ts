
import mongoose from "mongoose";
import { IUser } from "../User";



const userSchema = new mongoose.Schema<IUser>({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, default: null },
  userStatus:  {type : String , enum: ["Active", "Blocked"], default : 'Active'},
  role: { type: String, default: 'user' },
  photo:{type :String,default:null}
},
{ timestamps: true }
);


const userModel = mongoose.model<IUser>('User', userSchema);

export default userModel;



