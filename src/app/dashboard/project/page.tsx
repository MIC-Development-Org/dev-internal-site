import Link from "next/link";
import { requireUser } from "@/lib/dal";
import { getMyTeam } from "@/lib/data/teams";
import { getProjectForTeam, getAvailableProjects } from "@/lib/data/projects";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/f1/empty-state";
import { ProjectStatusBadge } from "@/components/project-status-badge";
import { ClaimProjectCard } from "@/components/dashboard/claim-project-card";
import { ProjectRepoForm } from "@/components/dashboard/project-repo-form";
import { ReleaseProjectButton } from "@/components/dashboard/release-project-button";
import { AlertTriangle, ArrowUpRight, ChevronDown, FileText, Globe, Pencil, Radio } from "lucide-react";
import { safeHref } from "@/lib/url";
import { cn } from "@/lib/utils";
import { getProjectProgressPercent, type ProjectStatus } from "@/lib/constants/project-status";

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
          <h1 className="page-title">My Project</h1>
          <p className="text-sm text-muted-foreground">Submit and track your team&apos;s project.</p>
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
  const repoHref = safeHref(project?.repoUrl);
  const liveHref = safeHref(project?.liveUrl);

  // 2. Team has NO project assigned yet -> Show Available Projects Pool
  if (!project) {
    const availableProjects = await getAvailableProjects();

    return (
      <div className="space-y-6">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <h1 className="page-title">Pick a Project</h1>
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
  const changesRequested = project.status === "changes_requested";
  const effectiveStatus = changesRequested ? "approved" : project.status;
  const stageIndex = STAGES.findIndex((s) => s.key === effectiveStatus);
  const nextStage = STAGES[stageIndex + 1];
  const progress = getProjectProgressPercent(project.status);
  const repoLabel = repoHref ? repoHref.replace(/^https?:\/\/(www\.)?github\.com\//i, "").replace(/\/$/, "") : null;
  const liveLabel = liveHref ? liveHref.replace(/^https?:\/\//i, "").replace(/\/$/, "") : null;
  const feedback = (project.feedback ?? []).slice().reverse();

  return (
    <div className="space-y-6">
      {/* ── HERO ── */}
      <section className="surface relative overflow-hidden">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-y-0 right-0 w-1/2 opacity-50"
          style={{
            background:
              "repeating-linear-gradient(115deg, transparent 0 28px, color-mix(in oklch, var(--primary) 14%, transparent) 28px 34px)",
            maskImage: "linear-gradient(to left, black, transparent)",
          }}
        />
        <div className="relative space-y-6 p-6">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="min-w-0">
              <p className="font-mono text-[10px] uppercase tracking-widest text-primary">
                Pit wall · <Link href="/dashboard/team" className="hover:underline">{team.name}</Link>
              </p>
              <h1 className="page-title mt-1">{project.title}</h1>
            </div>
            <div className="flex items-center gap-3">
              <ProjectStatusBadge status={project.status} />
              {isLeader && project.status === "submitted" && <ReleaseProjectButton />}
            </div>
          </div>

          {/* Lap strip */}
          <div className="space-y-2">
            <div className="flex items-baseline justify-between gap-4">
              <p className="font-condensed text-5xl font-extrabold italic tabular-nums leading-none">
                {progress}
                <span className="text-2xl text-muted-foreground">%</span>
              </p>
              <p className="text-right font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                {nextStage ? (
                  <>
                    Next · <span className="text-foreground">{nextStage.label}</span>
                  </>
                ) : (
                  <span className="text-emerald-400">Chequered flag</span>
                )}
              </p>
            </div>
            <ol className="grid grid-cols-5 gap-1">
              {STAGES.map((s, i) => {
                const done = i < stageIndex || project.status === "completed";
                const current = i === stageIndex && project.status !== "completed";
                return (
                  <li key={s.key} className="space-y-1.5">
                    <div
                      className={cn(
                        "h-2 rounded-sm",
                        done && "bg-primary",
                        current && (changesRequested ? "bg-amber-400" : "animate-pulse bg-primary/60"),
                        !done && !current && "bg-muted"
                      )}
                    />
                    <p
                      className={cn(
                        "truncate font-mono text-[9px] uppercase tracking-widest sm:text-[10px]",
                        done || current ? "text-foreground" : "text-muted-foreground"
                      )}
                    >
                      <span className="hidden sm:inline">{String(i + 1).padStart(2, "0")} </span>
                      {s.label}
                    </p>
                  </li>
                );
              })}
            </ol>
          </div>
        </div>
      </section>

      {changesRequested && (
        <div className="flex gap-3 rounded-xl border border-amber-500/30 bg-amber-500/5 px-4 py-3 text-sm">
          <AlertTriangle className="mt-0.5 size-4 shrink-0 text-amber-400" />
          <div>
            <p className="font-medium text-amber-300">Changes requested by race control</p>
            <p className="text-xs text-muted-foreground">Check the latest radio message below and update your project.</p>
          </div>
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_22rem]">
        {/* ── LEFT: brief + radio ── */}
        <div className="space-y-6">
          <section className="surface space-y-4 p-5">
            <h2 className="flex items-center gap-2 font-condensed text-xl font-bold uppercase tracking-wide">
              <FileText className="size-4 text-primary" /> Mission brief
            </h2>
            <p className="whitespace-pre-wrap text-sm leading-relaxed text-zinc-300">{project.description}</p>
            {project.techStack && project.techStack.length > 0 && (
              <div className="flex flex-wrap gap-1.5 border-t border-border/60 pt-4">
                {project.techStack.map((t) => (
                  <span key={t} className="rounded-md border border-border bg-muted/40 px-2 py-0.5 font-mono text-xs text-zinc-200">
                    {t}
                  </span>
                ))}
              </div>
            )}
          </section>

          <section className="surface space-y-4 p-5">
            <h2 className="flex items-center gap-2 font-condensed text-xl font-bold uppercase tracking-wide">
              <Radio className="size-4 text-primary" /> Team radio
              {feedback.length > 0 && (
                <span className="font-mono text-xs font-normal text-muted-foreground">({feedback.length})</span>
              )}
            </h2>
            {feedback.length === 0 ? (
              <p className="rounded-lg border border-dashed border-border px-4 py-6 text-center text-xs text-muted-foreground">
                No messages from race control yet. Admin feedback will appear here.
              </p>
            ) : (
              <ol className="relative space-y-4 border-l border-border pl-5">
                {feedback.map((f, i) => (
                  <li key={i} className="relative">
                    <span
                      className={cn(
                        "absolute -left-[1.6rem] top-1 size-2.5 rounded-full border-2 border-card",
                        i === 0 ? "bg-primary" : "bg-muted-foreground"
                      )}
                    />
                    <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                      Race control · {new Date(f.at).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" })}
                    </p>
                    <p className="mt-1 rounded-lg rounded-tl-none border border-border bg-muted/30 px-3 py-2 text-sm text-zinc-200">
                      {f.note}
                    </p>
                  </li>
                ))}
              </ol>
            )}
          </section>
        </div>

        {/* ── RIGHT: garage links ── */}
        <aside className="space-y-3 lg:sticky lg:top-6 lg:self-start">
          <h2 className="font-condensed text-xl font-bold uppercase tracking-wide">Garage links</h2>

          <LinkTile
            href={repoHref}
            label={repoLabel}
            title="GitHub repository"
            icon={<GithubIcon className="size-5" />}
            emptyText={isLeader ? "Add your repo below." : "Your team leader hasn't added it yet."}
          />
          <LinkTile
            href={liveHref}
            label={liveLabel}
            title="Live deployment"
            icon={<Globe className="size-5 text-emerald-400" />}
            emptyText="Not deployed yet."
          />

          {isLeader && (
            <details open={!repoHref} className="surface group p-4 [&_summary::-webkit-details-marker]:hidden">
              <summary className="flex cursor-pointer list-none items-center justify-between font-mono text-xs uppercase tracking-widest">
                <span className="flex items-center gap-2">
                  <Pencil className="size-3.5 text-primary" />
                  {repoHref ? "Edit links" : "Submit links"}
                </span>
                <ChevronDown className="size-4 text-muted-foreground transition-transform group-open:rotate-180" />
              </summary>
              <div className="mt-4 border-t border-border pt-4">
                <ProjectRepoForm
                  defaults={{
                    repoUrl: project.repoUrl ?? "",
                    liveUrl: project.liveUrl ?? "",
                    techStack: project.techStack ?? [],
                  }}
                />
              </div>
            </details>
          )}
        </aside>
      </div>
    </div>
  );
}

const STAGES: { key: ProjectStatus; label: string }[] = [
  { key: "submitted", label: "Submitted" },
  { key: "under_review", label: "Review" },
  { key: "approved", label: "Approved" },
  { key: "in_progress", label: "In progress" },
  { key: "completed", label: "Completed" },
];

function LinkTile({
  href,
  label,
  title,
  icon,
  emptyText,
}: {
  href: string | null;
  label: string | null;
  title: string;
  icon: React.ReactNode;
  emptyText: string;
}) {
  const body = (
    <>
      <span className="flex size-10 shrink-0 items-center justify-center rounded-lg border border-border bg-muted/40">
        {icon}
      </span>
      <span className="min-w-0 flex-1">
        <span className="block font-mono text-[10px] uppercase tracking-widest text-muted-foreground">{title}</span>
        <span className={cn("block truncate text-sm", href ? "font-mono text-foreground" : "text-muted-foreground")}>
          {href ? label : emptyText}
        </span>
      </span>
      {href && <ArrowUpRight className="size-4 shrink-0 text-muted-foreground transition-colors group-hover:text-primary" />}
    </>
  );

  if (!href) {
    return <div className="flex items-center gap-3 rounded-xl border border-dashed border-border p-3">{body}</div>;
  }
  return (
    <a href={href} target="_blank" rel="noopener noreferrer" className="surface surface-hover group flex items-center gap-3 p-3">
      {body}
    </a>
  );
}
