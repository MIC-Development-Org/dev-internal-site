import { requireUser } from "@/lib/dal";
import { getMemberProfile } from "@/lib/data/users";
import { getMyTeam } from "@/lib/data/teams";
import { getProjectForTeam } from "@/lib/data/projects";
import { getDepartmentSnapshot } from "@/lib/data/dashboard";
import { getMemberActivity } from "@/lib/data/activity";
import { signOut } from "@/auth";
import { DashboardOverview } from "@/components/dashboard/dashboard-overview";
import { DashboardHero } from "@/components/f1/dashboard-hero";
import { DASHBOARD_NAV_ITEMS } from "@/lib/nav-items";

export default async function DashboardPage() {
  const user = await requireUser();
  const profile = await getMemberProfile(String(user._id));
  if (!profile) return null;

  const team = await getMyTeam(profile.teamId);
  const project = team ? await getProjectForTeam(team._id) : null;
  const [snapshot, activity] = await Promise.all([
    getDepartmentSnapshot(),
    getMemberActivity(team, project),
  ]);

  return (
    <div className="bg-black">
      <DashboardHero
        videoSrc="/videos/race.mp4"
        firstName={profile.name.split(" ")[0]}
        navItems={DASHBOARD_NAV_ITEMS}
        userName={profile.name}
        rank={profile.rank}
        points={profile.points}
        teamName={profile.teamName}
        signOutAction={async () => {
          "use server";
          await signOut({ redirectTo: "/" });
        }}
      />

      <div className="bg-background px-4 py-8 md:px-8">
        <div className="mx-auto max-w-5xl">
          <DashboardOverview
            profile={{
              name: profile.name,
              photoUrl: profile.photoUrl,
              role: profile.role,
              teamName: profile.teamName,
              points: profile.points,
              rank: profile.rank,
            }}
            team={team ? { name: team.name, isLeader: team.leaderId === String(user._id) } : null}
            project={project ? { title: project.title, status: project.status } : null}
            snapshot={snapshot}
            activity={activity}
          />
        </div>
      </div>
    </div>
  );
}
