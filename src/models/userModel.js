import mongoose, { Schema } from "mongoose";

const userSchema = new Schema({
  //clerk provided id
  userId: {
    type: String,
    required: true,
    unique: true,
  },
  username: {
    type: String,
    required: [true, "Provide a username"],
  },
  email: {
    type: String,
    required: [true, "Provide an email"],
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  profileImg: {
    type: String,
    default: "https://res.cloudinary.com/dguqpdnw6/image/upload/v1750306565/codeconnect/vpprdbsn4uxjfygao27v.png",
    required: [true,"Provide image"]
  },
  friends: [
    {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
  ],
});
const User = mongoose.models.User || mongoose.model("User", userSchema);
export default User;