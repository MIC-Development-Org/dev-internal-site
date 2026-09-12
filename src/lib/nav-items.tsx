import { LayoutDashboard, Users, FolderKanban, LayoutGrid, Trophy, BookUser } from "lucide-react";
import type { NavItem } from "@/components/app-shell";

const ICON_CLASS = "size-5 shrink-0";

// Shared between the sidebar (AppShell) and the dashboard hero's top navbar,
// so the two navigation surfaces never drift out of sync.
export const DASHBOARD_NAV_ITEMS: NavItem[] = [
  { href: "/dashboard", label: "Dashboard", icon: <LayoutDashboard className={ICON_CLASS} />, exact: true },
  { href: "/dashboard/team", label: "My Team", icon: <Users className={ICON_CLASS} /> },
  { href: "/dashboard/project", label: "My Project", icon: <FolderKanban className={ICON_CLASS} /> },
  { href: "/dashboard/showcase", label: "Projects", icon: <LayoutGrid className={ICON_CLASS} /> },
  { href: "/dashboard/leaderboard", label: "Leaderboard", icon: <Trophy className={ICON_CLASS} /> },
  { href: "/dashboard/directory", label: "Members", icon: <BookUser className={ICON_CLASS} /> },
];
