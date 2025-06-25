import { connect } from "@/dbconfig/dbconfig";
import User from "@/models/userModel";
import Post from "@/models/postModel";
import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  await connect();
  const { usermId } = await req.json();
  const { userId: clerkId } = await auth();
  const user = await User.findById(usermId);
  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }
  const posts = await Post.find({});
  const combinedPosts = [];

  for (const post of posts) {
    const usr = await User.findById(post.userId);

    if (usr && usr._id.toString() === user._id.toString()) {
      combinedPosts.push({
        _id: post._id,
        imageUrl: post.imageUrl,
        caption: post.caption,
        createdAt: post.createdAt,
      });
    }
  }

  return NextResponse.json({ user, combinedPosts, clerkId });
}
