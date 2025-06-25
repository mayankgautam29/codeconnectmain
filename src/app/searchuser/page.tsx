"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import Image from "next/image";
import Link from "next/link";

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

  const handleSearch = async () => {
    if (!query.trim()) return;
    setLoading(true);
    try {
      const res = await axios.get(`/api/searchuser?q=${query}`);
      setResults(res.data.users);
    } catch (error) {
      console.error("Search failed", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-10 text-white">
      <h1 className="text-3xl font-bold mb-6 text-center">Search Users</h1>
      <div className="flex gap-2 mb-6">
        <input
          type="text"
          placeholder="Search by username or email"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSearch()}
          className="flex-1 px-4 py-2 text-sm rounded bg-zinc-800 border border-zinc-600 focus:outline-none"
        />
        <button
          onClick={handleSearch}
          className="bg-purple-600 hover:bg-purple-700 px-4 py-2 rounded text-white"
        >
          {loading ? "Searching..." : "Search"}
        </button>
      </div>

      {results.length > 0 ? (
        <ul className="space-y-4">
          {results.map((user) => (
            <li
              key={user._id}
              className="flex items-center gap-4 p-3 bg-zinc-900 border border-zinc-700 rounded-lg"
            >
              <Image
                src={user.profileImg}
                alt={user.username}
                width={50}
                height={50}
                className="rounded-full object-cover"
              />
              <div>
                <p className="font-semibold">{user.username}</p>
                <Link
                  href={`/profile/${user._id}`}
                  className="text-xs text-purple-400 underline"
                >
                  View Profile
                </Link>
              </div>
            </li>
          ))}
        </ul>
      ) : (
        !loading &&
        query && (
          <p className="text-center text-gray-400">No users found.</p>
        )
      )}
    </div>
  );
}
