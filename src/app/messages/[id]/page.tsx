"use client";

import { useEffect, useRef, useState } from "react";
import { useParams } from "next/navigation";
import { useAuth } from "@clerk/nextjs";
import { io, Socket } from "socket.io-client";
import axios from "axios";
import Image from "next/image";

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
  const [messages, setMessages] = useState<Message[]>([]);
  const [message, setMessage] = useState("");
  const [targetUserInfo, setTargetUserInfo] = useState<TargetUser | null>(null);
  const socketRef = useRef<Socket | null>(null);
  const messageEndRef = useRef<HTMLDivElement>(null);

  const roomId =
    typeof targetUserId === "string" && userId
      ? getRoomId(userId, targetUserId)
      : "";
  useEffect(() => {
    const fetchPreviousMessages = async () => {
      if (!userId || typeof targetUserId !== "string") return;

      try {
        const res = await axios.post("/api/getmessagesbetween", {
          targetUserId,
        });
        const prevMessages = res.data.messages.map((msg: any) => ({
          text: msg.text,
          sender:
            msg.senderId === userId
              ? "you"
              : res.data.targetUser?.username || msg.senderId,
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

  //socket
  useEffect(() => {
    if (!roomId || !userId || typeof targetUserId !== "string") return;

    const socket = io("https://codeconnectserver1.onrender.com", {
      transports: ["websocket"],
      withCredentials: true,
    });

    socketRef.current = socket;

    socket.on("connect", () => {
      socket.emit("joinRoom", roomId);
    });

    socket.on("receiveMessage", ({ text, sender, time }) => {
      const validTime =
        time && !isNaN(new Date(time).getTime())
          ? time
          : new Date().toISOString();

      setMessages((prev) => [
        ...prev,
        {
          text,
          sender:
            sender === userId ? "you" : targetUserInfo?.username || sender,
          time: validTime,
        },
      ]);
    });

    return () => {
      socket.disconnect();
    };
  }, [roomId, userId, targetUserId, targetUserInfo]);

  const handleSend = () => {
    if (
      !message.trim() ||
      !socketRef.current ||
      !roomId ||
      !userId ||
      typeof targetUserId !== "string"
    )
      return;

    const msgData = {
      roomId,
      message: message.trim(),
      sender: userId,
      receiver: targetUserId,
    };
    socketRef.current.emit("sendMessage", msgData);
    setMessage("");
  };
  useEffect(() => {
    messageEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <div className="p-4 max-w-xl mx-auto min-h-screen flex flex-col">
      {targetUserInfo && (
        <div className="flex items-center gap-3 mb-4">
          <Image
            src={targetUserInfo.profileImg}
            alt={targetUserInfo.username}
            width={50}
            height={50}
            className="rounded-full"
          />
          <h2 className="text-2xl font-bold text-white">
            {targetUserInfo.username}
          </h2>
        </div>
      )}

      <div className="flex-1 overflow-y-auto border border-zinc-700 rounded-lg p-4 mb-4 bg-zinc-900 space-y-3 scrollbar-thin scrollbar-thumb-zinc-700 scrollbar-track-transparent">
        {messages.map((msg, i) => (
          <div
            key={i}
            className={`flex ${
              msg.sender === "you" ? "justify-end" : "justify-start"
            }`}
          >
            <div
              className={`max-w-[70%] px-4 py-2 rounded-xl text-sm shadow-md ${
                msg.sender === "you"
                  ? "bg-purple-600 text-white rounded-br-none"
                  : "bg-zinc-800 text-gray-200 rounded-bl-none"
              }`}
            >
              <p className="whitespace-pre-wrap">{msg.text}</p>
              <p className="text-xs mt-1 text-gray-400 text-right">
                {new Date(msg.time).toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </p>
            </div>
          </div>
        ))}
        <div ref={messageEndRef} />
      </div>

      <div className="flex">
        <input
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSend()}
          placeholder="Type your message..."
          className="flex-1 px-4 py-2 rounded-l-lg bg-zinc-800 text-white border border-zinc-600 focus:outline-none"
        />
        <button
          onClick={handleSend}
          className="bg-purple-600 hover:bg-purple-700 text-white px-5 py-2 rounded-r-lg"
        >
          Send
        </button>
      </div>
    </div>
  );
}
