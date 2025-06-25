"use client";

import { useSignIn } from "@clerk/nextjs";
import { useState } from "react";

export default function CustomSignInPage() {
  const { signIn, setActive, isLoaded } = useSignIn();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isLoaded) return;

    setLoading(true);
    setError(null);

    try {
      const result = await signIn.create({ identifier: email, password });

      if (result.status === "complete") {
        await setActive({ session: result.createdSessionId });
        window.location.href = "/";
      } else {
        console.log("Incomplete sign-in:", result);
      }
    } catch (err: any) {
      setError(err.errors?.[0]?.longMessage || "Invalid credentials.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center h-screen">
      <div className="w-full max-w-md p-8 space-y-6 rounded-xl bg-white/5 border border-white/10 backdrop-blur-lg shadow-xl">
        <h2 className="text-3xl font-bold text-white text-center">Sign In</h2>

        <form onSubmit={handleSignIn} className="space-y-4">
          <div>
            <label className="block text-sm text-gray-300">Email</label>
            <input
              type="email"
              className="w-full px-4 py-2 rounded-lg bg-gray-800 text-white border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="block text-sm text-gray-300">Password</label>
            <input
              type="password"
              className="w-full px-4 py-2 rounded-lg bg-gray-800 text-white border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          {error && <p className="text-red-400 text-sm">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition duration-200"
          >
            {loading ? "Signing in..." : "Sign In"}
          </button>
        </form>

        <div className="text-center text-sm text-gray-400">
          Don’t have an account?{" "}
          <a
            href="/sign-up"
            className="text-blue-500 hover:underline hover:text-blue-400"
          >
            Sign Up
          </a>
        </div>
      </div>
    </div>
  );
}
