import { NextRequest, NextResponse } from "next/server";
import cloudinary from "@/utils/cloudinary";
import { connect } from "@/dbconfig/dbconfig";
import Post from "@/models/postModel";
import { auth } from "@clerk/nextjs/server";
import User from "@/models/userModel";
import type { UploadApiResponse } from "cloudinary";

export async function POST(req: NextRequest) {
  try {
    await connect();
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await User.findOne({ userId });
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const body = await req.json();
    const { files, types, caption } = body;

    if (!Array.isArray(files) || files.length === 0) {
      return NextResponse.json({ error: "No files provided" }, { status: 400 });
    }

    const urls: string[] = [];

    for (let i = 0; i < files.length; i++) {
      const result = await cloudinary.uploader.upload(files[i], {
        resource_type: types[i],
        folder: "codeconnect",
      }) as UploadApiResponse;

      urls.push(result.secure_url);
    }

    const newPost = new Post({
      userId: user._id,
      imageUrl: urls,
      caption,
    });

    await newPost.save();

    return NextResponse.json({ urls }, { status: 200 });

  } catch (err: any) {
    console.error("Upload error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
