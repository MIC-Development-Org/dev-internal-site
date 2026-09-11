import Link from "next/link";
import { requireUser } from "@/lib/dal";
import { getMyTeam } from "@/lib/data/teams";
import { getProjectForTeam } from "@/lib/data/projects";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/f1/empty-state";
import { ProjectStatusBadge } from "@/components/project-status-badge";
import { ProjectProgressTracker } from "@/components/dashboard/project-progress-tracker";
import { ProjectForm } from "@/components/dashboard/project-form";

export default async function ProjectPage() {
  const user = await requireUser();
  const team = await getMyTeam(user.teamId ? String(user.teamId) : null);

  if (!team) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold">My Project</h1>
        <EmptyState
          title="No project submitted yet"
          description="You need to be part of a team before you can submit a project."
          action={
            <Button render={<Link href="/dashboard/team" />} nativeButton={false} size="sm" variant="outline">
              Go to My Team
            </Button>
          }
        />
      </div>
    );
  }

  const project = await getProjectForTeam(team._id);
  const isLeader = team.leaderId === String(user._id);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">My Project</h1>
        {project && <ProjectStatusBadge status={project.status} />}
      </div>

      {project && (
        <Card>
          <CardContent className="overflow-x-auto pt-6">
            <ProjectProgressTracker status={project.status} />
          </CardContent>
        </Card>
      )}

      {!isLeader && !project && (
        <EmptyState
          title="No project submitted yet"
          description="Only your team leader can submit the project for your team."
        />
      )}

      {isLeader && (
        <Card>
          <CardHeader>
            <CardTitle>{project ? "Edit project" : "Submit project"}</CardTitle>
          </CardHeader>
          <CardContent>
            <ProjectForm
              key={project ? "edit" : "create"}
              defaults={
                project
                  ? {
                      title: project.title,
                      description: project.description,
                      techStack: project.techStack,
                      repoUrl: project.repoUrl ?? "",
                      liveUrl: project.liveUrl ?? "",
                    }
                  : undefined
              }
            />
          </CardContent>
        </Card>
      )}

      {!isLeader && project && (
        <Card>
          <CardHeader>
            <CardTitle>{project.title}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <p className="text-muted-foreground">{project.description}</p>
            <div className="flex flex-wrap gap-1.5">
              {project.techStack.map((t) => (
                <span key={t} className="rounded-full bg-muted px-2 py-0.5 text-xs">
                  {t}
                </span>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {project && project.feedback.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Review feedback</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {project.feedback
              .slice()
              .reverse()
              .map((f, i) => (
                <div key={i} className="rounded-md border border-border bg-muted/30 p-3 text-sm">
                  <p>{f.note}</p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {new Date(f.at).toLocaleString()}
                  </p>
                </div>
              ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
