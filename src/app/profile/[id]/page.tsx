import { auth } from "@clerk/nextjs/server";
import ProfilePg from "@/components/profilepage";

interface PageProps {
  params: {
    id: string;
  };
}

export default async function ProfileIdPage({ params }: PageProps) {
  const { userId } = await auth();
  return <ProfilePg usermId={params.id} clerkId={userId ?? null} />;
}
