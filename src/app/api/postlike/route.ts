import { connect } from "@/dbconfig/dbconfig";
import Post from "@/models/postModel";
import User from "@/models/userModel";
import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    await connect();
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const user = await User.findOne({ userId });
    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

    const { id } = await req.json();
    const post = await Post.findById(id);
    if (!post) return NextResponse.json({ error: "Post not found" }, { status: 404 });

    const alreadyLiked = post.likedBy.includes(user._id);

    if (alreadyLiked) {
      post.likes -= 1;
      post.likedBy.pull(user._id);
    } else {
      post.likes += 1;
      post.likedBy.push(user._id);
    }

    await post.save();

    return NextResponse.json({
      updatedLikes: post.likes,
      liked: !alreadyLiked,
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
