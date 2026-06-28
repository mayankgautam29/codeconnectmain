import { connect } from "@/dbconfig/dbconfig";
import User from "@/models/userModel";
import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { CACHE_KEYS, CACHE_TTL, cacheGet, cacheSet } from "@/lib/cache";
import { rateLimit } from "@/lib/rate-limit";

export async function GET(req: NextRequest) {
  try {
    await connect();
    const { userId } = await auth();
    const { searchParams } = new URL(req.url);
    const query = searchParams.get("q")?.trim();

    if (!query || query.length < 2) {
      return NextResponse.json({ users: [] });
    }

    const ip = req.headers.get("x-forwarded-for") ?? "anonymous";
    const { success } = await rateLimit(`${ip}:search`, "search", 30, "60 s");
    if (!success) {
      return NextResponse.json({ error: "Too many searches. Try again shortly." }, { status: 429 });
    }

    const cacheKey = CACHE_KEYS.search(query);
    const cached = await cacheGet<{ _id: string; username: string; email: string; profileImg: string }[]>(cacheKey);
    if (cached) {
      return NextResponse.json({ users: cached, cached: true });
    }

    const users = await User.find({
      userId: { $ne: userId },
      $or: [
        { username: { $regex: query, $options: "i" } },
        { email: { $regex: query, $options: "i" } },
      ],
    })
      .select("_id username email profileImg")
      .limit(20)
      .lean();

    const formatted = users.map((u) => ({
      _id: String(u._id),
      username: u.username,
      email: u.email,
      profileImg: u.profileImg,
    }));

    await cacheSet(cacheKey, formatted, CACHE_TTL.SEARCH);

    return NextResponse.json({ users: formatted });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error("❌ Search Error:", message);
    return NextResponse.json({ users: [] }, { status: 500 });
  }
}
