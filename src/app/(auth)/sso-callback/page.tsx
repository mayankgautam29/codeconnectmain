"use client";
import { useEffect } from "react";
import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import axios from "axios";
import { AuthenticateWithRedirectCallback } from "@clerk/nextjs";

export default function SSOCallback() {
  const { user, isLoaded } = useUser();
  const router = useRouter();

  useEffect(() => {
    if (!isLoaded) return;
    if (!user) {
      router.replace("/sign-in");
      return;
    }
    (async () => {
      if (!user.username) {
        router.replace("/setusername");
      } else {
        await axios.get("/api/createuser");
        router.replace("/");
      }
    })();
  }, [isLoaded, user, router]);

  return <AuthenticateWithRedirectCallback />;
}
