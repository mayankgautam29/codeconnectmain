"use client";

import axios from "axios";
import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";
import { useAuth } from "@clerk/nextjs";
import { MessageCircle, Inbox } from "lucide-react";
import { formatRelativeTime } from "@/lib/time";
import { Skeleton } from "@/components/ui/skeleton";

interface Message {
  _id: string;
  senderId: string;
  receiverId: string;
  roomId: string;
  text: string;
  time: string;
}

interface UserInfo {
  username: string;
  profileImg: string;
}

export default function MessagePage() {
  const { userId } = useAuth();
  const [combinedMessages, setCombinedMessages] = useState<
    { userId: string; lastMessage: Message }[]
  >([]);
  const [userMap, setUserMap] = useState<Record<string, UserInfo>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getMessages = async () => {
      try {
        const res = await axios.post("/api/messagepage");
        const resmsg: Message[] = res.data.resmsg || [];
        const sentmsg: Message[] = res.data.sentmsg || [];
        const allMessages = [...resmsg, ...sentmsg];
        const latestByUser: Record<string, Message> = {};
        for (const msg of allMessages) {
          const otherUser =
            msg.senderId === userId ? msg.receiverId : msg.senderId;

          if (
            !latestByUser[otherUser] ||
            new Date(msg.time) > new Date(latestByUser[otherUser].time)
          ) {
            latestByUser[otherUser] = msg;
          }
        }
        const combinedList = Object.entries(latestByUser)
          .map(([uid, lastMessage]) => ({ userId: uid, lastMessage }))
          .sort(
            (a, b) =>
              new Date(b.lastMessage.time).getTime() -
              new Date(a.lastMessage.time).getTime()
          );
        setCombinedMessages(combinedList);
        setUserMap(res.data.userMap || {});
      } catch (error) {
        console.error("Failed to fetch messages:", error);
      } finally {
        setLoading(false);
      }
    };
    if (userId) getMessages();
  }, [userId]);

  return (
    <div className="max-w-2xl mx-auto">
      <div className="flex items-center gap-3 mb-8">
        <div className="size-10 rounded-xl bg-cyan-400/15 flex items-center justify-center">
          <Inbox className="size-5 text-cyan-300" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-white">Messages</h1>
          <p className="text-white/50 text-sm">Your conversations</p>
        </div>
      </div>

      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="flex items-center gap-4 p-4 rounded-2xl border border-white/10 bg-white/[0.04]"
            >
              <Skeleton className="size-12 rounded-full bg-white/10" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-28 bg-white/10" />
                <Skeleton className="h-3 w-full bg-white/10" />
              </div>
            </div>
          ))}
        </div>
      ) : combinedMessages.length > 0 ? (
        <ul className="space-y-2">
          {combinedMessages.map(({ userId: otherId, lastMessage }) => {
            const user = userMap[otherId];
            const isSent = lastMessage.senderId === userId;
            return (
              <li key={otherId}>
                <Link
                  href={`/messages/${otherId}`}
                  className="flex items-center gap-4 p-4 rounded-2xl border border-white/10 bg-white/[0.04] hover:border-cyan-300/25 hover:bg-white/[0.06] transition group"
                >
                  <Image
                    src={
                      user?.profileImg ||
                      "https://res.cloudinary.com/dguqpdnw6/image/upload/v1750306565/codeconnect/vpprdbsn4uxjfygao27v.png"
                    }
                    alt={user?.username || otherId}
                    width={48}
                    height={48}
                    className="rounded-full border border-white/15"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-semibold text-white group-hover:text-cyan-100 transition truncate">
                        {user?.username || otherId}
                      </span>
                      <span className="text-[11px] text-white/40 shrink-0">
                        {formatRelativeTime(lastMessage.time)}
                      </span>
                    </div>
                    <p className="text-sm text-white/50 truncate mt-0.5">
                      {isSent && <span className="text-white/35">You: </span>}
                      {lastMessage.text}
                    </p>
                  </div>
                  <MessageCircle className="size-4 text-white/25 group-hover:text-cyan-300/60 transition shrink-0" />
                </Link>
              </li>
            );
          })}
        </ul>
      ) : (
        <div className="text-center py-16 rounded-2xl border border-white/10 bg-white/[0.04]">
          <MessageCircle className="size-10 mx-auto mb-3 text-white/25" />
          <p className="text-white/50">No conversations yet</p>
          <p className="text-white/35 text-sm mt-1">
            Find builders and start chatting
          </p>
          <Link
            href="/searchuser"
            className="inline-block mt-4 text-sm text-cyan-300 hover:text-cyan-200 transition"
          >
            Explore users →
          </Link>
        </div>
      )}
    </div>
  );
}
