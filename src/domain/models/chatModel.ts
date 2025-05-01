import mongoose from "mongoose";

const chatSchema = new mongoose.Schema(
  {
    senderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    receiverId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    message: {
      type: String,
      required: true,
    },
    seen: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true, // includes createdAt, which is needed for TTL
  }
);


chatSchema.index({ createdAt: 1 }, { expireAfterSeconds: 60 * 60 * 24 * 15 });


const chatModel = mongoose.model("Chat", chatSchema);
export default chatModel;
