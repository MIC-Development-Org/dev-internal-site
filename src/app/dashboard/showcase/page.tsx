import Link from "next/link";
import { getShowcaseProjects } from "@/lib/data/projects";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ProjectStatusBadge } from "@/components/project-status-badge";
import { EmptyState } from "@/components/f1/empty-state";
import { Button } from "@/components/ui/button";
import type { ProjectStatus } from "@/models/Project";

export default async function ShowcasePage({
  searchParams,
}: PageProps<"/dashboard/showcase">) {
  const params = await searchParams;
  const status = typeof params.status === "string" ? (params.status as ProjectStatus) : undefined;
  const tech = typeof params.tech === "string" ? params.tech : undefined;

  const projects = await getShowcaseProjects({ status, tech });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Showcase</h1>
        <p className="text-sm text-muted-foreground">Approved and completed projects from across the grid.</p>
      </div>

      <form className="flex flex-wrap items-center gap-2" method="get">
        <Button type="submit" name="status" value="" variant={!status ? "default" : "outline"} size="sm">
          All
        </Button>
        <Button type="submit" name="status" value="approved" variant={status === "approved" ? "default" : "outline"} size="sm">
          Approved
        </Button>
        <Button type="submit" name="status" value="completed" variant={status === "completed" ? "default" : "outline"} size="sm">
          Completed
        </Button>
      </form>

      {projects.length === 0 ? (
        <EmptyState title="No laps completed yet" description="No approved projects to show yet." />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {projects.map((p) => (
            <Link key={p._id} href={`/dashboard/showcase/${p._id}`}>
              <Card className="h-full transition-colors hover:border-primary">
                <CardHeader>
                  <div className="flex items-start justify-between gap-2">
                    <CardTitle className="text-base">{p.title}</CardTitle>
                    <ProjectStatusBadge status={p.status} />
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <p className="text-xs text-muted-foreground">{p.teamName}</p>
                  <p className="line-clamp-2 text-sm text-muted-foreground">{p.description}</p>
                  <div className="flex flex-wrap gap-1.5">
                    {p.techStack.map((t) => (
                      <span key={t} className="rounded-full bg-muted px-2 py-0.5 text-xs">
                        {t}
                      </span>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
