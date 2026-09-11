import { User, Users, FolderKanban, LayoutGrid, Trophy, BookUser } from "lucide-react";
import { requireUser } from "@/lib/dal";
import { signOut } from "@/auth";
import { AppShell, type NavItem } from "@/components/app-shell";

const ICON_CLASS = "size-5 shrink-0";

const NAV_ITEMS: NavItem[] = [
  { href: "/dashboard/profile", label: "My Profile", icon: <User className={ICON_CLASS} /> },
  { href: "/dashboard/team", label: "My Team", icon: <Users className={ICON_CLASS} /> },
  { href: "/dashboard/project", label: "My Project", icon: <FolderKanban className={ICON_CLASS} /> },
  { href: "/dashboard/showcase", label: "Showcase", icon: <LayoutGrid className={ICON_CLASS} /> },
  { href: "/dashboard/leaderboard", label: "Leaderboard", icon: <Trophy className={ICON_CLASS} /> },
  { href: "/dashboard/directory", label: "Directory", icon: <BookUser className={ICON_CLASS} /> },
];

export default async function DashboardLayout({ children }: LayoutProps<"/dashboard">) {
  const user = await requireUser();

  return (
    <AppShell
      brand="Pit Lane"
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
