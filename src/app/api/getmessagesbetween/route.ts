import { connect } from "@/dbconfig/dbconfig";
import { auth } from "@clerk/nextjs/server";
import Message from "@/models/messagemodel";
import User from "@/models/userModel";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    await connect();
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ messages: [], error: "Unauthorized" }, { status: 401 });
    }
    const { targetUserId } = await req.json();
    if (!targetUserId) {
      return NextResponse.json({ messages: [], error: "Target user required" }, { status: 400 });
    }
    const messages = await Message.find({
      $or: [
        { senderId: userId, receiverId: targetUserId },
        { senderId: targetUserId, receiverId: userId },
      ],
    }).sort({ time: 1 });
    const safeMessages = messages.map((msg) => ({
      text: msg.text,
      senderId: msg.senderId,
      receiverId: msg.receiverId,
      roomId: msg.roomId,
      time: msg.time?.toISOString?.() || new Date().toISOString(),
    }));
    const targetUser = await User.findOne({ userId: targetUserId }).select("username profileImg");
    return NextResponse.json({
      messages: safeMessages,
      targetUser,
    });
  } catch (error: any) {
    console.error("❌ Error in getmessagesbetween:", error.message);
    return NextResponse.json({ messages: [], error: error.message }, { status: 500 });
  }
}
