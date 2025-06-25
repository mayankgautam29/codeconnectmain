"use client";

import axios from "axios";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselPrevious,
  CarouselNext,
} from "@/components/ui/carousel";

interface User {
  _id?: string;
  userId: string;
  username: string;
  email: string;
  createdAt?: string;
  profileImg?: string;
  friends?: User[];
}

interface Post {
  _id?: string;
  imageUrl: string[];
  caption: string;
  createdAt?: string | Date;
}

interface Request {
  _id?: string;
  reqBy: User;
  reqTo: string;
  status: "pending" | "accepted" | "rejected";
}

export default function ProfilePage() {
  const [user, setUser] = useState<User | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [requests, setRequests] = useState<Request[]>([]);
  const router = useRouter();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [profileRes, requestRes] = await Promise.all([
          axios.get("/api/profile"),
          axios.get("/api/requestshow"),
        ]);
        setUser(profileRes.data.userData);
        setPosts(profileRes.data.posts);
        setRequests(
          (requestRes.data.requests || []).filter((r: Request) => r.status === "pending")
        );
      } catch (error) {
        console.error("Failed to load profile data:", error);
      }
    };
    fetchData();
  }, []);

  const handleAction = async (requestId: string, action: "accepted" | "rejected") => {
    try {
      await axios.patch("/api/updaterequest", { requestId, action });
      setRequests((prev) => prev.filter((r) => r._id !== requestId));
    } catch (err) {
      console.error(`Failed to ${action} request`, err);
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
      {user && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="bg-gradient-to-br from-[#1e1e2f] to-[#2a2a40] rounded-2xl p-8 shadow-xl text-center space-y-4"
        >
          <Link href={`/profile/${user._id}`} className="inline-block hover:opacity-90 transition">
            <img
              src={user.profileImg}
              alt="Profile"
              className="w-36 h-36 mx-auto rounded-full border-4 border-white shadow-md object-cover"
            />
            <h2 className="mt-4 text-2xl font-bold">{user.username}</h2>
          </Link>
          <p className="text-gray-400"><span className="font-medium">Email:</span> {user.email}</p>
          <p className="text-gray-400"><span className="font-medium">Joined:</span> {formattedDate}</p>
          <button
            onClick={() => router.push("/uploadpfp")}
            className="mt-4 bg-gradient-to-r from-cyan-500 to-blue-600 px-5 py-2 rounded-full font-semibold shadow-lg hover:from-cyan-600 hover:to-blue-700 transition duration-300"
          >
            Change Profile Image
          </button>
        </motion.div>
      )}

      {user?.friends?.length! > 0 && (
        <motion.div className="bg-[#2a2a40] rounded-2xl p-6 shadow-lg">
          <h3 className="text-xl font-bold mb-4 border-b border-gray-600 pb-2 text-center">Your Friends</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {user?.friends!.map((friend) => (
              <div key={friend._id} className="flex items-center justify-between bg-[#1e1e2f] p-3 rounded-lg shadow-md">
                <div className="flex items-center gap-3">
                  <img src={friend.profileImg} alt={friend.username} className="w-12 h-12 rounded-full object-cover border border-white" />
                  <p className="font-semibold">{friend.username}</p>
                </div>
                <button onClick={() => router.push(`/messages/${friend.userId}`)} className="bg-purple-600 hover:bg-purple-700 text-white text-sm px-3 py-1 rounded-md">
                  Chat
                </button>
              </div>
            ))}
          </div>
        </motion.div>
      )}
      {requests.length > 0 && (
        <motion.div className="bg-[#2a2a40] rounded-2xl p-6 shadow-lg">
          <h3 className="text-xl font-bold mb-4 border-b border-gray-600 pb-2 text-center">Friend Requests</h3>
          <div className="space-y-4">
            {requests.map((request) => (
              <div key={request._id} className="bg-[#1e1e2f] rounded-lg p-4 shadow-md flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <img src={request.reqBy?.profileImg || "/default-avatar.png"} alt="Sender" className="w-12 h-12 rounded-full object-cover border border-white" />
                  <p className="font-semibold">{request.reqBy?.username}</p>
                </div>
                <div className="flex flex-col gap-2">
                  <button onClick={() => handleAction(request._id!, "accepted")} className="px-3 py-1 bg-green-600 hover:bg-green-700 rounded-md text-white text-sm">
                    Accept
                  </button>
                  <button onClick={() => handleAction(request._id!, "rejected")} className="px-3 py-1 bg-red-600 hover:bg-red-700 rounded-md text-white text-sm">
                    Reject
                  </button>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      <motion.div className="bg-[#2a2a40] rounded-2xl p-6 shadow-lg">
        <h3 className="text-xl font-bold mb-4 border-b border-gray-600 pb-2 text-center">Your Posts</h3>
        {posts.length === 0 ? (
          <p className="text-center text-gray-400">You haven't posted anything yet.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {posts.map((post) => (
              <motion.div key={post._id} whileHover={{ scale: 1.02 }} className="bg-[#1e1e2f] rounded-lg p-4 shadow-md">
                <Carousel className="relative w-full">
                  <CarouselContent>
                    {post.imageUrl.map((url, idx) => (
                      <CarouselItem key={idx} className="relative h-48 w-full">
                        {url.endsWith(".mp4") ? (
                          <video controls className="w-full h-full object-cover rounded-lg">
                            <source src={url} type="video/mp4" />
                          </video>
                        ) : (
                          <img src={url} alt={`media-${idx}`} className="w-full h-full object-cover rounded-lg" />
                        )}
                      </CarouselItem>
                    ))}
                  </CarouselContent>
                  <CarouselPrevious className="absolute top-1/2 left-2 z-10" />
                  <CarouselNext className="absolute top-1/2 right-2 z-10" />
                </Carousel>
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
