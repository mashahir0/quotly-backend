import mongoose from "mongoose";

const SavedQuoteSchema = new mongoose.Schema({
  userId: { type: String, required: true},
  quotes: [{ type: String }] 
});

export default mongoose.model("SavedQuote", SavedQuoteSchema);