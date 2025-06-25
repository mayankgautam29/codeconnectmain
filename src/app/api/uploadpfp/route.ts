import { NextRequest, NextResponse } from "next/server";
import cloudinary from "@/utils/cloudinary";
import { connect } from "@/dbconfig/dbconfig";
import Post from "@/models/postModel";
import { auth } from "@clerk/nextjs/server";
import User from "@/models/userModel";

export const config = {
  api: {
    bodyParser: {
      sizeLimit: "20mb",
    },
  },
};

export async function POST(req: NextRequest) {
  try {
    await connect();
    const body = await req.json();
    const { file, caption = "" } = body;
    const resource_type = "image";
    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }
    const result = await cloudinary.uploader.upload(file, {
      resource_type,
      folder: "codeconnect",
    });
    const { userId } = await auth();
    if (!userId || userId === null) {
      return NextResponse.json({ url: result.secure_url });
    }
    const updated = await User.findOneAndUpdate(
      { userId },
      { profileImg: result.secure_url }
    );
    console.log("Profile image updated");
    return NextResponse.json({ url: result.secure_url });
  } catch (err: any) {
    console.error("Upload error:", err);
    return NextResponse.json(
      { error: err.message || "Upload failed" },
      { status: 500 }
    );
  }
}
