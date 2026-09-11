import { notFound } from "next/navigation";
import { getProjectById } from "@/lib/data/projects";
import { TeamModel } from "@/models/Team";
import { connectToDatabase } from "@/lib/mongodb";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ProjectStatusBadge } from "@/components/project-status-badge";
import { Button } from "@/components/ui/button";

export default async function ShowcaseDetailPage({ params }: PageProps<"/dashboard/showcase/[id]">) {
  const { id } = await params;
  const project = await getProjectById(id);
  if (!project || !["approved", "completed"].includes(project.status)) notFound();

  await connectToDatabase();
  const team = await TeamModel.findById(project.teamId).select("name").lean();

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">{project.title}</h1>
          <p className="text-sm text-muted-foreground">{team?.name ?? "Unknown team"}</p>
        </div>
        <ProjectStatusBadge status={project.status} />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>About</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">{project.description}</p>
          <div className="flex flex-wrap gap-1.5">
            {project.techStack.map((t) => (
              <span key={t} className="rounded-full bg-muted px-2 py-0.5 text-xs">
                {t}
              </span>
            ))}
          </div>
          <div className="flex gap-2">
            {project.repoUrl && (
              <Button
                render={<a href={project.repoUrl} target="_blank" rel="noreferrer" />}
                nativeButton={false}
                variant="outline"
                size="sm"
              >
                Repo
              </Button>
            )}
            {project.liveUrl && (
              <Button render={<a href={project.liveUrl} target="_blank" rel="noreferrer" />} nativeButton={false} size="sm">
                Live
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
