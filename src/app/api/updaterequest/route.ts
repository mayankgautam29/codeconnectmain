// /api/updaterequest/route.ts
import { connect } from "@/dbconfig/dbconfig";
import FriendRequest from "@/models/friendrequestModel";
import User from "@/models/userModel";
import { NextRequest, NextResponse } from "next/server";

export async function PATCH(req: NextRequest) {
  try {
    await connect();
    const { requestId, action } = await req.json();

    if (!requestId || !["accepted", "rejected"].includes(action)) {
      return NextResponse.json({ error: "Invalid input" }, { status: 400 });
    }
    const request = await FriendRequest.findById(requestId);
    if (!request) {
      return NextResponse.json({ error: "Request not found" }, { status: 404 });
    }
    request.status = action;
    await request.save();
    if (action === "accepted") {
      await User.findByIdAndUpdate(request.reqBy, {
        $addToSet: { friends: request.reqTo },
      });

      await User.findByIdAndUpdate(request.reqTo, {
        $addToSet: { friends: request.reqBy },
      });
    }

    return NextResponse.json({ success: true, updated: request });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
