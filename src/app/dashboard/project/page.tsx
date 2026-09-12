import Link from "next/link";
import { requireUser } from "@/lib/dal";
import { getMyTeam } from "@/lib/data/teams";
import { getProjectForTeam, getAvailableProjects } from "@/lib/data/projects";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/f1/empty-state";
import { ProjectStatusBadge } from "@/components/project-status-badge";
import { ProjectProgressTracker } from "@/components/dashboard/project-progress-tracker";
import { ClaimProjectCard } from "@/components/dashboard/claim-project-card";
import { ProjectRepoForm } from "@/components/dashboard/project-repo-form";
import { ReleaseProjectButton } from "@/components/dashboard/release-project-button";
import { Globe, ExternalLink, FolderGit2 } from "lucide-react";

function GithubIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      width="16"
      height="16"
      stroke="currentColor"
      strokeWidth="2"
      fill="none"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
      <path d="M9 18c-4.51 2-5-2-7-2" />
    </svg>
  );
}

export default async function ProjectPage() {
  const user = await requireUser();
  const team = await getMyTeam(user.teamId ? String(user.teamId) : null);

  // 1. User has no team
  if (!team) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">My Project</h1>
          <p className="text-sm text-muted-foreground">Submit and track your team's project.</p>
        </div>
        <EmptyState
          title="No team joined yet"
          description="You need to be part of a team before you can choose or view your project."
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

  // 2. Team has NO project assigned yet -> Show Available Projects Pool
  if (!project) {
    const availableProjects = await getAvailableProjects();

    return (
      <div className="space-y-6">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold">Pick a Project</h1>
            <span className="rounded-full bg-red-500/10 px-2 py-0.5 text-xs font-semibold text-red-500">
              Team: {team.name}
            </span>
          </div>
          <p className="text-sm text-muted-foreground">
            Browse the available projects created by department admins and select one for your team to build.
          </p>
        </div>

        {availableProjects.length === 0 ? (
          <EmptyState
            title="No available projects right now"
            description="All projects are currently claimed or awaiting assignment from admins. Please check back soon."
          />
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {availableProjects.map((p) => (
              <ClaimProjectCard key={p._id} project={p} isLeader={isLeader} />
            ))}
          </div>
        )}
      </div>
    );
  }

  // 3. Team HAS an assigned project
  return (
    <div className="space-y-6">
      {/* ── HEADER ── */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold">{project.title}</h1>
            <ProjectStatusBadge status={project.status} />
          </div>
          <p className="text-xs text-muted-foreground">
            Team: <span className="font-semibold text-zinc-300">{team.name}</span>
          </p>
        </div>

        {isLeader && project.status === "submitted" && (
          <ReleaseProjectButton />
        )}
      </div>

      {/* ── PROGRESS TRACKER ── */}
      <Card>
        <CardContent className="overflow-x-auto pt-6">
          <ProjectProgressTracker status={project.status} />
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left 2 Columns: Project Details & Feedback */}
        <div className="space-y-6 lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Project Scope & Description</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm leading-relaxed text-zinc-300 whitespace-pre-wrap">
                {project.description}
              </p>

              {project.techStack && project.techStack.length > 0 && (
                <div className="space-y-1.5 pt-2 border-t border-border/40">
                  <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Technologies
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {project.techStack.map((t) => (
                      <span key={t} className="rounded-md bg-muted px-2 py-0.5 font-mono text-xs text-zinc-200">
                        {t}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Feedback History */}
          {project.feedback && project.feedback.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Admin Feedback History</CardTitle>
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

        {/* Right Column: GitHub Repository Links */}
        <div className="space-y-6">
          <Card className="h-fit">
            <CardHeader>
              <div className="flex items-center gap-2">
                <FolderGit2 className="size-4 text-red-500" />
                <CardTitle className="text-base">Repository & Links</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {isLeader ? (
                <div>
                  <ProjectRepoForm
                    defaults={{
                      repoUrl: project.repoUrl ?? "",
                      liveUrl: project.liveUrl ?? "",
                      techStack: project.techStack ?? [],
                    }}
                  />
                </div>
              ) : (
                <div className="space-y-3 text-sm">
                  {project.repoUrl ? (
                    <div className="space-y-2">
                      <p className="text-xs text-muted-foreground">GitHub Repository:</p>
                      <a
                        href={project.repoUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-muted/40 px-3 py-2 text-xs font-mono text-zinc-200 hover:bg-muted hover:text-white"
                      >
                        <GithubIcon className="size-3.5" />
                        <span className="truncate">{project.repoUrl}</span>
                        <ExternalLink className="size-3 shrink-0" />
                      </a>
                    </div>
                  ) : (
                    <div className="rounded-lg border border-dashed border-border p-4 text-center text-xs text-muted-foreground">
                      <p>No GitHub repository link added yet.</p>
                      <p className="mt-1 text-[11px] text-zinc-500">
                        Your team leader can provide the repository URL above.
                      </p>
                    </div>
                  )}

                  {project.liveUrl && (
                    <div className="space-y-2 pt-2 border-t border-border/40">
                      <p className="text-xs text-muted-foreground">Live Deployment:</p>
                      <a
                        href={project.liveUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-muted/40 px-3 py-2 text-xs font-mono text-zinc-200 hover:bg-muted hover:text-white"
                      >
                        <Globe className="size-3.5 text-emerald-400" />
                        <span className="truncate">{project.liveUrl}</span>
                        <ExternalLink className="size-3 shrink-0" />
                      </a>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
