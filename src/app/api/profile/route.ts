import { connect } from "@/dbconfig/dbconfig";
import User from "@/models/userModel";
import Post from "@/models/postModel";
import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    await connect();
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ userData: null });
    }
    const user = await User.findOne({ userId }).populate("friends");
    if (!user) {
      return NextResponse.json({ userData: null });
    }
    const userPosts = await Post.find({ userId: user._id });
    const combinedPosts = userPosts.map((post) => ({
      _id: post._id,
      imageUrl: Array.isArray(post.imageUrl) ? post.imageUrl : [post.imageUrl],
      caption: post.caption,
      createdAt: post.createdAt,
    }));
    return NextResponse.json({ userData: user, posts: combinedPosts });
  } catch (error: any) {
    console.error("[API /profile] Error:", error.message);
    return NextResponse.json({ userData: null }, { status: 500 });
  }
}