import { requireUser } from "@/lib/dal";
import {
  getMyTeam,
  TEAM_MAX_MEMBERS,
  TEAM_MAX_SENIORS,
  TEAM_MIN_MEMBERS,
  TEAM_MIN_SENIORS,
} from "@/lib/data/teams";
import { getSettings } from "@/lib/data/settings";
import { getProjectForTeam } from "@/lib/data/projects";
import { isDeadlinePassed } from "@/lib/deadline";
import { ALLOWED_EMAIL_DOMAIN } from "@/auth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
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
            <p className="text-sm text-muted-foreground">
              Create your team and add your teammates before team formation closes.
            </p>
          </div>
          {deadline && <CountdownClock deadlineIso={deadline.toISOString()} />}
        </div>

        {closed ? (
          <EmptyState
            title="You haven't joined a team yet."
            description="Team formation is closed. Ask an admin to assign you to a team."
          />
        ) : (
          <Card className="max-w-xl">
            <CardHeader>
              <CardTitle>Create your team</CardTitle>
              <CardDescription>
                Name your team and add your teammates by their VIT email.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <TeamFormationForm
                domain={ALLOWED_EMAIL_DOMAIN}
                minMembers={TEAM_MIN_MEMBERS}
                maxMembers={TEAM_MAX_MEMBERS}
                minSeniors={TEAM_MIN_SENIORS}
                maxSeniors={TEAM_MAX_SENIORS}
              />
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
          <p className="text-sm text-muted-foreground">Your team members.</p>
        </div>
        <div className="text-right">
          <p className="text-2xl font-bold tabular-nums">{team.points}</p>
          <p className="text-xs text-muted-foreground">team points</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Team members ({team.members.length})</CardTitle>
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
              No project submitted yet — head to My Project to submit yours.
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
