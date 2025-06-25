import { connect } from "@/dbconfig/dbconfig";
import User from "@/models/userModel";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const { userId } = await request.json();
    if (!userId) {
      return NextResponse.json({ user: null });
    }
    const user = await User.findOne({ userId });
    if (!user) {
      return NextResponse.json({ user: null });
    }
    return NextResponse.json({ user: user });
  } catch (error: any) {
    return NextResponse.json({ user: null });
  }
}
