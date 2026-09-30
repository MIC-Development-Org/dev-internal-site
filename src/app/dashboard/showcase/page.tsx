import Link from "next/link";
import { ArrowUpRight, Globe, GitBranch, Flag } from "lucide-react";
import { getShowcaseProjects } from "@/lib/data/projects";
import { EmptyState } from "@/components/f1/empty-state";
import { cn } from "@/lib/utils";
import { SHOWCASE_STATUSES, type ProjectStatus } from "@/lib/constants/project-status";
import { safeHref } from "@/lib/url";

type ShowcaseProject = Awaited<ReturnType<typeof getShowcaseProjects>>[number];

// Each showcase status is one sector of the lap.
const SECTORS: { status: ProjectStatus; label: string; short: string }[] = [
  { status: "approved", label: "Approved", short: "S1" },
  { status: "in_progress", label: "In Progress", short: "S2" },
  { status: "completed", label: "Completed", short: "S3" },
];

const STATUS_ACCENT: Partial<Record<ProjectStatus, string>> = {
  approved: "text-sky-400",
  in_progress: "text-amber-400",
  completed: "text-emerald-400",
};

function filterHref(params: { status?: string; tech?: string }) {
  const q = new URLSearchParams();
  if (params.status) q.set("status", params.status);
  if (params.tech) q.set("tech", params.tech);
  const s = q.toString();
  return s ? `/dashboard/showcase?${s}` : "/dashboard/showcase";
}

export default async function ShowcasePage({ searchParams }: PageProps<"/dashboard/showcase">) {
  const params = await searchParams;
  const rawStatus = typeof params.status === "string" ? params.status : undefined;
  const status = SHOWCASE_STATUSES.includes(rawStatus as ProjectStatus) ? (rawStatus as ProjectStatus) : undefined;
  const tech = typeof params.tech === "string" && params.tech ? params.tech : undefined;

  // One query for everything visible; counts and the tech list come from it.
  const all = await getShowcaseProjects();
  const techCounts = new Map<string, number>();
  for (const p of all) for (const t of p.techStack) techCounts.set(t, (techCounts.get(t) ?? 0) + 1);
  const techList = [...techCounts.entries()].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]));

  const projects = all.filter(
    (p) => (!status || p.status === status) && (!tech || p.techStack.includes(tech))
  );

  const stats = [
    { key: undefined, label: "On the grid", count: all.length, accent: "text-foreground" },
    ...SECTORS.map((s) => ({
      key: s.status,
      label: s.label,
      count: all.filter((p) => p.status === s.status).length,
      accent: STATUS_ACCENT[s.status]!,
    })),
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="page-title">Projects</h1>
        <p className="text-sm text-muted-foreground">Race control for everything the MIC Development Department is building.</p>
      </div>

      {/* Stat strip — each tile is a status filter */}
      <nav aria-label="Filter by status" className="grid grid-cols-2 gap-px overflow-hidden rounded-xl border border-border bg-border sm:grid-cols-4">
        {stats.map((s) => {
          const active = status === s.key;
          return (
            <Link
              key={s.label}
              href={filterHref({ status: s.key, tech })}
              aria-current={active ? "page" : undefined}
              className={cn(
                "group relative bg-card px-4 py-3 transition-colors hover:bg-muted/40",
                active && "bg-muted/60"
              )}
            >
              {active && <span className="absolute inset-x-0 top-0 h-0.5 bg-primary" />}
              <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">{s.label}</p>
              <p className={cn("font-condensed text-4xl font-extrabold italic tabular-nums leading-tight", s.accent)}>
                {String(s.count).padStart(2, "0")}
              </p>
            </Link>
          );
        })}
      </nav>

      {/* Tech filter */}
      {techList.length > 0 && (
        <div className="flex flex-wrap items-center gap-2">
          <span className="mr-1 font-mono text-[10px] uppercase tracking-widest text-muted-foreground">Tech</span>
          {techList.map(([t, n]) => {
            const active = tech === t;
            return (
              <Link
                key={t}
                href={filterHref({ status, tech: active ? undefined : t })}
                className={cn(
                  "rounded-full border px-2.5 py-1 font-mono text-xs transition-colors",
                  active
                    ? "border-primary bg-primary/15 text-foreground"
                    : "border-border text-muted-foreground hover:border-foreground/30 hover:text-foreground"
                )}
              >
                {t} <span className="opacity-60">{n}</span>
              </Link>
            );
          })}
          {(tech || status) && (
            <Link href="/dashboard/showcase" className="ml-1 text-xs text-primary hover:underline">
              Clear filters
            </Link>
          )}
        </div>
      )}

      {projects.length === 0 ? (
        <EmptyState
          title={all.length === 0 ? "No projects on the grid yet" : "No projects match these filters"}
          description={
            all.length === 0
              ? "Approved, in-progress, and completed projects will appear here."
              : "Try a different status or tech."
          }
        />
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {projects.map((p) => (
            <ProjectEntry key={p._id} project={p} number={all.indexOf(p) + 1} />
          ))}
        </div>
      )}
    </div>
  );
}

