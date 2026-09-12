import { requireUser } from "@/lib/dal";
import { signOut } from "@/auth";
import { DashboardChrome } from "@/components/dashboard-chrome";
import { DASHBOARD_NAV_ITEMS } from "@/lib/nav-items";

export default async function DashboardLayout({ children }: LayoutProps<"/dashboard">) {
  const user = await requireUser();

  return (
    <DashboardChrome
      brand="MIC"
      navItems={DASHBOARD_NAV_ITEMS}
      userName={user.name}
      userPhoto={user.photoUrl}
      signOutAction={async () => {
        "use server";
        await signOut({ redirectTo: "/" });
      }}
    >
      {children}
    </DashboardChrome>
  );
}
