"use client";

import {
  Compass,
  UserRound,
  MessageCircleMore,
  SquarePen,
  Sparkles,
  Search,
  LogIn,
  LogOut,
  PanelLeftClose,
  PanelLeftOpen,
} from "lucide-react";
import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { SignOutButton } from "@clerk/nextjs";
import axios from "axios";
import { Badge } from "@/components/ui/badge";

export function ResponsiveSidebar() {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [user, setUser] = useState(false);
  const [requestCount, setRequestCount] = useState(0);
  const pathname = usePathname();

  useEffect(() => {
    setIsCollapsed(typeof window !== "undefined" ? window.innerWidth < 1280 : true);
    const getUser = async () => {
      try {
        const [sidebarRes, countRes] = await Promise.all([
          axios.get("/api/sidebar"),
          axios.get("/api/requestcount").catch(() => ({ data: { count: 0 } })),
        ]);
        const { userId } = sidebarRes.data;
        setUser(!!userId);
        setRequestCount(countRes.data.count ?? 0);
      } catch {
        setUser(false);
        setRequestCount(0);
      }
    };
    getUser();
  }, [pathname]);

  useEffect(() => {
    if (typeof document !== "undefined") {
      document.body.classList.toggle("sidebar-collapsed", isCollapsed);
      document.body.classList.toggle("sidebar-expanded", !isCollapsed);
    }
  }, [isCollapsed]);

  return (
    <>
      <aside
        className={cn(
          "fixed top-4 left-4 bottom-24 md:bottom-4 z-40 hidden md:flex flex-col rounded-3xl border border-white/10 bg-[#0a0f1a]/85 backdrop-blur-xl transition-all duration-300 ease-in-out shadow-[0_28px_70px_rgba(0,0,0,0.55)]",
          isCollapsed ? "w-[88px]" : "w-[280px]"
        )}
      >
        <div className="flex items-center justify-between px-4 py-5 border-b border-white/10">
          <Link
            href="/"
            className={cn("flex items-center gap-3 min-w-0", isCollapsed && "justify-center w-full")}
          >
            <span className="grid place-items-center size-11 rounded-2xl bg-gradient-to-br from-cyan-400/90 to-blue-500/90 text-[#061019] shadow-[0_8px_25px_rgba(56,189,248,0.35)]">
              <Sparkles size={20} />
            </span>
            {!isCollapsed && (
              <span className="leading-tight">
                <span className="block text-xs uppercase tracking-[0.18em] text-white/55">Social</span>
                <span className="block text-[1.05rem] font-semibold text-white">CodeConnect</span>
              </span>
            )}
          </Link>
          {!isCollapsed && (
            <button
              onClick={() => setIsCollapsed(true)}
              className="size-9 grid place-items-center rounded-xl border border-white/10 bg-white/[0.04] text-white/70 hover:text-white hover:bg-white/10 transition"
              aria-label="Collapse sidebar"
            >
              <PanelLeftClose size={16} />
            </button>
          )}
          {isCollapsed && (
            <button
              onClick={() => setIsCollapsed(false)}
              className="absolute -right-4 top-7 size-8 grid place-items-center rounded-full border border-white/15 bg-[#0b1220] text-white/70 hover:text-white hover:bg-[#111b2f] transition"
              aria-label="Expand sidebar"
            >
              <PanelLeftOpen size={14} />
            </button>
          )}
        </div>

        <nav className="flex-1 p-3 space-y-1.5 overflow-y-auto">
          <SidebarLink
            href="/"
            label="Home Feed"
            icon={<Compass size={18} />}
            collapsed={isCollapsed}
            pathname={pathname}
          />
          <SidebarLink
            href="/profile"
            label="Your Profile"
            icon={<UserRound size={18} />}
            collapsed={isCollapsed}
            pathname={pathname}
            badge={requestCount > 0 ? requestCount : undefined}
          />
          <SidebarLink
            href="/messages"
            label="Messages"
            icon={<MessageCircleMore size={18} />}
            collapsed={isCollapsed}
            pathname={pathname}
          />
          <SidebarLink
            href="/searchuser"
            label="Explore Users"
            icon={<Search size={18} />}
            collapsed={isCollapsed}
            pathname={pathname}
          />
          <SidebarLink
            href="/create-post"
            label="New Post"
            icon={<SquarePen size={18} />}
            collapsed={isCollapsed}
            pathname={pathname}
          />
        </nav>

        <div className="p-3 border-t border-white/10 space-y-1.5">
          <SidebarLink
            href="/about-us"
            label="About Dev"
            icon={<Sparkles size={18} />}
            collapsed={isCollapsed}
            pathname={pathname}
          />
          {user ? (
            <SidebarLogoutButton
              label="Logout"
              icon={<LogOut size={18} />}
              collapsed={isCollapsed}
            />
          ) : (
            <SidebarLink
              href="/sign-in"
              label="Sign In"
              icon={<LogIn size={18} />}
              collapsed={isCollapsed}
              pathname={pathname}
            />
          )}
        </div>
      </aside>

      <nav className="fixed md:hidden bottom-4 left-1/2 -translate-x-1/2 z-50 w-[calc(100%-1.5rem)] rounded-2xl border border-white/15 bg-[#091120]/90 backdrop-blur-xl p-2 shadow-[0_20px_50px_rgba(0,0,0,0.45)]">
        <ul className="grid grid-cols-5 gap-1">
          <MobileNavItem href="/" icon={<Compass size={18} />} pathname={pathname} label="Home" />
          <MobileNavItem
            href="/searchuser"
            icon={<Search size={18} />}
            pathname={pathname}
            label="Search"
          />
          <MobileNavItem
            href="/create-post"
            icon={<SquarePen size={18} />}
            pathname={pathname}
            label="Post"
          />
          <MobileNavItem
            href="/messages"
            icon={<MessageCircleMore size={18} />}
            pathname={pathname}
            label="Msgs"
          />
          <MobileNavItem
            href="/profile"
            icon={<UserRound size={18} />}
            pathname={pathname}
            label="Me"
          />
        </ul>
      </nav>
    </>
  );
}

