import { auth } from "@clerk/nextjs/server";
import ProfilePg from "@/components/profilepage"; // already a "use client" component

interface ProfilePageProps {
  params: {
    id: string;
  };
}

export default async function ProfileIdPage({ params }: ProfilePageProps) {
  const { userId } = await auth();
  const clerkId = userId ?? null;

  return (
    <ProfilePg
      usermId={params.id}
      clerkId={clerkId}
    />
  );
}
