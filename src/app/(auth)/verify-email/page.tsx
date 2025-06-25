"use client";

import { useSignUp } from "@clerk/nextjs";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function VerifyEmailPage() {
  const { signUp, setActive, isLoaded } = useSignUp();
  const router = useRouter();
  const [otpCode, setOtpCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isLoaded) return;
    setLoading(true);
    setError(null);
    try {
      const result = await signUp.attemptEmailAddressVerification({
        code: otpCode,
      });

      if (result.status === "complete") {
        await setActive({ session: result.createdSessionId });
        await fetch("/api/createuser");
        router.push("/");
      }
    } catch (err: any) {
      setError(err?.errors?.[0]?.longMessage || "Invalid code.");
    } finally {
      setLoading(false);
    }
  };
  return (
    <div className="flex items-center justify-center min-h-screen">
      <form
        onSubmit={handleVerify}
        className="w-full max-w-sm p-8 space-y-6 rounded-xl bg-white/5 border border-white/10 backdrop-blur-md shadow-2xl"
      >
        <h2 className="text-2xl font-bold text-center text-white">
          Verify Your Email
        </h2>

        <div>
          <label className="block text-sm text-gray-300 mb-2">
            Enter OTP sent to your email
          </label>
          <Input
            type="text"
            value={otpCode}
            onChange={(e) => setOtpCode(e.target.value)}
            placeholder="123456"
            required
            className="text-white placeholder:text-gray-400"
          />
        </div>

        {error && <p className="text-sm text-red-400">{error}</p>}

        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? "Verifying..." : "Verify Email"}
        </Button>

        <p className="text-sm text-center text-gray-400">
          Didn’t receive the code?{" "}
          <span className="text-cyan-400">Check your spam folder</span>
        </p>
      </form>
    </div>
  );
}
