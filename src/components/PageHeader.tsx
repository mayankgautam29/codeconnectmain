"use client";

import { usePathname } from "next/navigation";

const PAGE_META: Record<string, { title: string; subtitle: string }> = {
  "/": { title: "Home Feed", subtitle: "Discover what builders are sharing" },
  "/profile": { title: "Your Profile", subtitle: "Manage your presence and posts" },
  "/messages": { title: "Messages", subtitle: "Your conversations" },
  "/searchuser": { title: "Explore", subtitle: "Find developers in the community" },
  "/create-post": { title: "Create Post", subtitle: "Share photos or videos with everyone" },
  "/uploadpfp": { title: "Profile Photo", subtitle: "Update how others see you" },
  "/about-us": { title: "About", subtitle: "Meet the creator behind CodeConnect" },
  "/sign-in": { title: "Welcome back", subtitle: "Sign in to continue" },
  "/sign-up": { title: "Join CodeConnect", subtitle: "Create your developer account" },
};

function getMeta(pathname: string) {
  if (PAGE_META[pathname]) return PAGE_META[pathname];
  if (pathname.startsWith("/messages/")) {
    return { title: "Chat", subtitle: "Real-time conversation" };
  }
  if (pathname.startsWith("/profile/")) {
    return { title: "Profile", subtitle: "View builder profile and posts" };
  }
  return { title: "CodeConnect", subtitle: "Connect, showcase, and discover builders." };
}

const HIDDEN_PREFIXES = ["/sign-in", "/sign-up", "/verify-email", "/setusername", "/sso-callback"];

export function PageHeader() {
  const pathname = usePathname();
  const meta = getMeta(pathname);

  if (HIDDEN_PREFIXES.some((p) => pathname.startsWith(p))) return null;

  return (
    <header className="mb-6 md:mb-8">
      <p className="text-[11px] uppercase tracking-[0.2em] text-cyan-300/70 font-medium mb-1">
        CodeConnect
      </p>
      <h1 className="text-2xl md:text-3xl font-semibold tracking-tight text-white">
        {meta.title}
      </h1>
      <p className="text-sm text-white/50 mt-1">{meta.subtitle}</p>
    </header>
  );
}
