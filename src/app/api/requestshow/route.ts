import { connect } from "@/dbconfig/dbconfig";
import FriendRequest from "@/models/friendrequestModel";
import User from "@/models/userModel";
import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
export async function GET(request: NextRequest) {
  try {
    await connect();
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ requests: [] });

    const currentUser = await User.findOne({ userId });
    if (!currentUser) return NextResponse.json({ requests: [] });

    const requests = await FriendRequest.find({ reqTo: currentUser._id }).populate("reqBy");

    return NextResponse.json({ requests });
  } catch (error: any) {
    console.error(error);
    return NextResponse.json({ requests: [] });
  }
}