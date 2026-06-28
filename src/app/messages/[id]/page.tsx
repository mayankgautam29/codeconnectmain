"use client";

import { useEffect, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "@clerk/nextjs";
import { io, Socket } from "socket.io-client";
import axios from "axios";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, Send } from "lucide-react";
import { formatRelativeTime } from "@/lib/time";
import { cn } from "@/lib/utils";

type Message = {
  text: string;
  sender: string;
  time: string;
};

type TargetUser = {
  username: string;
  profileImg: string;
};

function getRoomId(userA: string, userB: string) {
  return [userA, userB].sort().join("_");
}

export default function MessagePage() {
  const { id: targetUserId } = useParams();
  const { userId } = useAuth();
  const router = useRouter();
  const [messages, setMessages] = useState<Message[]>([]);
  const [message, setMessage] = useState("");
  const [targetUserInfo, setTargetUserInfo] = useState<TargetUser | null>(null);
  const socketRef = useRef<Socket | null>(null);
  const messageEndRef = useRef<HTMLDivElement>(null);

  const roomId =
    typeof targetUserId === "string" && userId ? getRoomId(userId, targetUserId) : "";

  useEffect(() => {
    const fetchPreviousMessages = async () => {
      if (!userId || typeof targetUserId !== "string") return;
      try {
        const res = await axios.post("/api/getmessagesbetween", { targetUserId });
        const prevMessages = res.data.messages.map((msg: { text: string; senderId: string; time: string }) => ({
          text: msg.text,
          sender: msg.senderId === userId ? "you" : res.data.targetUser?.username || msg.senderId,
          time: msg.time,
        }));
        setMessages(prevMessages);
        setTargetUserInfo(res.data.targetUser || null);
      } catch (error) {
        console.error("Failed to load previous messages:", error);
      }
    };
    fetchPreviousMessages();
  }, [userId, targetUserId]);

  useEffect(() => {
    if (!roomId || !userId || typeof targetUserId !== "string") return;

    const socket = io("https://codeconnectserver1.onrender.com", {
      transports: ["websocket"],
      withCredentials: true,
    });
    socketRef.current = socket;

    socket.on("connect", () => socket.emit("joinRoom", roomId));

    socket.on("receiveMessage", ({ text, sender, time }) => {
      const validTime = time && !isNaN(new Date(time).getTime()) ? time : new Date().toISOString();
      setMessages((prev) => [
        ...prev,
        {
          text,
          sender: sender === userId ? "you" : targetUserInfo?.username || sender,
          time: validTime,
        },
      ]);
    });

    return () => { socket.disconnect(); };
  }, [roomId, userId, targetUserId, targetUserInfo]);

  const handleSend = () => {
    if (!message.trim() || !socketRef.current || !roomId || !userId || typeof targetUserId !== "string") return;
    socketRef.current.emit("sendMessage", {
      roomId,
      message: message.trim(),
      sender: userId,
      receiver: targetUserId,
    });
    setMessage("");
  };

  useEffect(() => {
    messageEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <div className="max-w-lg mx-auto flex flex-col h-[calc(100vh-10rem)] md:h-[calc(100vh-8rem)]">
      {/* Chat header */}
      <div className="glass-card flex items-center gap-3 px-4 py-3 mb-3 shrink-0">
        <button
          onClick={() => router.push("/messages")}
          className="size-9 grid place-items-center rounded-lg text-white/50 hover:text-white hover:bg-white/[0.06] transition"
        >
          <ArrowLeft size={18} />
        </button>
        {targetUserInfo && (
          <>
            <Image
              src={targetUserInfo.profileImg}
              alt={targetUserInfo.username}
              width={40}
              height={40}
              className="rounded-full border border-white/15 object-cover"
            />
            <div className="min-w-0">
              <p className="font-semibold text-white truncate">{targetUserInfo.username}</p>
              <p className="text-[11px] text-emerald-400/80">Online</p>
            </div>
          </>
        )}
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto glass-card p-4 mb-3 space-y-3 scrollbar-thin">
        {messages.length === 0 && (
          <p className="text-center text-white/35 text-sm py-12">
            Say hello to start the conversation
          </p>
        )}
        {messages.map((msg, i) => {
          const isYou = msg.sender === "you";
          return (
            <div key={i} className={cn("flex", isYou ? "justify-end" : "justify-start")}>
              <div
                className={cn(
                  "max-w-[78%] px-3.5 py-2.5 rounded-2xl text-sm",
                  isYou
                    ? "bg-gradient-to-br from-cyan-600 to-blue-600 text-white rounded-br-md"
                    : "bg-white/[0.07] text-white/90 border border-white/[0.06] rounded-bl-md"
                )}
              >
                <p className="whitespace-pre-wrap leading-relaxed">{msg.text}</p>
                <p className={cn("text-[10px] mt-1 text-right", isYou ? "text-white/60" : "text-white/35")}>
                  {formatRelativeTime(msg.time)}
                </p>
              </div>
            </div>
          );
        })}
        <div ref={messageEndRef} />
      </div>

      {/* Input */}
      <div className="glass-card flex items-center gap-2 p-2 shrink-0">
        <input
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSend()}
          placeholder="Type a message..."
          className="flex-1 bg-transparent px-3 py-2.5 text-sm text-white placeholder:text-white/35 focus:outline-none"
        />
        <button
          onClick={handleSend}
          disabled={!message.trim()}
          className="size-10 grid place-items-center rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-white disabled:opacity-40 hover:brightness-110 transition shrink-0"
        >
          <Send size={16} />
        </button>
      </div>
    </div>
  );
}
