"use client";

import { Button } from "@/components/ui/button";
import axios from "axios";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselPrevious,
  CarouselNext,
} from "@/components/ui/carousel";

interface Post {
  _id?: string;
  imageUrl: string[];
  caption: string;
  createdAt?: string | Date;
  likes?: number;
  liked?: boolean;
  user: {
    userId: string;
    username: string;
    profileImg: string;
  };
}

export default function HomePage() {
  const [data, setData] = useState<Post[]>([]);
  const [loading, setLoading] = useState(false);
  const [userId, setUserId] = useState("");
  const router = useRouter();

  useEffect(() => {
    const getData = async () => {
      try {
        setLoading(true);
        const res = await axios.post("/api/main");
        setData(res.data.posts || []);
        setUserId(res.data.usrId);
      } catch (err) {
        console.error("Error fetching posts:", err);
        setData([]);
      } finally {
        setLoading(false);
      }
    };
    getData();
  }, []);

  const handleDelete = async (id: string) => {
    const res = await fetch("/api/deletepost", {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ id }),
    });

    const result = await res.json();
    setData((prev) => prev.filter((post) => post._id !== id));
    router.push("/");
  };

  const handleLike = async (id: string) => {
    if (!userId) return router.push("/sign-in");

    const res = await fetch("/api/postlike", {
      method: "POST",
      headers: { "Content-type": "application/json" },
      body: JSON.stringify({ id }),
    });

    const result = await res.json();
    if (!res.ok) return console.error(result.error);

    setData((prev) =>
      prev.map((post) =>
        post._id === id
          ? { ...post, likes: result.updatedLikes, liked: result.liked }
          : post
      )
    );
  };

  return (
    <div className="max-w-6xl mx-auto mt-12 px-4">
      {loading ? (
        <div className="text-lg font-semibold text-white">Loading posts...</div>
      ) : Array.isArray(data) && data.length > 0 ? (
        <div className="space-y-10">
          {data.map((post) => (
            <div
              key={post._id}
              className="max-w-xl mx-auto rounded-2xl overflow-hidden bg-gradient-to-br from-[#1a1a2e] to-[#2d2d44] border border-[#3a3a5a] shadow-2xl transition-transform duration-300 hover:scale-[1.02]"
            >
              <div className="backdrop-blur-sm bg-white/5 p-6 space-y-6">
                <Link href={`/profile/${post.user.userId}`}>
                  <div className="flex items-center gap-4 hover:opacity-90 transition">
                    <Image
                      src={post.user.profileImg}
                      alt="profile"
                      width={50}
                      height={50}
                      className="rounded-full border border-white/20 shadow-md"
                    />
                    <p className="text-lg font-semibold text-white">
                      {post.user.username}
                    </p>
                  </div>
                </Link>
                <div className="relative w-full aspect-video rounded-xl overflow-hidden border border-white/10 shadow-inner">
                  <Carousel className="w-full h-full">
                    <CarouselContent className="h-full">
                      {post.imageUrl.map((url, idx) => (
                        <CarouselItem
                          key={idx}
                          className="w-full h-[300px] relative"
                        >
                          {url.endsWith(".mp4") ? (
                            <video
                              className="w-full h-full object-cover rounded-xl"
                              controls
                            >
                              <source src={url} type="video/mp4" />
                            </video>
                          ) : (
                            <div className="relative w-full h-full">
                              <Image
                                src={url}
                                alt={`media-${idx}`}
                                fill
                                sizes="100%"
                                className="object-cover rounded-xl"
                              />
                            </div>
                          )}
                        </CarouselItem>
                      ))}
                    </CarouselContent>
                    <CarouselPrevious className="absolute top-1/2 -translate-y-1/2 left-2 z-10" />
                    <CarouselNext className="absolute top-1/2 -translate-y-1/2 right-2 z-10" />
                  </Carousel>
                </div>
                <p className="text-sm text-center text-gray-300 italic">
                  {post.user.username}: {post.caption}
                </p>
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                  <p className="text-pink-400 font-medium text-sm">
                    ❤️ {post.likes ?? 0} likes
                  </p>
                  <Button
                    className={`rounded-full px-6 py-2 text-sm font-semibold shadow-md transition-all duration-300 ${
                      post.liked
                        ? "bg-gradient-to-tr from-red-500 to-pink-500 text-white hover:brightness-110"
                        : "border border-blue-500 text-blue-400 hover:bg-blue-500 hover:text-white"
                    }`}
                    onClick={() => handleLike(post._id!)}
                  >
                    {post.liked ? "Unlike" : "Like"}
                  </Button>
                </div>
                {post._id && post.user.userId === userId && (
                  <div className="text-right pt-2">
                    <Button
                      className="bg-red-600 hover:bg-red-700 text-white px-4 py-1 rounded-full text-sm shadow-md"
                      onClick={() => handleDelete(post._id!)}
                    >
                      Delete
                    </Button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-center text-gray-500 text-lg mt-20">
          No posts to display.
        </p>
      )}
    </div>
  );
}
