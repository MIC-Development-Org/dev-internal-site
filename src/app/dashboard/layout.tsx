import { requireUser } from "@/lib/dal";
import { signOut } from "@/auth";
import { AppShell, type NavItem } from "@/components/app-shell";

const NAV_ITEMS: NavItem[] = [
  { href: "/dashboard/profile", label: "My Profile" },
  { href: "/dashboard/team", label: "My Team" },
  { href: "/dashboard/project", label: "My Project" },
  { href: "/dashboard/showcase", label: "Showcase" },
  { href: "/dashboard/leaderboard", label: "Leaderboard" },
  { href: "/dashboard/directory", label: "Directory" },
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
