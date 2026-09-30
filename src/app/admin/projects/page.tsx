import Link from "next/link";
import { getAllProjectsForAdmin } from "@/lib/data/projects";
import { getAllTeams } from "@/lib/data/teams";
import { Card, CardContent } from "@/components/ui/card";
import { ProjectStatusBadge } from "@/components/project-status-badge";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/f1/empty-state";
import { PROJECT_STATUSES } from "@/lib/constants/project-status";
import { CreateProjectModal } from "@/components/admin/create-project-modal";
import { DeleteProjectButton } from "@/components/admin/delete-project-button";
import { Users, ExternalLink } from "lucide-react";
import { SearchBox } from "@/components/list/search-box";
import { Pagination } from "@/components/list/pagination";
import { buildHref, firstParam, paginate, parseEnum, parsePage } from "@/lib/list-params";
import { cn } from "@/lib/utils";

const PATH = "/admin/projects";
const PAGE_SIZE = 20;
const SORTS = ["updated", "newest", "title", "status", "team"] as const;
const SORT_LABELS: Record<(typeof SORTS)[number], string> = {
  updated: "Recently updated",
  newest: "Newest",
  title: "Title A–Z",
  status: "Status",
  team: "Team A–Z",
};

export default async function AdminProjectsPage({ searchParams }: PageProps<"/admin/projects">) {
  const params = await searchParams;
  const status = parseEnum(params.status, ["", ...PROJECT_STATUSES] as const, "") || undefined;
  const q = firstParam(params.q).toLowerCase();
  const sort = parseEnum(params.sort, SORTS, "updated");

  const [allProjects, teams] = await Promise.all([
    getAllProjectsForAdmin({ status }),
    getAllTeams(),
  ]);

  const matching = allProjects.filter(
    (p) =>
      !q ||
      p.title.toLowerCase().includes(q) ||
      p.teamName.toLowerCase().includes(q) ||
      p.techStack.some((t) => t.toLowerCase().includes(q))
  );
  matching.sort((a, b) => {
    switch (sort) {
      case "title":
        return a.title.localeCompare(b.title);
      case "status":
        return PROJECT_STATUSES.indexOf(a.status) - PROJECT_STATUSES.indexOf(b.status) || a.title.localeCompare(b.title);
      case "team":
        return a.teamName.localeCompare(b.teamName) || a.title.localeCompare(b.title);
      case "newest":
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      default:
        return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
    }
  });
  const { items: projects, page, totalPages, total } = paginate(matching, parsePage(params.page), PAGE_SIZE);

  const teamOptions = teams.map((t) => ({
    _id: String(t._id),
    name: t.name,
    memberCount: t.memberIds.length,
  }));
  const statusLabel = (s: string) => s.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="page-title">Project Management</h1>
          <p className="text-sm text-muted-foreground">
            Create, assign, review, and manage department projects.
          </p>
        </div>
        <CreateProjectModal teams={teamOptions} />
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <SearchBox placeholder="Search title, team or technology..." />
        <nav aria-label="Sort projects" className="flex items-center gap-2 text-xs text-muted-foreground">
          Sort
          {SORTS.map((key) => (
            <Link
              key={key}
              href={buildHref(PATH, params, { sort: key === "updated" ? undefined : key, page: undefined })}
              aria-current={sort === key ? "true" : undefined}
              className={cn("rounded-md px-2 py-1 transition-colors hover:text-foreground", sort === key && "bg-muted text-foreground")}
            >
              {SORT_LABELS[key]}
            </Link>
          ))}
        </nav>
      </div>

      <nav aria-label="Filter by status" className="flex flex-wrap items-center gap-2">
        <Button
          render={<Link href={buildHref(PATH, params, { status: undefined, page: undefined })} />}
          nativeButton={false}
          variant={!status ? "default" : "outline"}
          size="sm"
        >
          All
        </Button>
        {PROJECT_STATUSES.map((s) => (
          <Button
            key={s}
            render={<Link href={buildHref(PATH, params, { status: s, page: undefined })} />}
            nativeButton={false}
            variant={status === s ? "default" : "outline"}
            size="sm"
          >
            {statusLabel(s)}
          </Button>
        ))}
      </nav>

      {projects.length === 0 ? (
        <EmptyState
          title="No projects found"
          description="No projects match these filters. Clear the search or add a new project using the button above."
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

      <Pagination path={PATH} params={params} page={page} totalPages={totalPages} total={total} pageSize={PAGE_SIZE} />
    </div>
  );
}
