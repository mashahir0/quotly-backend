import mongoose from "mongoose";

export interface IPost {
    _id ?: string,
    userId : mongoose.Schema.Types.ObjectId | string ,
    text : string,
    likes ?: number,
    dislikes ?: number,
    likedBy?: mongoose.Schema.Types.ObjectId[] | string,
    dislikedBy?:mongoose.Schema.Types.ObjectId[] | string,
} 


export class Post {
    constructor(
        public userId : mongoose.Schema.Types.ObjectId,
        public text : string,
       
    ){}
}