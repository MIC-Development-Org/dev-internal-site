import Link from "next/link";
import { getAdminDashboardStats } from "@/lib/data/dashboard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ProjectStatusBadge } from "@/components/project-status-badge";
import {
  Users,
  Flag,
  FolderKanban,
  UserX,
  CheckCircle2,
  Clock,
  ArrowRight,
} from "lucide-react";
import type { ProjectStatus } from "@/lib/constants/project-status";

const STATUS_ORDER: ProjectStatus[] = [
  "submitted",
  "under_review",
  "changes_requested",
  "approved",
  "in_progress",
  "completed",
];

function StatCard({
  label,
  value,
  sub,
  icon,
  href,
  accent,
}: {
  label: string;
  value: number | string;
  sub?: string;
  icon: React.ReactNode;
  href?: string;
  accent?: boolean;
}) {
  const inner = (
    <Card className={`transition-colors${href ? " hover:border-primary" : ""}${accent ? " border-primary/40" : ""}`}>
      <CardContent className="flex items-center gap-4 pt-6">
        <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-lg ${accent ? "bg-primary/20 text-primary" : "bg-muted text-muted-foreground"}`}>
          {icon}
        </div>
        <div className="min-w-0">
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            {label}
          </p>
          <p className="text-3xl font-bold tabular-nums">{value}</p>
          {sub && <p className="truncate text-xs text-muted-foreground">{sub}</p>}
        </div>
        {href && <ArrowRight className="ml-auto size-4 shrink-0 text-muted-foreground" />}
      </CardContent>
    </Card>
  );

  return href ? <Link href={href}>{inner}</Link> : inner;
}

function formatStatus(s: string) {
  return s.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

export default async function AdminDashboardPage() {
  const stats = await getAdminDashboardStats();

  const needsReview =
    (stats.projectsByStatus["submitted"] ?? 0) +
    (stats.projectsByStatus["under_review"] ?? 0);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold">Overview</h1>
        <p className="text-sm text-muted-foreground">
          Live snapshot of the department — all numbers pulled directly from the
          database.
        </p>
      </div>

      {/* ── Stat cards row ── */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Total Members"
          value={stats.totalMembers}
          sub={`${stats.totalSeniors} seniors · ${stats.totalFreshers} juniors`}
          icon={<Users className="size-6" />}
          href="/admin/users"
        />
        <StatCard
          label="Teams Formed"
          value={stats.totalTeams}
          sub={`${stats.teamsWithProject} have a project`}
          icon={<Flag className="size-6" />}
          href="/admin/teams"
        />
        <StatCard
          label="Projects"
          value={stats.totalProjects}
          sub={`${stats.projectsByStatus["completed"] ?? 0} completed`}
          icon={<FolderKanban className="size-6" />}
          href="/admin/projects"
        />
        <StatCard
          label="Needs Review"
          value={needsReview}
          sub="Submitted or under review"
          icon={<Clock className="size-6" />}
          href="/admin/projects?status=submitted"
          accent={needsReview > 0}
        />
      </div>

      {/* ── Unassigned members alert ── */}
      {stats.unassignedMembers > 0 && (
        <Link href="/admin/teams">
          <Card className="border-destructive/40 transition-colors hover:border-destructive">
            <CardContent className="flex items-center gap-3 pt-6 text-sm">
              <UserX className="size-5 text-destructive" />
              <span>
                <strong>{stats.unassignedMembers}</strong> member
                {stats.unassignedMembers !== 1 ? "s are" : " is"} not assigned
                to any team.
              </span>
              <ArrowRight className="ml-auto size-4 shrink-0 text-muted-foreground" />
            </CardContent>
          </Card>
        </Link>
      )}

      {/* ── Main two-column section ── */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Recent teams */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-base">Recent Teams</CardTitle>
            <Link
              href="/admin/teams"
              className="text-xs text-primary hover:underline"
            >
              View all
            </Link>
          </CardHeader>
          <CardContent className="divide-y divide-border">
            {stats.recentTeams.length === 0 ? (
              <p className="py-4 text-center text-sm text-muted-foreground">
                No teams yet.
              </p>
            ) : (
              stats.recentTeams.map((team) => (
                <Link
                  key={team._id}
                  href={`/admin/teams/${team._id}`}
                  className="flex items-center justify-between py-3 text-sm transition-opacity hover:opacity-70"
                >
                  <div>
                    <p className="font-medium">{team.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {team.memberCount} members · {team.points} pts
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    {team.hasProject ? (
                      <Badge variant="secondary" className="text-xs">
                        <CheckCircle2 className="mr-1 size-3" /> Project
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="text-xs">
                        No project
                      </Badge>
                    )}
                    <ArrowRight className="size-3.5 text-muted-foreground" />
                  </div>
                </Link>
              ))
            )}
          </CardContent>
        </Card>

        {/* Recent projects */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-base">Recent Projects</CardTitle>
            <Link
              href="/admin/projects"
              className="text-xs text-primary hover:underline"
            >
              View all
            </Link>
          </CardHeader>
          <CardContent className="divide-y divide-border">
            {stats.recentProjects.length === 0 ? (
              <p className="py-4 text-center text-sm text-muted-foreground">
                No projects yet.
              </p>
            ) : (
              stats.recentProjects.map((project) => (
                <Link
                  key={project._id}
                  href={`/admin/projects/${project._id}`}
                  className="flex items-center justify-between py-3 text-sm transition-opacity hover:opacity-70"
                >
                  <div className="min-w-0">
                    <p className="truncate font-medium">{project.title}</p>
                    <p className="text-xs text-muted-foreground">
                      {project.teamName}
                    </p>
                  </div>
                  <div className="ml-2 flex items-center gap-2">
                    <ProjectStatusBadge status={project.status} />
                    <ArrowRight className="size-3.5 shrink-0 text-muted-foreground" />
                  </div>
                </Link>
              ))
            )}
          </CardContent>
        </Card>
      </div>

      {/* ── Project pipeline breakdown ── */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Project Pipeline</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
            {STATUS_ORDER.map((status) => {
              const count = stats.projectsByStatus[status] ?? 0;
              return (
                <Link key={status} href={`/admin/projects?status=${status}`}>
                  <div className="rounded-lg border border-border p-3 text-center transition-colors hover:border-primary hover:bg-muted/40">
                    <p className="text-2xl font-bold tabular-nums">{count}</p>
                    <p className="mt-0.5 text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
                      {formatStatus(status)}
                    </p>
                  </div>
                </Link>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
