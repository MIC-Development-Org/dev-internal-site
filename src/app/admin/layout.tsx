import { requireAdmin } from "@/lib/dal";
import { signOut } from "@/auth";
import { AppShell, type NavItem } from "@/components/app-shell";

const NAV_ITEMS: NavItem[] = [
  { href: "/admin/users", label: "User Management" },
  { href: "/admin/teams", label: "Team Management" },
  { href: "/admin/projects", label: "Project Management" },
  { href: "/admin/leaderboard", label: "Leaderboard Config" },
  { href: "/admin/settings", label: "Settings" },
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
