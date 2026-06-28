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
  Plus,
} from "lucide-react";
import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { SignOutButton } from "@clerk/nextjs";
import axios from "axios";

const STORAGE_KEY = "cc-sidebar-collapsed";
const COLLAPSE_BREAKPOINT = 1280;

export function ResponsiveSidebar() {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [user, setUser] = useState(false);
  const [requestCount, setRequestCount] = useState(0);
  const pathname = usePathname();

  const applyCollapsed = useCallback((collapsed: boolean) => {
    setIsCollapsed(collapsed);
    if (typeof document !== "undefined") {
      document.body.classList.toggle("sidebar-collapsed", collapsed);
      document.body.classList.toggle("sidebar-expanded", !collapsed);
    }
  }, []);

  const toggleCollapsed = useCallback(() => {
    setIsCollapsed((prev) => {
      const next = !prev;
      localStorage.setItem(STORAGE_KEY, String(next));
      document.body.classList.toggle("sidebar-collapsed", next);
      document.body.classList.toggle("sidebar-expanded", !next);
      return next;
    });
  }, []);

  useEffect(() => {
    setMounted(true);
    const saved = localStorage.getItem(STORAGE_KEY);
    const prefersCollapsed =
      saved !== null ? saved === "true" : window.innerWidth < COLLAPSE_BREAKPOINT;
    applyCollapsed(prefersCollapsed);

    const onResize = () => {
      if (window.innerWidth < 768) return;
      if (localStorage.getItem(STORAGE_KEY) === null && window.innerWidth < COLLAPSE_BREAKPOINT) {
        applyCollapsed(true);
      }
    };
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [applyCollapsed]);

  useEffect(() => {
    const getUser = async () => {
      try {
        const [sidebarRes, countRes] = await Promise.all([
          axios.get("/api/sidebar"),
          axios.get("/api/requestcount").catch(() => ({ data: { count: 0 } })),
        ]);
        setUser(!!sidebarRes.data.userId);
        setRequestCount(countRes.data.count ?? 0);
      } catch {
        setUser(false);
        setRequestCount(0);
      }
    };
    getUser();
  }, [pathname]);

  if (!mounted) return null;

  return (
    <>
      {/* Desktop sidebar */}
      <aside
        className={cn(
          "fixed top-3 left-3 bottom-20 md:bottom-3 z-40 hidden md:flex flex-col",
          "rounded-2xl border border-white/[0.08] bg-[#080d18]/92 backdrop-blur-2xl",
          "shadow-[0_20px_60px_rgba(0,0,0,0.5)] transition-[width] duration-300 ease-out",
          isCollapsed ? "w-[76px]" : "w-[260px]"
        )}
      >
        {/* Brand */}
        <div
          className={cn(
            "flex items-center border-b border-white/[0.06] shrink-0",
            isCollapsed ? "justify-center px-2 py-4" : "justify-between px-4 py-4"
          )}
        >
          <Link
            href="/"
            className={cn("flex items-center gap-3 min-w-0", isCollapsed && "justify-center")}
            title="CodeConnect Home"
          >
            <span className="grid place-items-center size-10 rounded-xl bg-gradient-to-br from-cyan-400 to-blue-600 text-[#061019] shadow-lg shadow-cyan-500/20 shrink-0">
              <Sparkles size={18} />
            </span>
            {!isCollapsed && (
              <span className="leading-tight min-w-0">
                <span className="block text-[10px] uppercase tracking-[0.2em] text-white/40">
                  Social
                </span>
                <span className="block text-[15px] font-semibold text-white truncate">
                  CodeConnect
                </span>
              </span>
            )}
          </Link>
          {!isCollapsed && (
            <button
              onClick={toggleCollapsed}
              className="size-8 grid place-items-center rounded-lg text-white/50 hover:text-white hover:bg-white/[0.06] transition shrink-0"
              aria-label="Collapse sidebar"
            >
              <PanelLeftClose size={16} />
            </button>
          )}
        </div>

        {/* Collapse toggle when collapsed */}
        {isCollapsed && (
          <button
            onClick={toggleCollapsed}
            className="mx-auto mt-2 size-8 grid place-items-center rounded-lg text-white/50 hover:text-white hover:bg-white/[0.06] transition"
            aria-label="Expand sidebar"
          >
            <PanelLeftOpen size={15} />
          </button>
        )}

        {/* Nav */}
        <nav className="flex-1 p-2.5 space-y-1 overflow-y-auto scrollbar-thin">
          <SidebarLink href="/" label="Home" icon={<Compass size={17} />} collapsed={isCollapsed} pathname={pathname} />
          <SidebarLink href="/searchuser" label="Explore" icon={<Search size={17} />} collapsed={isCollapsed} pathname={pathname} />
          <SidebarLink href="/messages" label="Messages" icon={<MessageCircleMore size={17} />} collapsed={isCollapsed} pathname={pathname} />
          <SidebarLink
            href="/profile"
            label="Profile"
            icon={<UserRound size={17} />}
            collapsed={isCollapsed}
            pathname={pathname}
            badge={requestCount}
          />

          {/* CTA */}
          <div className={cn("pt-2", isCollapsed ? "px-0" : "px-1")}>
            <Link
              href="/create-post"
              className={cn(
                "flex items-center justify-center gap-2 rounded-xl font-medium text-sm transition-all",
                "bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-lg shadow-cyan-500/20",
                "hover:brightness-110 hover:shadow-cyan-500/30",
                isCollapsed ? "size-11 mx-auto" : "w-full py-2.5 px-4",
                pathname === "/create-post" && "ring-2 ring-cyan-300/40"
              )}
              title="New Post"
            >
              {isCollapsed ? <Plus size={18} /> : (
                <>
                  <SquarePen size={16} />
                  <span>New Post</span>
                </>
              )}
            </Link>
          </div>
        </nav>

        {/* Footer */}
        <div className="p-2.5 border-t border-white/[0.06] space-y-1 shrink-0">
          <SidebarLink href="/about-us" label="About" icon={<Sparkles size={17} />} collapsed={isCollapsed} pathname={pathname} />
          {user ? (
            <SidebarLogoutButton label="Logout" icon={<LogOut size={17} />} collapsed={isCollapsed} />
          ) : (
            <SidebarLink href="/sign-in" label="Sign In" icon={<LogIn size={17} />} collapsed={isCollapsed} pathname={pathname} />
          )}
        </div>
      </aside>

      {/* Mobile bottom nav */}
      <nav className="fixed md:hidden bottom-0 inset-x-0 z-50 border-t border-white/[0.08] bg-[#080d18]/95 backdrop-blur-xl safe-bottom">
        <ul className="flex items-stretch justify-around px-1 pt-1.5 pb-2 max-w-lg mx-auto">
          <MobileNavItem href="/" icon={<Compass size={20} />} pathname={pathname} label="Home" />
          <MobileNavItem href="/searchuser" icon={<Search size={20} />} pathname={pathname} label="Explore" />
          <li className="flex items-center -mt-3">
            <Link
              href="/create-post"
              className="flex items-center justify-center size-12 rounded-2xl bg-gradient-to-br from-cyan-400 to-blue-600 text-[#061019] shadow-lg shadow-cyan-500/30"
              aria-label="New post"
            >
              <Plus size={22} strokeWidth={2.5} />
            </Link>
          </li>
          <MobileNavItem href="/messages" icon={<MessageCircleMore size={20} />} pathname={pathname} label="Chat" />
          <MobileNavItem
            href="/profile"
            icon={<UserRound size={20} />}
            pathname={pathname}
            label="Profile"
            badge={requestCount}
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
        "relative flex items-center rounded-xl text-[13px] font-medium transition-all duration-200",
        isActive
          ? "bg-white/[0.08] text-white"
          : "text-white/55 hover:text-white hover:bg-white/[0.04]",
        collapsed ? "justify-center size-11 mx-auto" : "gap-3 px-3 py-2.5"
      )}
      title={collapsed ? label : undefined}
    >
      <span className="relative shrink-0">
        <span className={cn("grid place-items-center", collapsed ? "" : "size-5")}>{icon}</span>
        {badge !== undefined && badge > 0 && (
          <span className="absolute -top-1.5 -right-1.5 min-w-[16px] h-4 px-1 rounded-full bg-rose-500 text-[9px] font-bold text-white grid place-items-center">
            {badge > 9 ? "9+" : badge}
          </span>
        )}
      </span>
      {!collapsed && <span className="truncate">{label}</span>}
      {isActive && (
        <span className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 rounded-r-full bg-cyan-400" />
      )}
    </Link>
  );
}

