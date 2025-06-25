import { connect } from "@/dbconfig/dbconfig";
import FriendRequest from "@/models/friendrequestModel";
import User from "@/models/userModel";
import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
export async function GET(req: NextRequest) {
  await connect();
  const { searchParams } = new URL(req.url);
  const to = searchParams.get("to");

  const { userId } = await auth();
  const currentUser = await User.findOne({ userId });

  if (!currentUser || !to) {
    return NextResponse.json({ status: "none" });
  }

  if (currentUser.friends?.includes(to)) {
    return NextResponse.json({ status: "friends" });
  }

  const existing = await FriendRequest.findOne({
    reqBy: currentUser._id,
    reqTo: to,
    status: "pending",
  });

  return NextResponse.json({ status: existing ? "pending" : "none" });
}
