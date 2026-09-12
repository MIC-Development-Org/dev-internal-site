import Link from "next/link";
import { getAllProjectsForAdmin } from "@/lib/data/projects";
import { getAllTeams } from "@/lib/data/teams";
import { Card, CardContent } from "@/components/ui/card";
import { ProjectStatusBadge } from "@/components/project-status-badge";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/f1/empty-state";
import { PROJECT_STATUSES, type ProjectStatus } from "@/lib/constants/project-status";
import { CreateProjectModal } from "@/components/admin/create-project-modal";
import { DeleteProjectButton } from "@/components/admin/delete-project-button";
import { Users, ExternalLink } from "lucide-react";

export default async function AdminProjectsPage({ searchParams }: PageProps<"/admin/projects">) {
  const params = await searchParams;
  const status = typeof params.status === "string" ? (params.status as ProjectStatus) : undefined;
  
  const [projects, teams] = await Promise.all([
    getAllProjectsForAdmin({ status }),
    getAllTeams(),
  ]);

  const teamOptions = teams.map((t) => ({
    _id: String(t._id),
    name: t.name,
    memberCount: t.memberIds.length,
  }));

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Project Management</h1>
          <p className="text-sm text-muted-foreground">
            Create, assign, review, and manage department projects.
          </p>
        </div>
        <CreateProjectModal teams={teamOptions} />
      </div>

      <form className="flex flex-wrap items-center gap-2" method="get">
        <Button type="submit" name="status" value="" variant={!status ? "default" : "outline"} size="sm">
          All
        </Button>
        {PROJECT_STATUSES.map((s) => (
          <Button key={s} type="submit" name="status" value={s} variant={status === s ? "default" : "outline"} size="sm">
            {s.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())}
          </Button>
        ))}
      </form>

      {projects.length === 0 ? (
        <EmptyState
          title="No projects found"
          description="No projects match this filter. You can add a new project using the button above."
        />
      ) : (
        <div className="space-y-3">
          {projects.map((p) => (
            <Card key={p._id} className="transition-colors hover:border-zinc-700">
              <CardContent className="flex flex-col gap-4 p-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="space-y-1.5 min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <Link
                      href={`/admin/projects/${p._id}`}
                      className="font-medium hover:text-red-500 hover:underline"
                    >
                      {p.title}
                    </Link>
                    <ProjectStatusBadge status={p.status} />
                  </div>

                  <p className="line-clamp-1 text-xs text-muted-foreground">
                    {p.description}
                  </p>

                  <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                    <span className="inline-flex items-center gap-1 font-mono">
                      <Users className="size-3 text-zinc-500" />
                      {p.teamName === "Unassigned" ? (
                        <span className="rounded bg-zinc-800 px-1.5 py-0.5 text-zinc-400">
                          Unassigned
                        </span>
                      ) : (
                        <span className="text-zinc-300 font-semibold">{p.teamName}</span>
                      )}
                    </span>

                    {p.techStack.length > 0 && (
                      <span className="flex items-center gap-1 truncate">
                        {p.techStack.slice(0, 3).map((t) => (
                          <span key={t} className="rounded bg-muted px-1.5 py-0.2 text-[10px]">
                            {t}
                          </span>
                        ))}
                        {p.techStack.length > 3 && (
                          <span className="text-[10px] text-zinc-500">+{p.techStack.length - 3}</span>
                        )}
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                  <Button
                    render={<Link href={`/admin/projects/${p._id}`} />}
                    nativeButton={false}
                    variant="outline"
                    size="sm"
                    className="h-8 gap-1 text-xs"
                  >
                    Manage
                    <ExternalLink className="size-3" />
                  </Button>
                  <DeleteProjectButton projectId={p._id} projectTitle={p.title} />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
