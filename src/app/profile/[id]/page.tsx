import { auth } from "@clerk/nextjs/server";
import ProfilePg from "@/components/profilepage";
type Props = {
  params: {
    id: string;
  };
};

export default async function ProfileIdPage({ params }: Props) {
  const { userId } = await auth();

  return (
    <ProfilePg
      usermId={params.id}
      clerkId={userId ?? null}
    />
  );
}
