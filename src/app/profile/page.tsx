"use client";

import axios from "axios";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { MediaViewer } from "@/components/MediaViewer";
import { formatRelativeTime } from "@/lib/time";
import { MessageCircle, UserPlus, Users, Camera } from "lucide-react";

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

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Profile card */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card p-6 md:p-8 text-center"
      >
        {user?.profileImg && (
          <div className="relative inline-block mb-4">
            <Image
              src={user.profileImg}
              alt={user.username}
              width={112}
              height={112}
              className="rounded-full border-4 border-white/15 ring-4 ring-cyan-400/10 object-cover"
            />
          </div>
        )}
        <h2 className="text-2xl font-bold text-white">{user?.username}</h2>
        <p className="text-sm text-white/45 mt-1">{user?.email}</p>
        {user?.createdAt && (
          <p className="text-xs text-white/35 mt-2">
            Joined {formatRelativeTime(user.createdAt)}
          </p>
        )}
        <button
          onClick={() => router.push("/uploadpfp")}
          className="mt-5 inline-flex items-center gap-2 text-sm font-medium px-5 py-2.5 rounded-xl bg-white/[0.06] border border-white/10 text-white/80 hover:bg-white/10 hover:text-white transition"
        >
          <Camera size={16} />
          Change photo
        </button>
      </motion.div>

      {/* Friend requests */}
      {requests.length > 0 && (
        <div className="glass-card p-5">
          <div className="flex items-center gap-2 mb-4">
            <UserPlus size={18} className="text-cyan-300" />
            <h3 className="font-semibold text-white">Friend Requests</h3>
            <span className="ml-auto text-xs bg-rose-500/20 text-rose-300 px-2 py-0.5 rounded-full">
              {requests.length}
            </span>
          </div>
          <div className="space-y-3">
            {requests.map((request) => (
              <div
                key={request._id}
                className="flex items-center justify-between gap-3 p-3 rounded-xl bg-white/[0.03] border border-white/[0.06]"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <Image
                    src={request.reqBy?.profileImg || "/default-avatar.png"}
                    alt=""
                    width={40}
                    height={40}
                    className="rounded-full object-cover shrink-0"
                  />
                  <p className="font-medium text-white truncate">{request.reqBy?.username}</p>
                </div>
                <div className="flex gap-2 shrink-0">
                  <Button
                    size="sm"
                    onClick={() => handleAction(request._id!, "accepted")}
                    className="rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white h-8 px-3 text-xs"
                  >
                    Accept
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleAction(request._id!, "rejected")}
                    className="rounded-lg text-white/50 hover:text-rose-300 hover:bg-rose-500/10 h-8 px-3 text-xs"
                  >
                    Decline
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Friends */}
      {user?.friends && user.friends.length > 0 && (
        <div className="glass-card p-5">
          <div className="flex items-center gap-2 mb-4">
            <Users size={18} className="text-cyan-300" />
            <h3 className="font-semibold text-white">Friends</h3>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {user.friends.map((friend) => (
              <div
                key={friend._id}
                className="flex items-center justify-between gap-2 p-3 rounded-xl bg-white/[0.03] border border-white/[0.06]"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <Image
                    src={friend.profileImg || ""}
                    alt={friend.username}
                    width={36}
                    height={36}
                    className="rounded-full object-cover shrink-0"
                  />
                  <span className="text-sm font-medium text-white truncate">{friend.username}</span>
                </div>
                <Link
                  href={`/messages/${friend.userId}`}
                  className="shrink-0 flex items-center gap-1 text-xs text-cyan-300 hover:text-cyan-200 px-2.5 py-1.5 rounded-lg hover:bg-cyan-400/10 transition"
                >
                  <MessageCircle size={14} />
                  Chat
                </Link>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Posts grid */}
      <div className="glass-card p-5">
        <h3 className="font-semibold text-white mb-4">Your Posts</h3>
        {posts.length === 0 ? (
          <div className="text-center py-10">
            <p className="text-white/40 text-sm mb-4">No posts yet</p>
            <Button
              onClick={() => router.push("/create-post")}
              className="rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:brightness-110"
            >
              Create your first post
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {posts.map((post) => (
              <div key={post._id} className="rounded-xl overflow-hidden border border-white/[0.06] bg-white/[0.02]">
                <MediaViewer urls={post.imageUrl} alt={post.caption} variant="grid" />
                {post.caption && (
                  <p className="text-xs text-white/70 px-3 py-2 line-clamp-2">{post.caption}</p>
                )}
                {post.createdAt && (
                  <p className="text-[10px] text-white/35 px-3 pb-2 text-right">
                    {formatRelativeTime(post.createdAt)}
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
