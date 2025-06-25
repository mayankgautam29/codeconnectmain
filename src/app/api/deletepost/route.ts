import { connect } from "@/dbconfig/dbconfig";
import Post from "@/models/postModel";
import { NextRequest, NextResponse } from "next/server";

export async function DELETE(request: NextRequest) {
  await connect();

  let body;
  try {
    body = await request.json();
    console.log("Parsed body:", body);
  } catch (err) {
    console.error("Error parsing body:", err);
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const id = body?.id;
  if (!id) {
    return NextResponse.json({ error: "Post ID missing" }, { status: 400 });
  }

  const post = await Post.findByIdAndDelete(id);
  if (!post) {
    return NextResponse.json({ error: "Post not found" }, { status: 404 });
  }

  console.log("Deleted post with id:", id);
  return NextResponse.json({ success: true, data: post });
}
