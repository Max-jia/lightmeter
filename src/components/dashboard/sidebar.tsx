"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Mail,
  Users,
  LinkIcon,
  Calendar,
  BarChart3,
  Settings,
  LogOut,
  Camera,
} from "lucide-react";

export function Sidebar({
  userEmail,
  userName,
}: {
  userEmail?: string;
  userName?: string;
}) {
  const pathname = usePathname();

  const navItems = [
    { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { label: "Inbox", href: "/dashboard/inbox", icon: Mail },
    { label: "Clients", href: "/dashboard/clients", icon: Users },
    { label: "Links", href: "/dashboard/links", icon: LinkIcon },
    { label: "Calendar", href: "/dashboard/calendar", icon: Calendar },
    { label: "Analytics", href: "/dashboard/analytics", icon: BarChart3 },
    { label: "Settings", href: "/dashboard/settings", icon: Settings },
  ];

  const isActive = (href: string) =>
    href === "/dashboard"
      ? pathname === "/dashboard"
      : pathname.startsWith(href);

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden md:flex flex-col w-64 border-r border-[var(--color-border-subtle)] bg-[var(--color-bg-base)]">
        {/* Logo */}
        <div className="flex items-center gap-2.5 px-5 py-5 border-b border-[var(--color-border-subtle)]">
          <div className="w-8 h-8 rounded-xl bg-[var(--color-gold)] flex items-center justify-center shadow-[var(--elevation-1)]">
            <Camera className="w-4 h-4 text-[#1A1816]" />
          </div>
          <span className="text-base font-heading font-semibold tracking-tight" style={{ fontFamily: "var(--font-space-grotesk)" }}>
            Lightmeter
          </span>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 space-y-1">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium",
                "transition-all duration-[var(--duration-fast)] ease-[var(--spring-ios)]",
                isActive(item.href)
                  ? "bg-[var(--color-gold-subtle)] text-[var(--color-gold)]"
                  : "text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-bg-surface)]"
              )}
            >
              <item.icon className="w-5 h-5" />
              {item.label}
            </Link>
          ))}
        </nav>

        {/* User */}
        <div className="px-3 py-4 border-t border-[var(--color-border-subtle)]">
          <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl">
            <div className="w-8 h-8 rounded-full bg-[var(--color-gold-subtle)] flex items-center justify-center text-xs font-semibold text-[var(--color-gold)] ring-1 ring-[var(--color-gold)]/20">
              {userName?.charAt(0)?.toUpperCase() || "P"}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs text-[var(--color-text-secondary)] truncate">
                {userEmail || "photographer@email.com"}
              </p>
            </div>
            <form action="/api/auth/logout" method="POST">
              <button type="submit" className="p-1.5 rounded-lg text-[var(--color-text-disabled)] hover:text-[var(--color-error)] hover:bg-[var(--color-error-bg)] transition-colors" title="Sign out">
                <LogOut className="w-4 h-4" />
              </button>
            </form>
          </div>
        </div>
      </aside>

      {/* Mobile bottom tab bar */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 flex items-center justify-around bg-[var(--color-bg-base)] border-t border-[var(--color-border-subtle)]">
        {navItems.slice(0, 5).map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex flex-col items-center gap-0.5 py-2 px-3 text-[10px] font-medium",
              "transition-all duration-[var(--duration-fast)] ease-[var(--spring-ios)] active:scale-90",
              isActive(item.href) ? "text-[var(--color-gold)]" : "text-[var(--color-text-disabled)]"
            )}
          >
            <item.icon className="w-5 h-5" />
            {item.label}
          </Link>
        ))}
      </nav>
    </>
  );
}
