import { auth } from "@clerk/nextjs/server";
import { NextResponse, NextRequest } from "next/server";
import { clerkClient } from "@clerk/nextjs/server";
import { currentUser } from "@clerk/nextjs/server";
import User from "@/models/userModel"
export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth();
    return NextResponse.json({ userId });
  } catch (error: any) {
    return NextResponse.json({});
  }
}