import { connect } from "@/dbconfig/dbconfig";
import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import Message from "@/models/messagemodel";
import User from "@/models/userModel";

export async function POST(request: NextRequest) {
  try {
    await connect();
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ resmsg: [], sentmsg: [], userMap: {} });
    }
    const sentmsg = await Message.find({ senderId: userId });
    const resmsg = await Message.find({ receiverId: userId });
    const userIds = new Set<string>();
    resmsg.forEach((msg) => userIds.add(msg.senderId));
    sentmsg.forEach((msg) => userIds.add(msg.receiverId));
    const users = await User.find({ userId: { $in: Array.from(userIds) } });
    const userMap: Record<string, { username: string; profileImg: string }> = {};
    users.forEach((u) => {
      userMap[u.userId] = {
        username: u.username,
        profileImg: u.profileImg,
      };
    });
    return NextResponse.json({
      resmsg,
      sentmsg,
      userMap,
    });
  } catch (error:any) {
    return NextResponse.json({
      resmsg: [],
      sentmsg: [],
      userMap: {},
      error: error.message,
    });
  }
}
