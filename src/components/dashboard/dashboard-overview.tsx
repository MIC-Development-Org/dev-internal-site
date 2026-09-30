"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion, useReducedMotion, type Variants } from "framer-motion";
import { ArrowRight, Radio, Users, Flag, Activity as ActivityIcon, Gauge } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { RoleBadge } from "@/components/role-badge";
import { ProjectStatusBadge } from "@/components/project-status-badge";
import { getNextStep, type NextStepProject, type NextStepTeam } from "@/components/dashboard/next-step";
import { PitGarage } from "@/components/dashboard/pit-garage";
import { StageStrip } from "@/components/dashboard/stage-strip";
import { getProjectProgressPercent, type ProjectStatus } from "@/lib/constants/project-status";
import type { UserRole } from "@/lib/constants/roles";
import type { DepartmentSnapshot as DepartmentSnapshotData } from "@/lib/data/dashboard";
import type { ActivityEntry } from "@/lib/data/activity";
import { cn } from "@/lib/utils";

type DashboardProfile = {
  name: string;
  photoUrl?: string | null;
  role: UserRole;
  teamName: string | null;
  points: number;
  rank: number;
};

type TeamSummary = {
  name: string;
  isLeader: boolean;
  memberCount: number;
  maxMembers: number;
  points: number;
} | null;
type ProjectSummary = { title: string; status: ProjectStatus } | null;

const container: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.07 } },
};

const item: Variants = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.35, ease: "easeOut" } },
};

function useCountUp(target: number, durationMs = 900) {
  const [value, setValue] = useState(0);
  const reduceMotion = useReducedMotion();

  useEffect(() => {
    if (reduceMotion) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setValue(target);
      return;
    }
    let raf: number;
    const start = performance.now();
    function tick(now: number) {
      const progress = Math.min((now - start) / durationMs, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setValue(Math.round(eased * target));
      if (progress < 1) raf = requestAnimationFrame(tick);
    }
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target, durationMs, reduceMotion]);

  return value;
}

function formatRelative(at: Date) {
  const date = new Date(at);
  const diffMin = Math.round((Date.now() - date.getTime()) / 60000);
  if (diffMin < 1) return "Just now";
  if (diffMin < 60) return `${diffMin}m ago`;
  const diffHr = Math.round(diffMin / 60);
  if (diffHr < 24) return `${diffHr}h ago`;
  const diffDay = Math.round(diffHr / 24);
  if (diffDay < 30) return `${diffDay}d ago`;
  return date.toLocaleDateString();
}

function PanelTitle({ icon, children, action }: { icon: React.ReactNode; children: React.ReactNode; action?: React.ReactNode }) {
  return (
    <div className="mb-4 flex items-center justify-between gap-3">
      <h2 className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
        <span className="text-primary">{icon}</span>
        {children}
      </h2>
      {action}
    </div>
  );
}

