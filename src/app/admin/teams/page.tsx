import Link from "next/link";
import { getAllTeams, getUnassignedMembers, countSeniors, TEAM_MIN_MEMBERS, TEAM_MAX_MEMBERS, TEAM_MIN_SENIORS, TEAM_MAX_SENIORS } from "@/lib/data/teams";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CreateTeamForm } from "@/components/admin/create-team-form";
import { EmptyState } from "@/components/f1/empty-state";

export default async function AdminTeamsPage() {
  const [teams, unassigned] = await Promise.all([getAllTeams(), getUnassignedMembers()]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Team Management</h1>
        <p className="text-sm text-muted-foreground">{teams.length} constructors on the grid.</p>
      </div>

      {unassigned.length > 0 && (
        <Card className="border-primary/40">
          <CardHeader>
            <CardTitle className="text-base">Unassigned members ({unassigned.length})</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-1.5">
            {unassigned.map((u) => (
              <Badge key={String(u._id)} variant="outline">
                {u.name}
              </Badge>
            ))}
          </CardContent>
        </Card>
      )}

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="space-y-3">
          {teams.length === 0 ? (
            <EmptyState title="No garages yet." description="No teams have been created." />
          ) : (
            teams.map((team) => {
              const seniors = countSeniors(team.members);
              const sizeOk = team.members.length >= TEAM_MIN_MEMBERS && team.members.length <= TEAM_MAX_MEMBERS;
              const seniorsOk = seniors >= TEAM_MIN_SENIORS && seniors <= TEAM_MAX_SENIORS;
              return (
                <Link key={team._id} href={`/admin/teams/${team._id}`}>
                  <Card className="transition-colors hover:border-primary">
                    <CardContent className="flex items-center justify-between pt-6">
                      <div>
                        <p className="font-medium">{team.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {team.members.length} members · {seniors} seniors · {team.points} pts
                        </p>
                      </div>
                      {(!sizeOk || !seniorsOk) && <Badge variant="destructive">Out of range</Badge>}
                    </CardContent>
                  </Card>
                </Link>
              );
            })
          )}
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Create team</CardTitle>
          </CardHeader>
          <CardContent>
            <CreateTeamForm candidates={unassigned.map((u) => ({ _id: String(u._id), name: u.name, email: u.email }))} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
