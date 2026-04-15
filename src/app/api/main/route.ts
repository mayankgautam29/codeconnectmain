import { connect } from "@/dbconfig/dbconfig";
import User from "@/models/userModel";
import Post from "@/models/postModel";
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";

export async function POST(request: NextRequest) {
  try {
    await connect();

    // Get the currently authenticated Clerk user ID
    const { userId } = await auth();
    let usrId = "";
    let mongoUser = null;

    if (userId) {
      mongoUser = await User.findOne({ userId });
      if (mongoUser) {
        usrId = mongoUser._id.toString();
      }
    }

    // Get all posts, populate post owner and likedBy
    const posts = await Post.find({})
      .populate("userId", "username profileImg") // populate username, profileImg of post creator
      .populate("likedBy", "_id"); // only need _id to check likes

    // Format posts for frontend (skip broken refs)
    const combinedPosts = posts
      .filter((post) => post.userId && typeof post.userId === "object")
      .map((post) => {
        const user = post.userId as {
          _id: { toString: () => string };
          username: string;
          profileImg: string;
        };
        const liked =
          mongoUser?.id &&
          post.likedBy.some((likedUser: { _id: { equals: (id: unknown) => boolean } }) =>
            likedUser._id.equals(mongoUser._id)
          );

        return {
          _id: post._id,
          imageUrl: post.imageUrl,
          caption: post.caption,
          createdAt: post.createdAt,
          likes: post.likes,
          liked: !!liked,
          user: {
            userId: user._id.toString(),
            username: user.username,
            profileImg: user.profileImg,
          },
        };
      });

    return NextResponse.json({ posts: combinedPosts, usrId });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error("❌ Error in /api/main:", message);
    return NextResponse.json({ posts: [], usrId: "", error: message }, { status: 500 });
  }
}