export function DashboardOverview({
  profile,
  team,
  project,
  snapshot,
  activity,
  gapToNext,
  totalDrivers,
}: {
  profile: DashboardProfile;
  team: TeamSummary;
  project: ProjectSummary;
  snapshot: DepartmentSnapshotData;
  activity: ActivityEntry[];
  /** Points behind the closest member with more points; null when leading. */
  gapToNext: number | null;
  totalDrivers: number;
}) {
  const points = useCountUp(profile.points);
  const progress = project ? getProjectProgressPercent(project.status) : 0;
  const nextStepTeam: NextStepTeam = team ? { isLeader: team.isLeader } : null;
  const nextStepProject: NextStepProject = project ? { status: project.status } : null;
  const step = getNextStep(nextStepTeam, nextStepProject);

  const telemetry = [
    { label: "Members", value: snapshot.members },
    { label: "Teams", value: snapshot.teams },
    { label: "Projects", value: snapshot.projects },
    { label: "Completed", value: snapshot.completed },
  ];

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="grid gap-4 lg:grid-cols-3">
      {/* DRIVER CARD */}
      <motion.section variants={item} className="surface relative overflow-hidden p-6 lg:col-span-2">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-y-0 right-0 w-1/2 opacity-50"
          style={{
            background:
              "repeating-linear-gradient(115deg, transparent 0 28px, color-mix(in oklch, var(--primary) 14%, transparent) 28px 34px)",
            maskImage: "linear-gradient(to left, black, transparent)",
          }}
        />
        <div className="relative flex flex-wrap items-center gap-5">
          <Avatar className="h-20 w-20 ring-2 ring-primary/40 ring-offset-4 ring-offset-card">
            <AvatarImage src={profile.photoUrl ?? undefined} alt={profile.name} />
            <AvatarFallback className="text-xl">{profile.name.slice(0, 2).toUpperCase()}</AvatarFallback>
          </Avatar>
          <div className="min-w-0 flex-1 space-y-1.5">
            <p className="font-mono text-[10px] uppercase tracking-widest text-primary">Driver</p>
            <h2 className="truncate font-condensed text-3xl font-bold uppercase leading-none tracking-wide">{profile.name}</h2>
            <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
              <RoleBadge role={profile.role} />
              <span>{profile.teamName ?? "No team yet"}</span>
            </div>
          </div>
        </div>

        <dl className="relative mt-6 grid grid-cols-3 gap-px overflow-hidden rounded-lg border border-border bg-border">
          <div className="bg-card/90 px-4 py-3">
            <dt className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">Position</dt>
            <dd className="font-condensed text-4xl font-extrabold italic leading-tight">
              P{profile.rank}
              <span className="ml-1 text-base font-semibold not-italic text-muted-foreground">/{totalDrivers}</span>
            </dd>
          </div>
          <div className="bg-card/90 px-4 py-3">
            <dt className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">Points</dt>
            <dd className="font-condensed text-4xl font-extrabold italic tabular-nums leading-tight text-primary">{points}</dd>
          </div>
          <div className="bg-card/90 px-4 py-3">
            <dt className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
              {gapToNext === null ? "Status" : "Gap to car ahead"}
            </dt>
            <dd className="font-condensed text-4xl font-extrabold italic tabular-nums leading-tight">
              {gapToNext === null ? <span className="text-amber-400">Leader</span> : `+${gapToNext}`}
            </dd>
          </div>
        </dl>
      </motion.section>

      {/* RACE ENGINEER / NEXT STEP */}
      <motion.section
        variants={item}
        className="relative flex flex-col justify-between overflow-hidden rounded-xl border border-primary/30 bg-gradient-to-br from-primary/20 via-primary/5 to-transparent p-6 shadow-[0_0_40px_-16px_var(--primary)]"
      >
        <div>
          <PanelTitle icon={<Radio className="size-3.5 animate-pulse" />}>Race engineer</PanelTitle>
          <p className="font-condensed text-2xl font-semibold leading-snug">&ldquo;{step.message}&rdquo;</p>
        </div>
        <Button render={<Link href={step.ctaHref} />} nativeButton={false} className="mt-6 w-full gap-1.5">
          {step.ctaLabel}
          <ArrowRight className="size-4" />
        </Button>
      </motion.section>

      {/* PROJECT PROGRESS */}
      <motion.section variants={item} className="surface p-6 lg:col-span-2">
        <PanelTitle
          icon={<Gauge className="size-3.5" />}
          action={project && <ProjectStatusBadge status={project.status} />}
        >
          Race progress
        </PanelTitle>
        {project ? (
          <Link href="/dashboard/project" className="group block space-y-4">
            <div className="flex items-end justify-between gap-4">
              <p className="truncate font-condensed text-2xl font-bold uppercase tracking-wide group-hover:text-primary">
                {project.title}
              </p>
              <p className="font-condensed text-4xl font-extrabold italic tabular-nums leading-none">
                {progress}
                <span className="text-xl text-muted-foreground">%</span>
              </p>
            </div>
            <StageStrip status={project.status} />
          </Link>
        ) : (
          <p className="rounded-lg border border-dashed border-border px-6 py-8 text-center text-sm text-muted-foreground">
            Project progress will appear here once your team picks a project.
          </p>
        )}
      </motion.section>

      {/* TEAM */}
      <motion.section variants={item} className="surface flex flex-col p-6">
        <PanelTitle icon={<Users className="size-3.5" />}>Team</PanelTitle>
        {team ? (
          <Link href="/dashboard/team" className="group flex flex-1 flex-col justify-between gap-4">
            <p className="font-condensed text-2xl font-bold uppercase leading-tight tracking-wide group-hover:text-primary">
              {team.name}
            </p>
            <div className="space-y-2">
              <div className="flex gap-1">
                {Array.from({ length: team.maxMembers }, (_, i) => (
                  <span
                    key={i}
                    className={cn("h-1.5 flex-1 rounded-sm", i < team.memberCount ? "bg-primary" : "bg-muted")}
                  />
                ))}
              </div>
              <div className="flex justify-between font-mono text-xs text-muted-foreground">
                <span>
                  {team.memberCount}/{team.maxMembers} drivers
                </span>
                <span className="tabular-nums">{team.points} pts</span>
              </div>
            </div>
          </Link>
        ) : (
          <Link
            href="/dashboard/team"
            className="flex flex-1 flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-border p-6 text-center text-sm text-muted-foreground hover:border-primary/50"
          >
            <Flag className="size-5" />
            No team yet
            <span className="font-mono text-xs uppercase tracking-widest text-primary">Form one →</span>
          </Link>
        )}
      </motion.section>

      {/* TELEMETRY */}
      <motion.section variants={item} className="surface p-6">
        <PanelTitle icon={<Gauge className="size-3.5" />}>Department telemetry</PanelTitle>
        <dl className="grid grid-cols-2 gap-4">
          {telemetry.map((t) => (
            <div key={t.label}>
              <dt className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">{t.label}</dt>
              <dd className="font-condensed text-3xl font-extrabold italic tabular-nums">{String(t.value).padStart(2, "0")}</dd>
            </div>
          ))}
        </dl>
      </motion.section>

      {/* ACTIVITY */}
      <motion.section variants={item} className="surface p-6 lg:col-span-2">
        <PanelTitle icon={<ActivityIcon className="size-3.5" />}>Lap log</PanelTitle>
        {activity.length === 0 ? (
          <p className="text-sm text-muted-foreground">No activity yet.</p>
        ) : (
          <ol className="relative space-y-3 border-l border-border pl-5">
            {activity.map((entry, i) => (
              <li key={i} className="relative flex items-baseline gap-3">
                <span
                  aria-hidden
                  className={cn(
                    "absolute -left-[1.55rem] top-1.5 size-2 rounded-full",
                    i === 0 ? "bg-primary shadow-[0_0_8px_var(--primary)]" : "bg-muted-foreground/60"
                  )}
                />
                <p className="flex-1 text-sm">{entry.label}</p>
                <span className="shrink-0 font-mono text-xs text-muted-foreground">{formatRelative(entry.at)}</span>
              </li>
            ))}
          </ol>
        )}
      </motion.section>

      {/* EXPLORE */}
      <motion.section variants={item} className="lg:col-span-3">
        <PitGarage />
      </motion.section>
    </motion.div>
  );
}
