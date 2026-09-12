"use client";

import { useEffect, useState } from "react";
import { motion, useReducedMotion, type Variants } from "framer-motion";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { RoleBadge } from "@/components/role-badge";
import { PodiumBadge } from "@/components/f1/podium-badge";
import { ProjectStatusBadge } from "@/components/project-status-badge";
import { ProjectProgressTracker } from "@/components/dashboard/project-progress-tracker";
import { NextStep, type NextStepProject, type NextStepTeam } from "@/components/dashboard/next-step";
import { DepartmentSnapshot } from "@/components/dashboard/department-snapshot";
import { RecentActivity } from "@/components/dashboard/recent-activity";
import { PitGarage } from "@/components/dashboard/pit-garage";
import { getProjectProgressPercent } from "@/lib/constants/project-status";
import type { UserRole } from "@/models/User";
import type { ProjectStatus } from "@/models/Project";
import type { DepartmentSnapshot as DepartmentSnapshotData } from "@/lib/data/dashboard";
import type { ActivityEntry } from "@/lib/data/activity";

type DashboardProfile = {
  name: string;
  photoUrl?: string | null;
  role: UserRole;
  teamName: string | null;
  points: number;
  rank: number;
};

type TeamSummary = { name: string; isLeader: boolean } | null;
type ProjectSummary = { title: string; status: ProjectStatus } | null;

const container: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08 } },
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

export function DashboardOverview({
  profile,
  team,
  project,
  snapshot,
  activity,
}: {
  profile: DashboardProfile;
  team: TeamSummary;
  project: ProjectSummary;
  snapshot: DepartmentSnapshotData;
  activity: ActivityEntry[];
}) {
  const points = useCountUp(profile.points);
  const progressPercent = project ? getProjectProgressPercent(project.status) : 0;
  const nextStepTeam: NextStepTeam = team ? { isLeader: team.isLeader } : null;
  const nextStepProject: NextStepProject = project ? { status: project.status } : null;

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-10">
      {/* YOUR OVERVIEW */}
      <motion.section variants={item}>
        <h2 className="mb-3 text-label-caps text-muted-foreground">Your Overview</h2>
        <div className="rounded-xl border border-border bg-card p-6">
          <div className="flex flex-wrap items-center gap-4">
            <Avatar className="h-16 w-16 ring-2 ring-primary/30">
              <AvatarImage src={profile.photoUrl ?? undefined} alt={profile.name} />
              <AvatarFallback className="text-lg">{profile.name.slice(0, 2).toUpperCase()}</AvatarFallback>
            </Avatar>
            <div className="space-y-1">
              <h3 className="text-lg font-semibold">{profile.name}</h3>
              <RoleBadge role={profile.role} />
            </div>
            <div className="ml-auto flex items-center gap-3">
              <PodiumBadge rank={profile.rank} />
              <div className="text-right">
                <p className="text-2xl font-bold tabular-nums">{points}</p>
                <p className="text-xs text-muted-foreground">points</p>
              </div>
            </div>
          </div>

          <div className="mt-5 grid grid-cols-3 divide-x divide-border border-t border-border pt-4 text-center">
            <div>
              <p className="text-label-caps text-muted-foreground">Team</p>
              <p className="mt-1 truncate text-sm font-medium">{team?.name ?? "Not set"}</p>
            </div>
            <div>
              <p className="text-label-caps text-muted-foreground">Project</p>
              <p className="mt-1 truncate text-sm font-medium">{project?.title ?? "Not started"}</p>
            </div>
            <div>
              <p className="text-label-caps text-muted-foreground">Progress</p>
              <p className="mt-1 text-sm font-medium tabular-nums">{progressPercent}%</p>
            </div>
          </div>
        </div>
      </motion.section>

      {/* NEXT STEP */}
      <motion.section variants={item}>
        <NextStep team={nextStepTeam} project={nextStepProject} />
      </motion.section>

      {/* PROJECT PROGRESS */}
      <motion.section variants={item}>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-label-caps text-muted-foreground">Project Progress</h2>
          {project && <ProjectStatusBadge status={project.status} />}
        </div>
        {project ? (
          <div className="overflow-x-auto rounded-xl border border-border bg-card p-6">
            <ProjectProgressTracker status={project.status} />
          </div>
        ) : (
          <p className="rounded-xl border border-dashed border-border bg-card/50 px-6 py-8 text-center text-sm text-muted-foreground">
            Project progress will appear here once your team submits a project.
          </p>
        )}
      </motion.section>

      {/* DEPARTMENT SNAPSHOT */}
      <motion.section variants={item}>
        <DepartmentSnapshot snapshot={snapshot} />
      </motion.section>

      {/* RECENT ACTIVITY */}
      <motion.section variants={item}>
        <RecentActivity activity={activity} />
      </motion.section>

      {/* EXPLORE */}
      <motion.section variants={item}>
        <PitGarage />
      </motion.section>
    </motion.div>
  );
}
