import mongoose, { Schema } from "mongoose";

const friendrequestModel = new Schema({
  reqBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  reqTo: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  status: {
    type: String,
    enum: ["pending", "accepted", "rejected"],
    default: "pending",
  },
}, { timestamps: true });

const FriendRequest = mongoose.models.FriendRequest || mongoose.model("FriendRequest", friendrequestModel);
export default FriendRequest;