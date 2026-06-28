import { connect } from "@/dbconfig/dbconfig";
import User from "@/models/userModel";
import Post from "@/models/postModel";
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import {
  CACHE_KEYS,
  CACHE_TTL,
  cacheGet,
  cacheSet,
} from "@/lib/cache";

const PAGE_SIZE = 10;

type CachedPost = {
  _id: string;
  imageUrl: string[];
  caption: string;
  createdAt: string;
  likes: number;
  likedBy: string[];
  user: {
    userId: string;
    username: string;
    profileImg: string;
  };
};

export async function POST(request: NextRequest) {
  try {
    await connect();

    const body = await request.json().catch(() => ({}));
    const page = Math.max(1, Number(body.page) || 1);
    const sort = body.sort === "likes" ? "likes" : "newest";

    const cacheKey = CACHE_KEYS.feed(page, sort);
    let cachedPosts = await cacheGet<CachedPost[]>(cacheKey);

    if (!cachedPosts) {
      const skip = (page - 1) * PAGE_SIZE;

      const posts = await Post.find({})
        .sort(sort === "likes" ? "-likes" : "-createdAt")
        .skip(skip)
        .limit(PAGE_SIZE)
        .populate("userId", "username profileImg")
        .populate("likedBy", "_id")
        .lean();

      cachedPosts = posts
        .filter((post) => post.userId && typeof post.userId === "object")
        .map((post) => {
          const user = post.userId as {
            _id: { toString: () => string };
            username: string;
            profileImg: string;
          };
          const likedBy = (post.likedBy as { _id: { toString: () => string } }[]) || [];

          return {
            _id: String(post._id),
            imageUrl: post.imageUrl,
            caption: post.caption,
            createdAt: post.createdAt?.toISOString?.() ?? String(post.createdAt),
            likes: post.likes ?? 0,
            likedBy: likedBy.map((u) => u._id.toString()),
            user: {
              userId: user._id.toString(),
              username: user.username,
              profileImg: user.profileImg,
            },
          };
        });

      await cacheSet(cacheKey, cachedPosts, CACHE_TTL.FEED);
    }

    const { userId } = await auth();
    let usrId = "";
    let mongoUserId = "";

    if (userId) {
      const mongoUser = await User.findOne({ userId }).select("_id");
      if (mongoUser) {
        usrId = mongoUser._id.toString();
        mongoUserId = usrId;
      }
    }

    const combinedPosts = cachedPosts.map((post) => ({
      _id: post._id,
      imageUrl: post.imageUrl,
      caption: post.caption,
      createdAt: post.createdAt,
      likes: post.likes,
      liked: mongoUserId ? post.likedBy.includes(mongoUserId) : false,
      user: post.user,
    }));

    const totalPosts = await Post.countDocuments();
    const hasMore = page * PAGE_SIZE < totalPosts;

    return NextResponse.json({
      posts: combinedPosts,
      usrId,
      page,
      hasMore,
      totalPosts,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error("❌ Error in /api/main:", message);
    return NextResponse.json({ posts: [], usrId: "", error: message }, { status: 500 });
  }
}