function ProjectEntry({ project: p, number }: { project: ShowcaseProject; number: number }) {
  const sectorIndex = SECTORS.findIndex((s) => s.status === p.status);
  const done = p.status === "completed";
  // Car sits mid-sector for approved/in-progress, at the line when completed.
  const repoUrl = safeHref(p.repoUrl);
  const liveUrl = safeHref(p.liveUrl);
  const carPct = done ? 100 : ((sectorIndex + 0.5) / SECTORS.length) * 100;

  return (
    <article className="surface surface-hover group relative flex flex-col overflow-hidden">
      <Link href={`/dashboard/showcase/${p._id}`} className="absolute inset-0 z-0" aria-label={`Open ${p.title}`} />

      {/* Car number watermark */}
      <span
        aria-hidden
        className="pointer-events-none absolute -right-2 -top-6 select-none font-condensed text-[7rem] font-extrabold italic leading-none text-foreground/[0.04]"
      >
        {String(number).padStart(2, "0")}
      </span>

      <div className="relative flex-1 space-y-3 p-5">
        <div className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-widest">
          <span className={cn("inline-flex items-center gap-1.5", STATUS_ACCENT[p.status])}>
            <span className={cn("size-1.5 rounded-full bg-current", p.status === "in_progress" && "animate-pulse")} />
            {SECTORS[sectorIndex]?.label ?? p.status}
          </span>
          <span className="text-muted-foreground">·</span>
          <span className="truncate text-muted-foreground">{p.teamName}</span>
        </div>

        <h2 className="font-condensed text-2xl font-bold uppercase leading-tight tracking-wide">
          {p.title}
          <ArrowUpRight className="ml-1 inline size-5 -translate-y-0.5 opacity-0 transition-opacity group-hover:opacity-100" />
        </h2>

        <p className="line-clamp-2 text-sm text-muted-foreground">{p.description}</p>

        {p.techStack.length > 0 && (
          <p className="font-mono text-xs text-muted-foreground">
            {p.techStack.join(" / ")}
          </p>
        )}
      </div>

      {/* Lap track */}
      <div className="relative px-5 pb-4">
        <div className="relative h-6">
          <div className="absolute inset-x-0 top-1/2 flex -translate-y-1/2 gap-1">
            {SECTORS.map((s, i) => (
              <div
                key={s.status}
                className={cn(
                  "h-1 flex-1 rounded-full",
                  i < sectorIndex || done ? "bg-primary" : i === sectorIndex ? "bg-primary/50" : "bg-muted"
                )}
              />
            ))}
          </div>
          <span
            className="absolute top-1/2 flex size-5 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border-2 border-background bg-primary shadow-[0_0_12px_var(--primary)]"
            style={{ left: `${carPct}%` }}
          >
            {done && <Flag className="size-2.5 text-primary-foreground" />}
          </span>
        </div>
        <div className="mt-1 grid grid-cols-3 font-mono text-[9px] uppercase tracking-widest text-muted-foreground">
          {SECTORS.map((s, i) => (
            <span key={s.status} className={cn(i === 1 && "text-center", i === 2 && "text-right", i === sectorIndex && "text-foreground")}>
              {s.short}
            </span>
          ))}
        </div>
      </div>

      {/* Footer links sit above the card link */}
      <div className="relative z-10 flex items-center gap-3 border-t border-border px-5 py-2.5 text-xs">
        {repoUrl ? (
          <a href={repoUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-muted-foreground hover:text-foreground">
            <GitBranch className="size-3.5" /> Repo
          </a>
        ) : (
          <span className="inline-flex items-center gap-1 text-muted-foreground/50">
            <GitBranch className="size-3.5" /> No repo yet
          </span>
        )}
        {liveUrl && (
          <a href={liveUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-muted-foreground hover:text-foreground">
            <Globe className="size-3.5" /> Live
          </a>
        )}
        <Link href={`/dashboard/showcase/${p._id}`} className="ml-auto font-mono uppercase tracking-widest text-primary">
          Details →
        </Link>
      </div>
    </article>
  );
}
