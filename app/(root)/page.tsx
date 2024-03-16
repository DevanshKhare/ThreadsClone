import ThreadCard from "@/components/cards/ThreadCard";
import RenderThreadsSection from "@/components/sections/RenderThreadsSection";
import { fetchThreads } from "@/lib/actions/thread.actions";
import { fetchUser } from "@/lib/actions/user.actions";
import { currentUser } from "@clerk/nextjs";
import { redirect } from "next/navigation";

export default async function Home() {
  const user = await currentUser();
  const userInfo = await fetchUser(user?.id || "");
  if (!userInfo?.onboarded) redirect("/onboarding");
  // }
  return (
    <>
          <RenderThreadsSection user={JSON.parse(JSON.stringify(user))}/>
    </>
  );
}
