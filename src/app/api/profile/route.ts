import { connect } from "@/dbconfig/dbconfig";
import User from "@/models/userModel";
import Post from "@/models/postModel";
import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { CACHE_KEYS, CACHE_TTL, cacheGet, cacheSet } from "@/lib/cache";

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

    const cacheKey = CACHE_KEYS.profile(user._id.toString());
    const cached = await cacheGet<{ userData: unknown; posts: unknown[] }>(cacheKey);
    if (cached) {
      return NextResponse.json(cached);
    }

    const userPosts = await Post.find({ userId: user._id }).sort({ createdAt: -1 }).lean();
    const combinedPosts = userPosts.map((post) => ({
      _id: post._id,
      imageUrl: Array.isArray(post.imageUrl) ? post.imageUrl : [post.imageUrl],
      caption: post.caption,
      createdAt: post.createdAt,
      likes: post.likes ?? 0,
    }));

    const payload = { userData: user, posts: combinedPosts };
    await cacheSet(cacheKey, payload, CACHE_TTL.PROFILE);

    return NextResponse.json(payload);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error("[API /profile] Error:", message);
    return NextResponse.json({ userData: null }, { status: 500 });
  }
}
