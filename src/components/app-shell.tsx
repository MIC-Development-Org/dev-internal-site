"use client";

import { useEffect, useState, type ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X, PanelLeftClose, PanelLeftOpen, LogOut, User } from "lucide-react";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

// `icon` is a pre-rendered element (not a component reference) because this
// is a Client Component: a bare component type passed as a prop from a
// Server Component layout can't cross the RSC boundary (only serializable
// values and already-rendered elements/children can).
export type NavItem = { href: string; label: string; icon: ReactNode; exact?: boolean };

const COLLAPSE_STORAGE_KEY = "pitlane-sidebar-collapsed";

export function AppShell({
  navItems,
  brand,
  userName,
  userPhoto,
  signOutAction,
  children,
}: {
  navItems: NavItem[];
  brand: string;
  userName: string;
  userPhoto?: string;
  signOutAction: () => Promise<void>;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  // Starts expanded so SSR/first client render match; the stored desktop
  // preference is applied right after mount to avoid a hydration mismatch.
  const [collapsed, setCollapsed] = useState(false);

  useEffect(() => {
    try {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setCollapsed(localStorage.getItem(COLLAPSE_STORAGE_KEY) === "1");
    } catch {
      // localStorage unavailable (private mode, etc) - keep expanded default.
    }
  }, []);

  function toggleCollapsed() {
    setCollapsed((prev) => {
      const next = !prev;
      try {
        localStorage.setItem(COLLAPSE_STORAGE_KEY, next ? "1" : "0");
      } catch {
        // ignore
      }
      return next;
    });
  }

  return (
    <div className="min-h-svh bg-background md:flex">
      <header className="sticky top-0 z-30 flex h-14 items-center justify-between border-b border-border bg-black px-4 text-white md:hidden">
        <span className="font-mono text-sm font-bold uppercase tracking-[0.2em] text-primary">{brand}</span>
        <button
          type="button"
          aria-label="Open menu"
          onClick={() => setOpen(true)}
          className="rounded-md p-2 text-neutral-300 hover:bg-white/10 hover:text-white"
        >
          <Menu className="size-5" />
        </button>
      </header>

      {open && (
        <div
          className="fixed inset-0 z-40 bg-black/60 md:hidden"
          onClick={() => setOpen(false)}
          aria-hidden="true"
        />
      )}

      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex w-64 shrink-0 -translate-x-full flex-col border-r border-border bg-black text-white transition-[transform,width] duration-200 md:sticky md:top-0 md:h-svh md:translate-x-0",
          open && "translate-x-0",
          collapsed ? "md:w-16" : "md:w-64"
        )}
      >
        <div className="flex h-14 items-center justify-between px-4">
          <span
            className={cn(
              "font-mono text-sm font-bold uppercase tracking-[0.2em] text-primary",
              collapsed && "md:hidden"
            )}
          >
            {brand}
          </span>
          <button
            type="button"
            aria-label="Collapse sidebar"
            onClick={toggleCollapsed}
            className="hidden rounded-md p-1.5 text-neutral-300 hover:bg-white/10 hover:text-white md:flex"
          >
            {collapsed ? <PanelLeftOpen className="size-5" /> : <PanelLeftClose className="size-5" />}
          </button>
          <button
            type="button"
            aria-label="Close menu"
            onClick={() => setOpen(false)}
            className="rounded-md p-1.5 text-neutral-300 hover:bg-white/10 hover:text-white md:hidden"
          >
            <X className="size-5" />
          </button>
        </div>

        <nav className="flex-1 space-y-1 overflow-y-auto overflow-x-hidden px-3 py-2">
          {navItems.map((item) => {
            const active = item.exact
              ? pathname === item.href
              : pathname === item.href || pathname.startsWith(item.href + "/");
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                title={item.label}
                className={cn(
                  "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                  collapsed && "md:justify-center md:px-0",
                  active
                    ? "bg-primary text-primary-foreground"
                    : "text-neutral-300 hover:bg-white/10 hover:text-white"
                )}
              >
                {item.icon}
                <span className={cn(collapsed && "md:hidden")}>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="border-t border-white/10 px-2 py-2">
          <DropdownMenu>
            <DropdownMenuTrigger
              className={cn(
                "flex w-full items-center gap-3 rounded-md px-2 py-2 text-left outline-none hover:bg-white/10 data-popup-open:bg-white/10",
                collapsed && "md:justify-center md:px-0"
              )}
            >
              <Avatar className="h-8 w-8 shrink-0">
                <AvatarImage src={userPhoto} alt={userName} />
                <AvatarFallback>{userName.slice(0, 2).toUpperCase()}</AvatarFallback>
              </Avatar>
              <span className={cn("flex-1 truncate text-sm text-neutral-300", collapsed && "md:hidden")}>
                {userName}
              </span>
            </DropdownMenuTrigger>
            <DropdownMenuContent side="top" align="start" sideOffset={8} className="w-56">
              <DropdownMenuItem render={<Link href="/dashboard/profile" />}>
                <User className="size-4" />
                My Profile
              </DropdownMenuItem>
              <DropdownMenuItem variant="destructive" onClick={() => signOutAction()}>
                <LogOut className="size-4" />
                Log out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </aside>

      <main className="min-w-0 flex-1 px-4 py-8 md:px-8">
        <div className="mx-auto max-w-5xl">{children}</div>
      </main>
    </div>
  );
}
