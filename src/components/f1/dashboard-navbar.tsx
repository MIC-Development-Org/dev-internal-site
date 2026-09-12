"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";
import { cn } from "@/lib/utils";
import type { NavItem } from "@/components/app-shell";

// Transparent navbar for the dashboard hero — no background, no border, no
// blur. Collapses to a hamburger below lg; the mobile panel uses a solid
// black fill (matching AppShell's existing mobile drawer), never glass.
export function DashboardNavbar({
  navItems,
  userName,
  signOutAction,
}: {
  navItems: NavItem[];
  userName: string;
  signOutAction: () => Promise<void>;
}) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  function isActive(item: NavItem) {
    return item.exact ? pathname === item.href : pathname === item.href || pathname.startsWith(item.href + "/");
  }

  return (
    <header className="absolute inset-x-0 top-0 z-20">
      <div className="flex h-16 items-center justify-between px-6 md:px-10">
        <Link href="/dashboard" className="flex items-center gap-2.5">
          <Image
            src="/mic-logo.png"
            alt="MIC Logo"
            width={120}
            height={45}
            unoptimized
            style={{ mixBlendMode: "screen" }}
            className="h-7 w-auto"
          />
          <span className="font-mono text-sm font-bold uppercase tracking-[0.2em] text-white">
            MIC
          </span>
        </Link>

        <nav className="hidden items-center gap-6 lg:flex">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "text-xs font-medium uppercase tracking-widest transition-colors",
                isActive(item) ? "text-white" : "text-white/60 hover:text-white"
              )}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-4 lg:flex">
          <span className="text-xs font-medium uppercase tracking-widest text-white/70">{userName}</span>
          <button
            type="button"
            onClick={() => signOutAction()}
            className="text-xs font-medium uppercase tracking-widest text-white/70 transition-colors hover:text-white"
          >
            Sign out
          </button>
        </div>

        <button
          type="button"
          aria-label={open ? "Close menu" : "Open menu"}
          onClick={() => setOpen((v) => !v)}
          className="text-white lg:hidden"
        >
          {open ? <X className="size-6" /> : <Menu className="size-6" />}
        </button>
      </div>

      {open && (
        <div className="bg-black px-6 py-4 lg:hidden">
          <nav className="flex flex-col gap-3">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className={cn(
                  "text-sm font-medium uppercase tracking-widest",
                  isActive(item) ? "text-white" : "text-white/70 hover:text-white"
                )}
              >
                {item.label}
              </Link>
            ))}
          </nav>
          <div className="mt-4 flex items-center justify-between border-t border-white/10 pt-4">
            <span className="text-xs uppercase tracking-widest text-white/60">{userName}</span>
            <button
              type="button"
              onClick={() => {
                setOpen(false);
                signOutAction();
              }}
              className="text-xs font-medium uppercase tracking-widest text-white/70 hover:text-white"
            >
              Sign out
            </button>
          </div>
        </div>
      )}
    </header>
  );
}
