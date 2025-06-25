import { connect } from "@/dbconfig/dbconfig";
import User from "@/models/userModel";
import { auth, currentUser } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    await connect();
    const { userId } = await auth();
    const user = await currentUser();

    if (!userId || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const email = user.primaryEmailAddress?.emailAddress || "";
    const username = user.username || "Anonymous";
    const existing = await User.findOne({ userId });

    if (existing) {
      return NextResponse.json({ message: "User already exists", data: existing }, { status: 200 });
    }
    const newUser = await User.create({
      userId,
      email,
      username,
    });
    return NextResponse.json({ data: newUser }, { status: 201 });

  } catch (error: any) {
    console.error("❌ Error in /api/createuser:", error);
    return NextResponse.json({ error: error.message || "Something went wrong" }, { status: 500 });
  }
}
