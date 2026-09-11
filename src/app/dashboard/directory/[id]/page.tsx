import { notFound } from "next/navigation";
import { getMemberProfile } from "@/lib/data/users";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { RoleBadge } from "@/components/role-badge";
import { PodiumBadge } from "@/components/f1/podium-badge";

export default async function MemberProfilePage({ params }: PageProps<"/dashboard/directory/[id]">) {
  const { id } = await params;
  const profile = await getMemberProfile(id);
  if (!profile) notFound();

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Member Profile</h1>
      <Card>
        <CardContent className="flex flex-wrap items-center gap-6 pt-6">
          <Avatar className="h-20 w-20">
            <AvatarImage src={profile.photoUrl} alt={profile.name} />
            <AvatarFallback className="text-xl">{profile.name.slice(0, 2).toUpperCase()}</AvatarFallback>
          </Avatar>
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-semibold">{profile.name}</h2>
              <RoleBadge role={profile.role} />
            </div>
            {profile.batch && <p className="text-sm text-muted-foreground">{profile.batch}</p>}
            <p className="text-sm text-muted-foreground">
              {profile.teamName ? `Team: ${profile.teamName}` : "No garage yet."}
            </p>
          </div>
          <div className="ml-auto flex items-center gap-3">
            <PodiumBadge rank={profile.rank} />
            <div>
              <p className="text-2xl font-bold tabular-nums">{profile.points}</p>
              <p className="text-xs text-muted-foreground">points · P{profile.rank}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
