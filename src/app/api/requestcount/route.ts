import { connect } from "@/dbconfig/dbconfig";
import FriendRequest from "@/models/friendrequestModel";
import User from "@/models/userModel";
import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { CACHE_KEYS, CACHE_TTL, cacheGet, cacheSet } from "@/lib/cache";

export async function GET() {
  try {
    await connect();
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ count: 0 });

    const currentUser = await User.findOne({ userId }).select("_id");
    if (!currentUser) return NextResponse.json({ count: 0 });

    const cacheKey = CACHE_KEYS.requestCount(currentUser._id.toString());
    const cached = await cacheGet<number>(cacheKey);
    if (cached !== null) return NextResponse.json({ count: cached });

    const count = await FriendRequest.countDocuments({
      reqTo: currentUser._id,
      status: "pending",
    });

    await cacheSet(cacheKey, count, CACHE_TTL.REQUESTS);
    return NextResponse.json({ count });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error("[API /requestcount] Error:", message);
    return NextResponse.json({ count: 0 });
  }
}
