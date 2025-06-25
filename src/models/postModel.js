import mongoose, { Schema } from "mongoose";

const postSchema = new Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  imageUrl: [{ type: String, required: true }],
  caption: { type: String, default: "" },
  createdAt: { type: Date, default: Date.now },
  likes: { type: Number, default: 0 },
  likedBy: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
});

const Post = mongoose.models.Post || mongoose.model("Post", postSchema);
export default Post;