function SidebarLogoutButton({ label, icon, collapsed }: { label: string; icon: React.ReactNode; collapsed: boolean }) {
  return (
    <SignOutButton>
      <button
        className={cn(
          "w-full flex items-center rounded-xl text-[13px] font-medium text-white/50 hover:text-rose-300 hover:bg-rose-500/10 transition",
          collapsed ? "justify-center size-11 mx-auto" : "gap-3 px-3 py-2.5"
        )}
        title={collapsed ? label : undefined}
      >
        <span className="shrink-0">{icon}</span>
        {!collapsed && <span>{label}</span>}
      </button>
    </SignOutButton>
  );
}

function MobileNavItem({
  href,
  icon,
  pathname,
  label,
  badge,
}: {
  href: string;
  icon: React.ReactNode;
  pathname: string;
  label: string;
  badge?: number;
}) {
  const isActive = href === "/" ? pathname === "/" : pathname.startsWith(href);

  return (
    <li className="flex-1">
      <Link
        href={href}
        className={cn(
          "relative flex flex-col items-center justify-center py-1.5 gap-0.5 text-[10px] font-medium transition",
          isActive ? "text-cyan-300" : "text-white/45"
        )}
      >
        <span className="relative">
          {icon}
          {badge !== undefined && badge > 0 && (
            <span className="absolute -top-1 -right-2 min-w-[14px] h-3.5 px-0.5 rounded-full bg-rose-500 text-[8px] font-bold text-white grid place-items-center">
              {badge > 9 ? "9+" : badge}
            </span>
          )}
        </span>
        <span>{label}</span>
      </Link>
    </li>
  );
}
