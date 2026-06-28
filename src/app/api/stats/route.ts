import { connect } from "@/dbconfig/dbconfig";
import User from "@/models/userModel";
import Post from "@/models/postModel";
import Message from "@/models/messagemodel";
import { NextResponse } from "next/server";
import { CACHE_KEYS, CACHE_TTL, cacheGet, cacheSet } from "@/lib/cache";

type PlatformStats = {
  users: number;
  posts: number;
  messages: number;
  cachedAt: string;
};

export async function GET() {
  try {
    const cached = await cacheGet<PlatformStats>(CACHE_KEYS.stats());
    if (cached) {
      return NextResponse.json(cached);
    }

    await connect();

    const [users, posts, messages] = await Promise.all([
      User.countDocuments(),
      Post.countDocuments(),
      Message.countDocuments(),
    ]);

    const stats: PlatformStats = {
      users,
      posts,
      messages,
      cachedAt: new Date().toISOString(),
    };

    await cacheSet(CACHE_KEYS.stats(), stats, CACHE_TTL.STATS);

    return NextResponse.json(stats);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error("❌ Error in /api/stats:", message);
    return NextResponse.json({ users: 0, posts: 0, messages: 0 }, { status: 500 });
  }
}
