import { requireUser } from "@/lib/dal";
import { getMemberProfile } from "@/lib/data/users";
import { DashboardOverview } from "@/components/dashboard/dashboard-overview";

export default async function DashboardPage() {
  const user = await requireUser();
  const profile = await getMemberProfile(String(user._id));
  if (!profile) return null;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Welcome back, {profile.name.split(" ")[0]}</h1>
        <p className="text-sm text-muted-foreground">Here&apos;s where things stand in the paddock.</p>
      </div>

      <DashboardOverview
        profile={{
          name: profile.name,
          photoUrl: profile.photoUrl,
          role: profile.role,
          teamName: profile.teamName,
          points: profile.points,
          rank: profile.rank,
        }}
      />
    </div>
  );
}
