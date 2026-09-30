import type { ProjectStatus } from "@/lib/constants/project-status";

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

export function getNextStep(team: NextStepTeam, project: NextStepProject) {
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
