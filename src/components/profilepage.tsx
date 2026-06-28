"use client";

import axios from "axios";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { motion } from "framer-motion";
import { Button } from "./ui/button";
import { MediaViewer } from "@/components/MediaViewer";
import { formatRelativeTime } from "@/lib/time";
import { UserCheck, UserPlus, UserMinus } from "lucide-react";

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
  }, [usermId, clerkId, router]);

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

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-2xl mx-auto space-y-6"
    >
      <div className="glass-card p-6 md:p-8 text-center">
        {user?.profileImg && (
          <Image
            src={user.profileImg}
            alt={user.username}
            width={112}
            height={112}
            className="rounded-full border-4 border-white/15 ring-4 ring-cyan-400/10 object-cover mx-auto mb-4"
          />
        )}
        <h2 className="text-2xl font-bold text-white">{user?.username}</h2>
        {user?.createdAt && (
          <p className="text-xs text-white/40 mt-2">
            Joined {formatRelativeTime(user.createdAt)}
          </p>
        )}

        {!isOwnProfile && (
          <div className="mt-5">
            {requestStatus === "friends" ? (
              <span className="inline-flex items-center gap-2 text-sm text-emerald-400 bg-emerald-500/10 px-4 py-2 rounded-xl">
                <UserCheck size={16} />
                Friends
              </span>
            ) : requestStatus === "pending" ? (
              <Button
                onClick={() => handleWithdrawRequest(usermId)}
                disabled={loading}
                variant="ghost"
                className="rounded-xl text-white/60 hover:text-rose-300 hover:bg-rose-500/10"
              >
                <UserMinus size={16} className="mr-2" />
                {loading ? "Withdrawing..." : "Withdraw Request"}
              </Button>
            ) : (
              <Button
                onClick={() => handleFriendRequest(usermId)}
                disabled={loading}
                className="rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:brightness-110"
              >
                <UserPlus size={16} className="mr-2" />
                {loading ? "Sending..." : "Add Friend"}
              </Button>
            )}
          </div>
        )}
      </div>

      <div className="glass-card p-5">
        <h3 className="font-semibold text-white mb-4">Posts</h3>
        {posts.length === 0 ? (
          <p className="text-center text-white/40 text-sm py-8">No posts yet.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {posts.map((post) => (
              <div
                key={post._id}
                className="rounded-xl overflow-hidden border border-white/[0.06] bg-white/[0.02]"
              >
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
    </motion.div>
  );
}
