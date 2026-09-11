"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { motion, useReducedMotion, type Variants } from "framer-motion";
import { Users, FolderKanban, LayoutGrid, Trophy, BookUser, ArrowRight, UserPlus } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { RoleBadge } from "@/components/role-badge";
import { PodiumBadge } from "@/components/f1/podium-badge";
import type { UserRole } from "@/models/User";

type DashboardProfile = {
  name: string;
  photoUrl?: string | null;
  role: UserRole;
  teamName: string | null;
  points: number;
  rank: number;
};

const QUICK_LINKS = [
  { href: "/dashboard/team", label: "My Team", description: "View your team members and team status", icon: Users },
  { href: "/dashboard/project", label: "My Project", description: "Submit and track your project", icon: FolderKanban },
  { href: "/dashboard/showcase", label: "Projects", description: "Explore projects from the department", icon: LayoutGrid },
  { href: "/dashboard/leaderboard", label: "Leaderboard", description: "View department rankings", icon: Trophy },
  { href: "/dashboard/directory", label: "Members", description: "Find members and their tech stacks", icon: BookUser },
];

const container: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.1 } },
};

const gridContainer: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.06 } },
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

export function DashboardOverview({ profile }: { profile: DashboardProfile }) {
  const points = useCountUp(profile.points);

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-8">
      <motion.div variants={item}>
        <Card className="overflow-hidden">
          <CardContent className="flex flex-wrap items-center gap-6 pt-6">
            <Avatar className="h-20 w-20 ring-2 ring-primary/30">
              <AvatarImage src={profile.photoUrl ?? undefined} alt={profile.name} />
              <AvatarFallback className="text-xl">{profile.name.slice(0, 2).toUpperCase()}</AvatarFallback>
            </Avatar>
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-semibold">{profile.name}</h2>
                <RoleBadge role={profile.role} />
              </div>
              <p className="text-sm text-muted-foreground">
                {profile.teamName ? `Team: ${profile.teamName}` : "Team: Not assigned"}
              </p>
            </div>
            <div className="ml-auto flex items-center gap-3">
              <PodiumBadge rank={profile.rank} />
              <div>
                <p className="text-2xl font-bold tabular-nums">{points}</p>
                <p className="text-xs text-muted-foreground">points · P{profile.rank}</p>
              </div>
            </div>
          </CardContent>
          {!profile.teamName && (
            <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border bg-primary/5 px-6 py-4">
              <div>
                <p className="text-sm font-medium">You&apos;re not part of a team yet.</p>
                <p className="text-xs text-muted-foreground">Create a team or join one to get started.</p>
              </div>
              <Button render={<Link href="/dashboard/team" />} nativeButton={false} size="sm" className="gap-1.5">
                <UserPlus className="size-4" />
                Create / Join Team
              </Button>
            </div>
          )}
        </Card>
      </motion.div>

      <motion.div variants={item}>
        <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
          Quick links
        </h3>
        <motion.div
          variants={gridContainer}
          initial="hidden"
          animate="show"
          className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
        >
          {QUICK_LINKS.map(({ href, label, description, icon: Icon }) => (
            <motion.div
              key={href}
              variants={item}
              whileHover={{ y: -4 }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
            >
              <Link href={href} className="group block h-full">
                <Card className="h-full transition-shadow group-hover:shadow-[0_0_0_1px_var(--primary),0_8px_20px_-8px_var(--primary)]">
                  <CardContent className="flex items-center gap-4 pt-6">
                    <div className="flex size-10 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary transition-transform duration-200 group-hover:scale-110">
                      <Icon className="size-5" />
                    </div>
                    <div className="min-w-0">
                      <p className="font-medium">{label}</p>
                      <p className="truncate text-xs text-muted-foreground">{description}</p>
                    </div>
                    <ArrowRight className="ml-auto size-4 shrink-0 text-muted-foreground transition-transform duration-200 group-hover:translate-x-1 group-hover:text-primary" />
                  </CardContent>
                </Card>
              </Link>
            </motion.div>
          ))}
        </motion.div>
      </motion.div>
    </motion.div>
  );
}
