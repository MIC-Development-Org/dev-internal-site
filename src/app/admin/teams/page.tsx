import Link from "next/link";
import { getAllTeams, getUnassignedMembers, countSeniors, TEAM_MIN_MEMBERS, TEAM_MAX_MEMBERS, TEAM_MIN_SENIORS, TEAM_MAX_SENIORS } from "@/lib/data/teams";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CreateTeamForm } from "@/components/admin/create-team-form";
import { EmptyState } from "@/components/f1/empty-state";
import { SearchBox } from "@/components/list/search-box";
import { Pagination } from "@/components/list/pagination";
import { buildHref, firstParam, paginate, parseEnum, parsePage } from "@/lib/list-params";
import { cn } from "@/lib/utils";

const PATH = "/admin/teams";
const PAGE_SIZE = 20;
const SORTS = ["newest", "name", "points", "members"] as const;
const SORT_LABELS: Record<(typeof SORTS)[number], string> = {
  newest: "Newest",
  name: "Name A–Z",
  points: "Points",
  members: "Members",
};

export default async function AdminTeamsPage({ searchParams }: PageProps<"/admin/teams">) {
  const params = await searchParams;
  const q = firstParam(params.q).toLowerCase();
  const sort = parseEnum(params.sort, SORTS, "newest");
  const issuesOnly = firstParam(params.issues) === "1";

  const [allTeams, unassigned] = await Promise.all([getAllTeams(), getUnassignedMembers()]);

  const hasIssues = (t: (typeof allTeams)[number]) => {
    const seniors = countSeniors(t.members);
    return (
      t.members.length < TEAM_MIN_MEMBERS ||
      t.members.length > TEAM_MAX_MEMBERS ||
      seniors < TEAM_MIN_SENIORS ||
      seniors > TEAM_MAX_SENIORS
    );
  };

  const matching = allTeams.filter(
    (t) =>
      (!issuesOnly || hasIssues(t)) &&
      (!q || t.name.toLowerCase().includes(q) || t.members.some((m) => m.name.toLowerCase().includes(q) || m.email.toLowerCase().includes(q)))
  );
  matching.sort((a, b) => {
    switch (sort) {
      case "name":
        return a.name.localeCompare(b.name);
      case "points":
        return b.points - a.points || a.name.localeCompare(b.name);
      case "members":
        return b.members.length - a.members.length || a.name.localeCompare(b.name);
      default:
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    }
  });
  const { items: teams, page, totalPages, total } = paginate(matching, parsePage(params.page), PAGE_SIZE);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="page-title">Team Management</h1>
        <p className="text-sm text-muted-foreground">{allTeams.length} teams created.</p>
      </div>

      {unassigned.length > 0 && (
        <Card className="border-primary/40">
          <CardHeader>
            <CardTitle className="text-base">Unassigned members ({unassigned.length})</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-1.5">
            {unassigned.map((u) => (
              <Badge key={String(u._id)} variant="outline">
                {u.name}
              </Badge>
            ))}
          </CardContent>
        </Card>
      )}

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="space-y-3">
          <div className="flex flex-col gap-2">
            <SearchBox placeholder="Search team or member..." />
            <nav aria-label="Sort teams" className="flex flex-wrap items-center gap-1 text-xs text-muted-foreground">
              Sort
              {SORTS.map((key) => (
                <Link
                  key={key}
                  href={buildHref(PATH, params, { sort: key === "newest" ? undefined : key, page: undefined })}
                  aria-current={sort === key ? "true" : undefined}
                  className={cn("rounded-md px-2 py-1 transition-colors hover:text-foreground", sort === key && "bg-muted text-foreground")}
                >
                  {SORT_LABELS[key]}
                </Link>
              ))}
              <Link
                href={buildHref(PATH, params, { issues: issuesOnly ? undefined : "1", page: undefined })}
                aria-pressed={issuesOnly}
                className={cn(
                  "ml-auto rounded-md border px-2 py-1 transition-colors",
                  issuesOnly ? "border-destructive text-destructive" : "border-border hover:text-foreground"
                )}
              >
                Out of range only
              </Link>
            </nav>
          </div>
          {teams.length === 0 ? (
            <EmptyState
              title={allTeams.length === 0 ? "No teams yet." : "No teams match."}
              description={allTeams.length === 0 ? "No teams have been created." : "Try a different search or clear the filters."}
            />
          ) : (
            teams.map((team) => {
              const seniors = countSeniors(team.members);
              const sizeOk = team.members.length >= TEAM_MIN_MEMBERS && team.members.length <= TEAM_MAX_MEMBERS;
              const seniorsOk = seniors >= TEAM_MIN_SENIORS && seniors <= TEAM_MAX_SENIORS;
              return (
                <Link key={team._id} href={`/admin/teams/${team._id}`}>
                  <Card className="transition-colors hover:border-primary">
                    <CardContent className="flex items-center justify-between pt-6">
                      <div>
                        <p className="font-medium">{team.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {team.members.length} members · {seniors} seniors · {team.points} pts
                        </p>
                      </div>
                      {(!sizeOk || !seniorsOk) && <Badge variant="destructive">Out of range</Badge>}
                    </CardContent>
                  </Card>
                </Link>
              );
            })
          )}
          <Pagination path={PATH} params={params} page={page} totalPages={totalPages} total={total} pageSize={PAGE_SIZE} />
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Create team</CardTitle>
          </CardHeader>
          <CardContent>
            <CreateTeamForm candidates={unassigned.map((u) => ({ _id: String(u._id), name: u.name, email: u.email }))} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
