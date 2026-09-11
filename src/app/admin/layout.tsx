import { User, Users, FolderKanban, Trophy, Settings, History } from "lucide-react";
import { requireAdmin } from "@/lib/dal";
import { signOut } from "@/auth";
import { AppShell, type NavItem } from "@/components/app-shell";

const ICON_CLASS = "size-5 shrink-0";

const NAV_ITEMS: NavItem[] = [
  { href: "/admin/users", label: "User Management", icon: <User className={ICON_CLASS} /> },
  { href: "/admin/teams", label: "Team Management", icon: <Users className={ICON_CLASS} /> },
  { href: "/admin/projects", label: "Project Management", icon: <FolderKanban className={ICON_CLASS} /> },
  { href: "/admin/leaderboard", label: "Leaderboard Config", icon: <Trophy className={ICON_CLASS} /> },
  { href: "/admin/activity", label: "Activity Log", icon: <History className={ICON_CLASS} /> },
  { href: "/admin/settings", label: "Settings", icon: <Settings className={ICON_CLASS} /> },
];

export default async function AdminLayout({ children }: LayoutProps<"/admin">) {
  const user = await requireAdmin();

  return (
    <AppShell
      brand="Race Control"
      navItems={NAV_ITEMS}
      userName={user.name}
      userPhoto={user.photoUrl}
      signOutAction={async () => {
        "use server";
        await signOut({ redirectTo: "/" });
      }}
    >
      {children}
    </AppShell>
  );
}
