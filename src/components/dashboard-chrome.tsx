"use client";

import { usePathname } from "next/navigation";
import { AppShell, type AppShellProps } from "@/components/app-shell";

/**
 * The dashboard's own index route (/dashboard) renders a full-bleed video
 * hero with its own transparent navbar, so it skips the sidebar entirely.
 * Every other /dashboard/* route keeps the existing AppShell sidebar shell,
 * unchanged.
 */
export function DashboardChrome({ children, ...shellProps }: AppShellProps) {
  const pathname = usePathname();
  if (pathname === "/dashboard") return <>{children}</>;
  return <AppShell {...shellProps}>{children}</AppShell>;
}
