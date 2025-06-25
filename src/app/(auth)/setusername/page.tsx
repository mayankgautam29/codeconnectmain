"use client";

import { useEffect, useState } from "react";
import { useUser, useClerk } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import axios from "axios";

export default function SetUsernamePage() {
  const { user, isLoaded } = useUser();
  const { signOut } = useClerk();
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isLoaded && user && user.username) {
      router.push("/"); // Already has username, skip this page
    }
  }, [isLoaded, user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim()) return setError("Username cannot be empty");

    try {
      setLoading(true);
      // Update Clerk profile
      await user?.update({ username });

      // Save to your own DB
      await axios.get("/api/createuser");

      router.push("/");
    } catch (err) {
      setError("Failed to set username");
    } finally {
      setLoading(false);
    }
  };

  if (!isLoaded) return null;

  return (
    <div className="h-screen flex justify-center items-center px-4">
      <div className="max-w-md w-full bg-zinc-900 p-6 rounded-xl shadow-xl border border-white/10 text-white space-y-6">
        <h2 className="text-2xl font-bold text-center">Set your username</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            placeholder="Enter a username"
            className="w-full px-4 py-2 rounded-lg bg-gray-800 border border-gray-700 focus:outline-none"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
          {error && <p className="text-red-500 text-sm">{error}</p>}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition"
          >
            {loading ? "Saving..." : "Continue"}
          </button>
        </form>
        <button
          onClick={() => signOut(() => router.push("/sign-in"))}
          className="text-sm text-red-400 hover:underline mt-2 block text-center"
        >
          Cancel and Sign Out
        </button>
      </div>
    </div>
  );
}
