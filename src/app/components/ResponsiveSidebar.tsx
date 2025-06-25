"use client";

import {
  Home,
  User,
  Info,
  ChevronFirst,
  ChevronLast,
  MessageSquare,
  Plus,
  LogOut,
  LogIn,
  Search
} from "lucide-react";
import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { SignOutButton } from "@clerk/nextjs";
import axios from "axios";

export function ResponsiveSidebar() {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [user, setUser] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    setIsCollapsed(true);
    const getUser = async () => {
      try {
        const response = await axios.get("/api/sidebar");
        const { userId } = response.data;
        setUser(!!userId);
      } catch (err) {
        setUser(false);
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
    <aside
      className={cn(
        "fixed top-0 left-0 h-screen z-40 flex flex-col transition-all duration-300 ease-in-out shadow-lg",
        isCollapsed ? "w-16" : "w-64"
      )}
      style={{
        background:
          "linear-gradient(to bottom right, #2b2e4a, #1e202e, #0f1123)",
      }}
    >
      <div className="flex items-center justify-between p-4 border-b border-white/10">
        {!isCollapsed && (
          <h1 className="text-lg font-semibold text-white">CodeConnect</h1>
        )}
        <button
          onClick={() => setIsCollapsed((prev) => !prev)}
          className="text-white hover:text-purple-300 transition"
        >
          {isCollapsed ? <ChevronLast size={20} /> : <ChevronFirst size={20} />}
        </button>
      </div>

      <nav className="flex flex-col py-6 space-y-2 px-2">
        <SidebarLink
          href="/"
          label="Home"
          icon={<Home size={20} />}
          collapsed={isCollapsed}
        />
        <SidebarLink
          href="/profile"
          label="Profile"
          icon={<User size={20} />}
          collapsed={isCollapsed}
        />
        <SidebarLink
          href="/messages"
          label="Messages"
          icon={<MessageSquare size={20} />}
          collapsed={isCollapsed}
        />
        <SidebarLink
          href="/searchuser"
          label="Search"
          icon={<Search size={20} />}
          collapsed={isCollapsed}
        />

        <SidebarLink
          href="/create-post"
          label="Create Post"
          icon={<Plus size={20} />}
          collapsed={isCollapsed}
        />
        <SidebarLink
          href="/about-us"
          label="About Dev"
          icon={<Info size={20} />}
          collapsed={isCollapsed}
        />
        {user ? (
          <SidebarLogoutButton
            label="Logout"
            icon={<LogOut size={20} />}
            collapsed={isCollapsed}
          />
        ) : (
          <SidebarLink
            href="/sign-in"
            label="Sign In"
            icon={<LogIn size={20} />}
            collapsed={isCollapsed}
          />
        )}
      </nav>
    </aside>
  );
}

type SidebarLinkProps = {
  href: string;
  label: string;
  icon: React.ReactNode;
  collapsed: boolean;
};

function SidebarLink({ href, label, icon, collapsed }: SidebarLinkProps) {
  return (
    <Link
      href={href}
      className={cn(
        "flex items-center text-sm px-4 py-3 rounded-lg transition-all duration-200 hover:bg-white/10 text-white",
        collapsed ? "justify-center" : "gap-3"
      )}
      title={collapsed ? label : undefined}
    >
      <span>{icon}</span>
      {!collapsed && <span>{label}</span>}
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
          "flex items-center text-sm px-4 py-3 rounded-lg transition-all duration-200 hover:bg-red-600/30 text-red-400",
          collapsed ? "justify-center" : "gap-3"
        )}
        title={collapsed ? label : undefined}
      >
        <span>{icon}</span>
        {!collapsed && <span>{label}</span>}
      </button>
    </SignOutButton>
  );
}
