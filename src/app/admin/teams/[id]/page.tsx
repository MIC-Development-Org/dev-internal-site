import { notFound } from "next/navigation";
import { getTeamById, getUnassignedMembers } from "@/lib/data/teams";
import { getProjectForTeam } from "@/lib/data/projects";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ProjectStatusBadge } from "@/components/project-status-badge";
import { EditTeamForm } from "@/components/admin/edit-team-form";

export default async function AdminTeamDetailPage({ params }: PageProps<"/admin/teams/[id]">) {
  const { id } = await params;
  const team = await getTeamById(id);
  if (!team) notFound();

  const [unassigned, project] = await Promise.all([getUnassignedMembers(), getProjectForTeam(team._id)]);

  const candidates = [
    ...team.members.map((m) => ({ _id: String(m._id), name: m.name, email: m.email })),
    ...unassigned.map((u) => ({ _id: String(u._id), name: u.name, email: u.email })),
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">{team.name}</h1>
        {project && <ProjectStatusBadge status={project.status} />}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Roster</CardTitle>
        </CardHeader>
        <CardContent>
          <EditTeamForm
            teamId={team._id}
            name={team.name}
            leaderId={team.leaderId}
            memberIds={team.memberIds}
            candidates={candidates}
          />
        </CardContent>
      </Card>
    </div>
  );
}
