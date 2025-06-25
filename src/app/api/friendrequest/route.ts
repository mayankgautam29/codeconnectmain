import { connect } from "@/dbconfig/dbconfig";
import FriendRequest from "@/models/friendrequestModel";
import User from "@/models/userModel";
import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
export async function POST(request: NextRequest) {
  await connect();
  const { id } = await request.json();
  if (!id) {
    return NextResponse.json({ error: "User not found" }, { status: 400 });
  }
  const { userId } = await auth();
  const currentUser = await User.findOne({ userId });

  if (!currentUser) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  const existingRequest = await FriendRequest.findOne({
    reqBy: currentUser._id,
    reqTo: id,
    status: "pending",
  });

  if (existingRequest) {
    return NextResponse.json(
      { message: "Request already sent" },
      { status: 200 }
    );
  }

  const newRequest = new FriendRequest({
    reqBy: currentUser._id,
    reqTo: id,
    status: "pending",
  });

  const saved = await newRequest.save();
  return NextResponse.json({ saved });
}

export async function DELETE(request: NextRequest) {
  await connect();
  const { id } = await request.json();

  const { userId } = await auth();
  const currentUser = await User.findOne({ userId });

  if (!currentUser) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  const removed = await FriendRequest.findOneAndDelete({
    reqBy: currentUser._id,
    reqTo: id,
    status: "pending",
  });

  if (!removed) {
    return NextResponse.json(
      { message: "No pending request found" },
      { status: 404 }
    );
  }

  return NextResponse.json({ message: "Request withdrawn" });
}
