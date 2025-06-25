import { auth } from "@clerk/nextjs/server";
import dynamicImport from "next/dynamic";

// ✅ This is the client component dynamically imported
const ProfilePg = dynamicImport(() => import("@/components/profilepage"), {
  ssr: false,
});

// ✅ Rename this to avoid conflict with import
export const dynamicSetting = "force-dynamic";

// ✅ Dynamic route type
type PageProps = {
  params: {
    id: string;
  };
};

export default async function ProfileIdPage({ params }: PageProps) {
  const { userId } = await auth();

  return (
    <ProfilePg
      usermId={params.id}
      clerkId={userId ?? null}
    />
  );
}
