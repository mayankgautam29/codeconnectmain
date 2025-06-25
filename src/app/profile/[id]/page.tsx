"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@clerk/nextjs";
import { useParams } from "next/navigation";
import ProfilePg from "@/components/profilepage";

export default function ProfileIdPage() {
  const { userId } = useAuth();
  const { id } = useParams();

  const [clerkId, setClerkId] = useState<string | null>(null);

  useEffect(() => {
    if (userId) setClerkId(userId);
  }, [userId]);
  if (!id || typeof id !== "string") return <div>Invalid ID</div>;

  return (
    <ProfilePg
      usermId={id}
      clerkId={clerkId}
    />
  );
}
