import { requireUser } from "@/lib/dal";
import { getMyTeam } from "@/lib/data/teams";
import { getSettings } from "@/lib/data/settings";
import { getProjectForTeam } from "@/lib/data/projects";
import { isDeadlinePassed } from "@/lib/deadline";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { RoleBadge } from "@/components/role-badge";
import { ProjectStatusBadge } from "@/components/project-status-badge";
import { EmptyState } from "@/components/f1/empty-state";
import { CountdownClock } from "@/components/f1/countdown-clock";
import { TeamFormationForm } from "@/components/dashboard/team-formation-form";

export default async function TeamPage() {
  const user = await requireUser();
  const team = await getMyTeam(user.teamId ? String(user.teamId) : null);

  if (!team) {
    const settings = await getSettings();
    const deadline = settings.teamFormationDeadline;
    const closed = !settings.formationPhaseOpen || isDeadlinePassed(deadline);

    return (
      <div className="space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold">Team Formation</h1>
            <p className="text-sm text-muted-foreground">Build your constructor before lights out.</p>
          </div>
          {deadline && <CountdownClock deadlineIso={deadline.toISOString()} />}
        </div>

        {closed ? (
          <EmptyState
            title="No garage yet."
            description="Team formation is closed. Ask an admin to assign you to a team."
          />
        ) : (
          <Card>
            <CardHeader>
              <CardTitle>Form your constructor</CardTitle>
            </CardHeader>
            <CardContent>
              <TeamFormationForm />
            </CardContent>
          </Card>
        )}
      </div>
    );
  }

  const project = await getProjectForTeam(team._id);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">{team.name}</h1>
          <p className="text-sm text-muted-foreground">Your constructor roster.</p>
        </div>
        <div className="text-right">
          <p className="text-2xl font-bold tabular-nums">{team.points}</p>
          <p className="text-xs text-muted-foreground">team points</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Roster ({team.members.length})</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {team.members.map((member) => (
            <div key={String(member._id)} className="flex items-center gap-3">
              <Avatar className="h-9 w-9">
                <AvatarImage src={member.photoUrl} alt={member.name} />
                <AvatarFallback>{member.name.slice(0, 2).toUpperCase()}</AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <p className="text-sm font-medium">
                  {member.name}
                  {String(member._id) === team.leaderId && (
                    <span className="ml-1.5 text-xs text-primary">(Leader)</span>
                  )}
                </p>
                <p className="text-xs text-muted-foreground">{member.email}</p>
              </div>
              <RoleBadge role={member.role} />
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Project</CardTitle>
        </CardHeader>
        <CardContent>
          {project ? (
            <div className="flex items-center justify-between">
              <p className="font-medium">{project.title}</p>
              <ProjectStatusBadge status={project.status} />
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">
              No laps completed yet — head to My Project to submit.
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
