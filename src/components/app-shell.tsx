"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export type NavItem = { href: string; label: string };

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

  return (
    <div className="min-h-svh bg-background">
      <header className="sticky top-0 z-40 border-b border-border bg-black text-white">
        <div className="mx-auto flex h-14 max-w-6xl items-center gap-6 px-4">
          <span className="font-mono text-sm font-bold uppercase tracking-[0.2em] text-primary">
            {brand}
          </span>
          <nav className="flex flex-1 items-center gap-1 overflow-x-auto">
            {navItems.map((item) => {
              const active = pathname === item.href || pathname.startsWith(item.href + "/");
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "whitespace-nowrap rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
                    active
                      ? "bg-primary text-primary-foreground"
                      : "text-neutral-300 hover:bg-white/10 hover:text-white"
                  )}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>
          <div className="flex items-center gap-3">
            <Avatar className="h-8 w-8">
              <AvatarImage src={userPhoto} alt={userName} />
              <AvatarFallback>{userName.slice(0, 2).toUpperCase()}</AvatarFallback>
            </Avatar>
            <form action={signOutAction}>
              <Button type="submit" variant="ghost" size="sm" className="text-neutral-300 hover:text-white">
                Sign out
              </Button>
            </form>
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-4 py-8">{children}</main>
    </div>
  );
}
