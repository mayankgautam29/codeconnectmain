import { connect } from "@/dbconfig/dbconfig";
import User from "@/models/userModel";
import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  try {
    await connect();
    const { userId } = await auth();
    const { searchParams } = new URL(req.url);
    const query = searchParams.get("q");
    if (!query) {
      return NextResponse.json({ users: [] });
    }
    const users = await User.find({
      userId: { $ne: userId },
      $or: [
        { username: { $regex: query, $options: "i" } },
        { email: { $regex: query, $options: "i" } },
      ],
    }).select("_id username email profileImg");
    return NextResponse.json({ users });
  } catch (error: any) {
    console.error("❌ Search Error:", error.message);
    return NextResponse.json({ users: [] }, { status: 500 });
  }
}
