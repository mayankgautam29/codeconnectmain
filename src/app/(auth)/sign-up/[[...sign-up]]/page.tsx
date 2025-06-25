"use client";

import { useSignUp } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { useState } from "react";
import axios from "axios";

export default function CustomSignUpPage() {
  const { signUp, setActive, isLoaded } = useSignUp();
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isLoaded) return;

    setLoading(true);
    setError(null);

    try {
      const result = await signUp.create({
        emailAddress: email,
        password,
        username,
      });

      if (result.status === "complete") {
        await setActive({ session: result.createdSessionId });
        await axios.get("/api/createuser");
        router.push("/");
      } else {
        await signUp.prepareEmailAddressVerification({
          strategy: "email_code",
        });
        router.push("/verify-email");
      }
    } catch (err: any) {
      setError(err.errors?.[0]?.longMessage || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center h-screen">
      <div className="w-full max-w-md p-8 space-y-6 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-lg shadow-2xl">
        <h2 className="text-3xl font-bold text-white text-center">
          Create an Account
        </h2>

        <form onSubmit={handleSignUp} className="space-y-4">
          <input
            type="text"
            placeholder="Username"
            className="w-full px-4 py-2 rounded-lg bg-gray-900 text-white border border-gray-700 focus:outline-none focus:ring-2 focus:ring-cyan-500"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
          <input
            type="email"
            placeholder="Email"
            className="w-full px-4 py-2 rounded-lg bg-gray-900 text-white border border-gray-700 focus:outline-none focus:ring-2 focus:ring-cyan-500"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="Password"
            className="w-full px-4 py-2 rounded-lg bg-gray-900 text-white border border-gray-700 focus:outline-none focus:ring-2 focus:ring-cyan-500"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          {/* Fake CAPTCHA for Clerk */}
          <div id="clerk-captcha" style={{ display: "none" }} />

          {error && <p className="text-red-400 text-sm">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2 bg-cyan-600 hover:bg-cyan-700 text-white font-semibold rounded-lg transition duration-200"
          >
            {loading ? "Signing up..." : "Sign Up"}
          </button>
        </form>

        <p className="text-center text-sm text-gray-400">
          Already have an account?{" "}
          <a href="/sign-in" className="text-cyan-400 hover:underline">
            Sign In
          </a>
        </p>
      </div>
    </div>
  );
}
