"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { Users, ImageIcon, MessageSquare } from "lucide-react";

type Stats = {
  users: number;
  posts: number;
  messages: number;
};

export function StatsBar() {
  const [stats, setStats] = useState<Stats | null>(null);

  useEffect(() => {
    axios.get("/api/stats").then((res) => setStats(res.data)).catch(() => {});
  }, []);

  if (!stats) return null;

  const items = [
    { label: "Builders", value: stats.users, icon: Users },
    { label: "Posts", value: stats.posts, icon: ImageIcon },
    { label: "Messages", value: stats.messages, icon: MessageSquare },
  ];

  return (
    <div className="grid grid-cols-3 gap-2.5 mb-6">
      {items.map(({ label, value, icon: Icon }) => (
        <div
          key={label}
          className="glass-card px-3 py-3 text-center"
        >
          <Icon className="size-4 mx-auto mb-1.5 text-cyan-300/80" />
          <p className="text-lg font-semibold text-white">{value.toLocaleString()}</p>
          <p className="text-[11px] uppercase tracking-wider text-white/50">{label}</p>
        </div>
      ))}
    </div>
  );
}
