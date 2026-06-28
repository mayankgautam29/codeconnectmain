import { connect } from "@/dbconfig/dbconfig";
import User from "@/models/userModel";
import Post from "@/models/postModel";
import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { CACHE_KEYS, CACHE_TTL, cacheGet, cacheSet } from "@/lib/cache";

export async function POST(req: NextRequest) {
  try {
    await connect();
    const { usermId } = await req.json();
    const { userId: clerkId } = await auth();

    const cacheKey = CACHE_KEYS.profile(usermId);
    const cached = await cacheGet<{ user: unknown; combinedPosts: unknown[]; clerkId: string | null }>(cacheKey);
    if (cached) {
      return NextResponse.json(cached);
    }

    const user = await User.findById(usermId);
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const userPosts = await Post.find({ userId: user._id })
      .sort({ createdAt: -1 })
      .lean();

    const combinedPosts = userPosts.map((post) => ({
      _id: post._id,
      imageUrl: post.imageUrl,
      caption: post.caption,
      createdAt: post.createdAt,
      likes: post.likes ?? 0,
    }));

    const payload = { user, combinedPosts, clerkId };
    await cacheSet(cacheKey, payload, CACHE_TTL.PROFILE);

    return NextResponse.json(payload);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error("[API /profilebyid] Error:", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
