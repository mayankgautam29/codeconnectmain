"use client";

import axios from "axios";
import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";
import { useAuth } from "@clerk/nextjs";

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
        const combinedList = Object.entries(latestByUser).map(
          ([uid, lastMessage]) => ({
            userId: uid,
            lastMessage,
          })
        );
        setCombinedMessages(combinedList);
        setUserMap(res.data.userMap || {});
      } catch (error) {
        console.error("Failed to fetch messages:", error);
      }
    };
    getMessages();
  }, [userId]);

  return (
    <div className="p-4 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">💬 Conversations</h1>

      {combinedMessages.length > 0 ? (
        <ul className="space-y-4">
          {combinedMessages.map(({ userId: otherId, lastMessage }) => {
            const user = userMap[otherId];
            return (
              <li
                key={otherId}
                className="flex items-center justify-between border border-zinc-700 dark:border-zinc-600 rounded-lg p-3 bg-zinc-800 hover:bg-zinc-700 transition"
              >
                <Link
                  href={`/messages/${otherId}`}
                  className="flex items-center gap-4 w-full"
                >
                  <Image
                    src={
                      user?.profileImg ||
                      "https://res.cloudinary.com/dguqpdnw6/image/upload/v1750306565/codeconnect/vpprdbsn4uxjfygao27v.png"
                    }
                    alt={user?.username || otherId}
                    width={48}
                    height={48}
                    className="rounded-full"
                  />
                  <div className="flex flex-col">
                    <span className="font-semibold text-white text-lg">
                      {user?.username || otherId}
                    </span>
                    <span className="text-gray-300 text-sm truncate max-w-[250px]">
                      {lastMessage.text}
                    </span>
                  </div>
                  <span className="ml-auto text-xs text-gray-400">
                    {new Date(lastMessage.time).toLocaleTimeString()}
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      ) : (
        <p className="text-gray-400">No messages found.</p>
      )}
    </div>
  );
}
