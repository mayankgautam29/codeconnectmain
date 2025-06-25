"use client";

import axios from "axios";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Button } from "./ui/button";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselPrevious,
  CarouselNext,
} from "@/components/ui/carousel";

interface ProfilePgProps {
  usermId: string;
  clerkId: string | null;
}

interface User {
  _id?: string;
  userId: string;
  username: string;
  email: string;
  createdAt?: string;
  profileImg?: string;
  friends?: string[];
}

interface Post {
  _id?: string;
  imageUrl: string[];
  caption: string;
  createdAt?: string | Date;
}

export default function ProfilePg({ usermId, clerkId }: ProfilePgProps) {
  const [user, setUser] = useState<User | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [requestStatus, setRequestStatus] = useState<"none" | "pending" | "friends">("none");
  const [loading, setLoading] = useState(false);

  const router = useRouter();
  const isOwnProfile = user?.userId === clerkId;

  useEffect(() => {
    const getData = async () => {
      try {
        const res = await axios.post("/api/profilebyid", { usermId });
        setUser(res.data.user);
        setPosts(res.data.combinedPosts || []);
        if (res.data.user?.userId === clerkId) router.push("/profile");
      } catch (err) {
        console.error("Failed to fetch profile data", err);
      }
    };

    const checkStatus = async () => {
      try {
        const res = await axios.get(`/api/requeststatus?to=${usermId}`);
        setRequestStatus(res.data.status);
      } catch {
        setRequestStatus("none");
      }
    };

    getData().then(() => {
      if (clerkId !== usermId) checkStatus();
    });
  }, [usermId, clerkId]);

  const handleFriendRequest = async (id: string) => {
    setLoading(true);
    try {
      const res = await axios.post("/api/friendrequest", { id });
      if (res.data.saved || res.data.message === "Request already sent") {
        setRequestStatus("pending");
      }
    } catch {
      console.error("Error in sending friend request");
    } finally {
      setLoading(false);
    }
  };

  const handleWithdrawRequest = async (id: string) => {
    setLoading(true);
    try {
      await axios.delete("/api/friendrequest", { data: { id } });
      setRequestStatus("none");
    } catch {
      console.error("Error withdrawing friend request");
    } finally {
      setLoading(false);
    }
  };

  const formattedDate = user?.createdAt
    ? new Date(user.createdAt).toLocaleString("en-IN", {
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    : "";

  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="max-w-4xl mx-auto p-6 mt-12 text-white space-y-10"
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="bg-gradient-to-br from-[#1e1e2f] to-[#2a2a40] rounded-2xl p-8 shadow-xl text-center space-y-4"
      >
        {user?.profileImg && (
          <img
            src={user.profileImg}
            alt="Profile"
            className="w-36 h-36 mx-auto rounded-full border-4 border-white shadow-md object-cover"
          />
        )}
        <h2 className="mt-4 text-2xl font-bold">{user?.username}</h2>

        {!isOwnProfile && (
          requestStatus === "friends" ? (
            <p className="text-green-500 font-medium">Already Friends</p>
          ) : requestStatus === "pending" ? (
            <Button
              onClick={() => handleWithdrawRequest(usermId)}
              disabled={loading}
              className="bg-red-600 hover:bg-red-700 text-white font-semibold px-6 py-2 rounded-xl shadow-md transition-all duration-200"
            >
              {loading ? "Withdrawing..." : "Withdraw Request"}
            </Button>
          ) : (
            <Button
              onClick={() => handleFriendRequest(usermId)}
              disabled={loading}
              className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-2 rounded-xl shadow-md transition-all duration-200"
            >
              {loading ? "Sending..." : "Send Friend Request"}
            </Button>
          )
        )}

        <p className="text-gray-400">
          <span className="font-medium">Joined:</span> {formattedDate}
        </p>

        {isOwnProfile && (
          <button
            onClick={() => router.push("/uploadpfp")}
            className="mt-4 bg-gradient-to-r from-cyan-500 to-blue-600 px-5 py-2 rounded-full font-semibold shadow-lg hover:from-cyan-600 hover:to-blue-700 transition duration-300"
          >
            Change Profile Image
          </button>
        )}
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
        className="bg-[#2a2a40] rounded-2xl p-6 shadow-lg"
      >
        <h3 className="text-xl font-bold mb-4 border-b border-gray-600 pb-2 text-center">Posts</h3>
        {posts.length === 0 ? (
          <p className="text-center text-gray-400">No posts yet.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {posts.map((post) => (
              <motion.div
                key={post._id}
                whileHover={{ scale: 1.02 }}
                className="bg-[#1e1e2f] rounded-lg p-4 shadow-md"
              >
                <div className="relative w-full aspect-video rounded-xl overflow-hidden border border-white/10 shadow-inner">
                  <Carousel className="w-full">
                    <CarouselContent className="-ml-4">
                      {post.imageUrl.map((url, idx) => (
                        <CarouselItem key={idx} className="relative pl-4 basis-full">
                          {url.endsWith(".mp4") ? (
                            <video
                              className="w-full h-48 object-cover rounded-xl"
                              controls
                            >
                              <source src={url} type="video/mp4" />
                            </video>
                          ) : (
                            <div className="relative w-full h-48">
                              <img
                                src={url}
                                alt={`media-${idx}`}
                                className="w-full h-48 object-cover rounded-xl"
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
                <p className="text-sm text-gray-300 mt-2">{post.caption}</p>
                <p className="text-xs text-gray-500 text-right mt-1">
                  {new Date(post.createdAt || "").toLocaleDateString("en-IN", {
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                  })}
                </p>
              </motion.div>
            ))}
          </div>
        )}
      </motion.div>
    </motion.div>
  );
}
