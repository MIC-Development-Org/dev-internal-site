import { notFound } from "next/navigation";
import { getProjectById } from "@/lib/data/projects";
import { TeamModel } from "@/models/Team";
import { connectToDatabase } from "@/lib/mongodb";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ProjectStatusForm } from "@/components/admin/project-status-form";

export default async function AdminProjectDetailPage({ params }: PageProps<"/admin/projects/[id]">) {
  const { id } = await params;
  const project = await getProjectById(id);
  if (!project) notFound();

  await connectToDatabase();
  const team = await TeamModel.findById(project.teamId).select("name").lean();

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">{project.title}</h1>
          <p className="text-sm text-muted-foreground">{team?.name ?? "Unknown team"}</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <p className="text-muted-foreground">{project.description}</p>
            <div className="flex flex-wrap gap-1.5">
              {project.techStack.map((t) => (
                <span key={t} className="rounded-full bg-muted px-2 py-0.5 text-xs">
                  {t}
                </span>
              ))}
            </div>
            {project.repoUrl && <p>Repo: {project.repoUrl}</p>}
            {project.liveUrl && <p>Live: {project.liveUrl}</p>}
          </CardContent>
        </Card>

        {project.feedback.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Feedback history</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {project.feedback
                .slice()
                .reverse()
                .map((f, i) => (
                  <div key={i} className="rounded-md border border-border bg-muted/30 p-3 text-sm">
                    <p>{f.note}</p>
                    <p className="mt-1 text-xs text-muted-foreground">{new Date(f.at).toLocaleString()}</p>
                  </div>
                ))}
            </CardContent>
          </Card>
        )}
      </div>

      <Card className="h-fit">
        <CardHeader>
          <CardTitle>Review</CardTitle>
        </CardHeader>
        <CardContent>
          <ProjectStatusForm key={project.status} projectId={project._id.toString()} status={project.status} />
        </CardContent>
      </Card>
    </div>
  );
}
