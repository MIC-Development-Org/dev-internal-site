import { notFound } from "next/navigation";
import { getMemberProfile } from "@/lib/data/users";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
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
              {profile.teamName ? `Team: ${profile.teamName}` : "Not part of a team yet"}
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

      {(profile.hobbies || profile.techStack?.length || profile.portfolioUrl || profile.linkedinUrl || profile.githubUrl) && (
        <Card>
          <CardHeader>
            <CardTitle>About</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {profile.hobbies && <p className="text-sm text-muted-foreground">{profile.hobbies}</p>}
            {profile.techStack && profile.techStack.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {profile.techStack.map((t) => (
                  <span key={t} className="rounded-full bg-muted px-2 py-0.5 text-xs">
                    {t}
                  </span>
                ))}
              </div>
            )}
            {(profile.portfolioUrl || profile.linkedinUrl || profile.githubUrl) && (
              <div className="flex flex-wrap gap-2">
                {profile.portfolioUrl && (
                  <Button
                    render={<a href={profile.portfolioUrl} target="_blank" rel="noreferrer" />}
                    nativeButton={false}
                    variant="outline"
                    size="sm"
                  >
                    Portfolio
                  </Button>
                )}
                {profile.linkedinUrl && (
                  <Button
                    render={<a href={profile.linkedinUrl} target="_blank" rel="noreferrer" />}
                    nativeButton={false}
                    variant="outline"
                    size="sm"
                  >
                    LinkedIn
                  </Button>
                )}
                {profile.githubUrl && (
                  <Button
                    render={<a href={profile.githubUrl} target="_blank" rel="noreferrer" />}
                    nativeButton={false}
                    variant="outline"
                    size="sm"
                  >
                    GitHub
                  </Button>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