type SidebarLinkProps = {
  href: string;
  label: string;
  icon: React.ReactNode;
  collapsed: boolean;
  pathname: string;
  badge?: number;
};

function SidebarLink({ href, label, icon, collapsed, pathname, badge }: SidebarLinkProps) {
  const isActive = href === "/" ? pathname === "/" : pathname.startsWith(href);

  return (
    <Link
      href={href}
      className={cn(
        "group flex items-center text-sm px-3 py-3 rounded-2xl transition-all duration-200",
        isActive
          ? "bg-gradient-to-r from-cyan-400/20 to-blue-500/25 text-white border border-cyan-300/30"
          : "text-white/70 hover:text-white hover:bg-white/8 border border-transparent",
        collapsed ? "justify-center" : "gap-3"
      )}
      title={collapsed ? label : undefined}
    >
      <span className="relative">
        <span
          className={cn(
            "grid place-items-center size-9 rounded-xl transition",
            isActive
              ? "bg-cyan-300/15 text-cyan-200"
              : "bg-white/[0.035] text-white/80 group-hover:bg-white/10 group-hover:text-white"
          )}
        >
          {icon}
        </span>
        {badge !== undefined && badge > 0 && (
          <span className="absolute -top-1 -right-1 size-4 rounded-full bg-rose-500 text-[10px] font-bold text-white grid place-items-center">
            {badge > 9 ? "9+" : badge}
          </span>
        )}
      </span>
      {!collapsed && (
        <span className="font-medium tracking-[0.01em] flex-1">{label}</span>
      )}
      {!collapsed && badge !== undefined && badge > 0 && (
        <Badge className="bg-rose-500/20 text-rose-300 border-rose-400/30 text-[10px]">
          {badge}
        </Badge>
      )}
    </Link>
  );
}

type SidebarLogoutProps = {
  label: string;
  icon: React.ReactNode;
  collapsed: boolean;
};

function SidebarLogoutButton({ label, icon, collapsed }: SidebarLogoutProps) {
  return (
    <SignOutButton>
      <button
        className={cn(
          "group w-full flex items-center text-sm px-3 py-3 rounded-2xl transition-all duration-200 border border-transparent hover:bg-red-500/15 text-red-300 hover:text-red-200",
          collapsed ? "justify-center" : "gap-3"
        )}
        title={collapsed ? label : undefined}
      >
        <span className="grid place-items-center size-9 rounded-xl bg-red-500/10">{icon}</span>
        {!collapsed && <span className="font-medium tracking-[0.01em]">{label}</span>}
      </button>
    </SignOutButton>
  );
}

type MobileNavItemProps = {
  href: string;
  icon: React.ReactNode;
  pathname: string;
  label: string;
};

function MobileNavItem({ href, icon, pathname, label }: MobileNavItemProps) {
  const isActive = href === "/" ? pathname === "/" : pathname.startsWith(href);

  return (
    <li>
      <Link
        href={href}
        className={cn(
          "flex flex-col items-center justify-center rounded-xl py-2.5 text-[11px] transition",
          isActive ? "bg-cyan-400/15 text-cyan-200" : "text-white/65 hover:text-white hover:bg-white/8"
        )}
      >
        <span>{icon}</span>
        <span className="mt-1">{label}</span>
      </Link>
    </li>
  );
}
