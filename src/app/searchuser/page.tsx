"use client";

import { useEffect, useState, useCallback } from "react";
import axios from "axios";
import Image from "next/image";
import Link from "next/link";
import { Search, UserRound } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

interface User {
  _id: string;
  username: string;
  email: string;
  profileImg: string;
}

export default function SearchUserPage() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  const handleSearch = useCallback(async (q: string) => {
    if (!q.trim() || q.trim().length < 2) {
      setResults([]);
      setSearched(false);
      return;
    }
    setLoading(true);
    setSearched(true);
    try {
      const res = await axios.get(`/api/searchuser?q=${encodeURIComponent(q)}`);
      setResults(res.data.users);
    } catch (error) {
      console.error("Search failed", error);
      setResults([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => handleSearch(query), 400);
    return () => clearTimeout(timer);
  }, [query, handleSearch]);

  return (
    <div className="max-w-lg mx-auto">
      <div className="relative mb-6">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-white/40" />
        <input
          type="text"
          placeholder="Search by username or email..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="w-full pl-11 pr-4 py-3.5 text-sm rounded-xl bg-white/[0.04] border border-white/[0.08] text-white placeholder:text-white/35 focus:outline-none focus:border-cyan-400/30 focus:ring-1 focus:ring-cyan-400/15 transition"
        />
      </div>

      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="flex items-center gap-4 p-4 rounded-2xl border border-white/10 bg-white/[0.04]"
            >
              <Skeleton className="size-12 rounded-full bg-white/10" />
              <div className="space-y-2 flex-1">
                <Skeleton className="h-4 w-32 bg-white/10" />
                <Skeleton className="h-3 w-48 bg-white/10" />
              </div>
            </div>
          ))}
        </div>
      ) : results.length > 0 ? (
        <ul className="space-y-3">
          {results.map((user) => (
            <li key={user._id}>
              <Link
                href={`/profile/${user._id}`}
                className="flex items-center gap-4 p-3.5 rounded-xl glass-card hover:border-cyan-400/20 transition group"
              >
                <Image
                  src={user.profileImg}
                  alt={user.username}
                  width={48}
                  height={48}
                  className="rounded-full object-cover border border-white/15"
                />
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-white group-hover:text-cyan-100 transition">
                    {user.username}
                  </p>
                  <p className="text-xs text-white/45 truncate">{user.email}</p>
                </div>
                <UserRound className="size-4 text-white/30 group-hover:text-cyan-300/70 transition" />
              </Link>
            </li>
          ))}
        </ul>
      ) : (
        searched &&
        query.length >= 2 && (
          <p className="text-center text-white/45 py-12">
            No users found for &ldquo;{query}&rdquo;
          </p>
        )
      )}

      {!searched && !query && (
        <p className="text-center text-white/35 text-sm py-12">
          Start typing to search the community
        </p>
      )}
    </div>
  );
}
