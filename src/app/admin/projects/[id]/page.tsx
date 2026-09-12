import Link from "next/link";
import { notFound } from "next/navigation";
import { getProjectById } from "@/lib/data/projects";
import { getAllTeams, getTeamById } from "@/lib/data/teams";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ProjectStatusBadge } from "@/components/project-status-badge";
import { ProjectStatusForm } from "@/components/admin/project-status-form";
import { EditProjectForm } from "@/components/admin/edit-project-form";
import { DeleteProjectButton } from "@/components/admin/delete-project-button";
import { ArrowLeft, Users, Shield, User } from "lucide-react";

export default async function AdminProjectDetailPage({ params }: PageProps<"/admin/projects/[id]">) {
  const { id } = await params;
  const project = await getProjectById(id);
  if (!project) notFound();

  const [allTeams, team] = await Promise.all([
    getAllTeams(),
    project.teamId ? getTeamById(String(project.teamId)) : null,
  ]);

  const teamOptions = allTeams.map((t) => ({
    _id: String(t._id),
    name: t.name,
    memberCount: t.memberIds.length,
  }));

  return (
    <div className="space-y-6">
      {/* ── HEADER ── */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <Link
            href="/admin/projects"
            className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="size-3.5" />
            Back to Projects
          </Link>
          <div className="flex flex-wrap items-center gap-2 pt-1">
            <h1 className="text-2xl font-bold">{project.title}</h1>
            <ProjectStatusBadge status={project.status} />
          </div>
          <p className="text-sm text-muted-foreground">
            {team ? `Assigned to ${team.name}` : "Unassigned project"}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <DeleteProjectButton
            projectId={String(project._id)}
            projectTitle={project.title}
            redirectOnSuccess={true}
          />
        </div>
      </div>

      {/* ── MAIN CONTENT GRID ── */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left 2 Cols: Edit Project Form & Team Info */}
        <div className="space-y-6 lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Edit Project & Team Assignment</CardTitle>
            </CardHeader>
            <CardContent>
              <EditProjectForm
                key={`${project._id}-${project.teamId}`}
                projectId={String(project._id)}
                defaults={{
                  title: project.title,
                  description: project.description,
                  techStack: project.techStack ?? [],
                  repoUrl: project.repoUrl ?? "",
                  liveUrl: project.liveUrl ?? "",
                  status: project.status,
                  teamId: project.teamId ? String(project.teamId) : null,
                }}
                teams={teamOptions}
              />
            </CardContent>
          </Card>

          {/* Assigned Team Details (if assigned) */}
          {team && (
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <Users className="size-4 text-red-500" />
                    Assigned Team: {team.name}
                  </CardTitle>
                  <Link
                    href={`/admin/teams/${team._id}`}
                    className="text-xs text-red-400 hover:underline"
                  >
                    View Team Details
                  </Link>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="space-y-2">
                  <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Team Members ({team.members.length})
                  </p>
                  <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                    {team.members.map((m) => {
                      const isLeader = String(m._id) === team.leaderId;
                      return (
                        <div
                          key={String(m._id)}
                          className="flex items-center gap-2.5 rounded-lg border border-border bg-muted/20 p-2.5 text-xs"
                        >
                          <div className="flex size-7 items-center justify-center rounded-full bg-zinc-800 font-mono text-xs">
                            {m.name.charAt(0).toUpperCase()}
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="font-medium truncate flex items-center gap-1">
                              {m.name}
                              {isLeader && (
                                <span className="inline-flex items-center gap-0.5 rounded bg-amber-500/10 px-1 py-0.2 text-[9px] font-semibold text-amber-400">
                                  <Shield className="size-2.5" />
                                  Leader
                                </span>
                              )}
                            </p>
                            <p className="truncate text-muted-foreground">{m.email}</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Right Col: Status Review & Feedback History */}
        <div className="space-y-6">
          <Card className="h-fit">
            <CardHeader>
              <CardTitle>Review & Feedback</CardTitle>
            </CardHeader>
            <CardContent>
              <ProjectStatusForm
                key={project.status}
                projectId={project._id.toString()}
                status={project.status}
              />
            </CardContent>
          </Card>

          {project.feedback && project.feedback.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Feedback History ({project.feedback.length})</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {project.feedback
                  .slice()
                  .reverse()
                  .map((f, i) => (
                    <div
                      key={i}
                      className="rounded-lg border border-border bg-muted/30 p-3 text-sm"
                    >
                      <p className="text-zinc-200">{f.note}</p>
                      <p className="mt-1.5 text-xs text-muted-foreground font-mono">
                        {new Date(f.at).toLocaleString()}
                      </p>
                    </div>
                  ))}
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
