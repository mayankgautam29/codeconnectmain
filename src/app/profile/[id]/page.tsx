import ProfilePg from "@/components/profilepage";
import { auth } from "@clerk/nextjs/server";

interface ProfilePageProps {
  params: {
    id: string;
  };
}

export default async function ProfileId({ params }: ProfilePageProps) {
  const { userId: clerkId } = await auth();
  return <ProfilePg usermId={params.id} clerkId={clerkId || null} />;
}