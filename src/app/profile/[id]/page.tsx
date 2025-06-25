import { auth } from "@clerk/nextjs/server";
import dynamic from "next/dynamic";

const ProfilePg = dynamic(() => import("@/components/profilepage"), { ssr: false });

interface ProfilePageProps {
  params: {
    id: string;
  };
}

export default async function ProfileIdPage({ params }: ProfilePageProps) {
  const { userId } = await auth();
  return <ProfilePg usermId={params.id} clerkId={userId ?? null} />;
}
