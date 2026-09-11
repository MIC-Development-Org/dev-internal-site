import Link from "next/link";
import { getAllProjectsForAdmin } from "@/lib/data/projects";
import { Card, CardContent } from "@/components/ui/card";
import { ProjectStatusBadge } from "@/components/project-status-badge";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/f1/empty-state";
import { PROJECT_STATUSES, type ProjectStatus } from "@/models/Project";

export default async function AdminProjectsPage({ searchParams }: PageProps<"/admin/projects">) {
  const params = await searchParams;
  const status = typeof params.status === "string" ? (params.status as ProjectStatus) : undefined;
  const projects = await getAllProjectsForAdmin({ status });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Project Management</h1>
        <p className="text-sm text-muted-foreground">Review queue for all submitted projects.</p>
      </div>

      <form className="flex flex-wrap items-center gap-2" method="get">
        <Button type="submit" name="status" value="" variant={!status ? "default" : "outline"} size="sm">
          All
        </Button>
        {PROJECT_STATUSES.map((s) => (
          <Button key={s} type="submit" name="status" value={s} variant={status === s ? "default" : "outline"} size="sm">
            {s.replace("_", " ")}
          </Button>
        ))}
      </form>

      {projects.length === 0 ? (
        <EmptyState title="No laps completed yet" description="No projects match this filter." />
      ) : (
        <div className="space-y-3">
          {projects.map((p) => (
            <Link key={p._id} href={`/admin/projects/${p._id}`}>
              <Card className="transition-colors hover:border-primary">
                <CardContent className="flex items-center justify-between pt-6">
                  <div>
                    <p className="font-medium">{p.title}</p>
                    <p className="text-xs text-muted-foreground">{p.teamName}</p>
                  </div>
                  <ProjectStatusBadge status={p.status} />
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
