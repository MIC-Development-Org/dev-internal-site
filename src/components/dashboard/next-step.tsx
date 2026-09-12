import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { ProjectStatus } from "@/models/Project";

export type NextStepTeam = { isLeader: boolean } | null;
export type NextStepProject = { status: ProjectStatus } | null;

const PROJECT_STEP: Record<ProjectStatus, { message: string; ctaLabel: string }> = {
  submitted: { message: "Your project has been submitted and is awaiting review.", ctaLabel: "View Project" },
  under_review: { message: "Your project is under review.", ctaLabel: "View Project" },
  changes_requested: { message: "Changes have been requested on your project.", ctaLabel: "View Feedback" },
  approved: { message: "Your project has been approved — time to start building.", ctaLabel: "View Project" },
  in_progress: { message: "Your project is currently in progress.", ctaLabel: "View Project" },
  completed: { message: "Your project is complete. Great work.", ctaLabel: "View Project" },
};

function getNextStep(team: NextStepTeam, project: NextStepProject) {
  if (!team) {
    return {
      message: "You're not part of a team yet. Create or join a team to get started.",
      ctaLabel: "Create / Join Team",
      ctaHref: "/dashboard/team",
    };
  }
  if (!project) {
    return team.isLeader
      ? { message: "Your team is ready. Submit your project to continue.", ctaLabel: "Submit Project", ctaHref: "/dashboard/project" }
      : {
          message: "Your team hasn't submitted a project yet — ask your team lead to submit it.",
          ctaLabel: "View Team",
          ctaHref: "/dashboard/team",
        };
  }
  return { ...PROJECT_STEP[project.status], ctaHref: "/dashboard/project" };
}

export function NextStep({ team, project }: { team: NextStepTeam; project: NextStepProject }) {
  const step = getNextStep(team, project);

  return (
    <div className="flex flex-wrap items-center justify-between gap-4 rounded-lg border-l-4 border-primary bg-primary/5 px-5 py-4">
      <div>
        <p className="text-label-caps text-primary">Next Step</p>
        <p className="mt-1 text-sm text-foreground">{step.message}</p>
      </div>
      <Button render={<Link href={step.ctaHref} />} nativeButton={false} size="sm" className="shrink-0 gap-1.5">
        {step.ctaLabel}
        <ArrowRight className="size-4" />
      </Button>
    </div>
  );
}
