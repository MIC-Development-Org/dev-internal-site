import { requireUser } from "@/lib/dal";
import { getMemberProfile } from "@/lib/data/users";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { RoleBadge } from "@/components/role-badge";
import { PodiumBadge } from "@/components/f1/podium-badge";
import { ProfileEditForm } from "@/components/dashboard/profile-edit-form";

export default async function ProfilePage() {
  const user = await requireUser();
  const profile = await getMemberProfile(String(user._id));
  if (!profile) return null;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">My Profile</h1>
        <p className="text-sm text-muted-foreground">How the paddock sees you.</p>
      </div>

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
            <p className="text-sm text-muted-foreground">{profile.email}</p>
            {profile.batch && <p className="text-sm text-muted-foreground">{profile.batch}</p>}
            {profile.teamName && (
              <p className="text-sm text-muted-foreground">Team: {profile.teamName}</p>
            )}
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

      <Card>
        <CardHeader>
          <CardTitle>Edit profile</CardTitle>
        </CardHeader>
        <CardContent>
          <ProfileEditForm batch={profile.batch ?? ""} photoUrl={profile.photoUrl ?? ""} />
        </CardContent>
      </Card>
    </div>
  );
}
