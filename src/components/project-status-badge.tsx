import { Badge } from "@/components/ui/badge";
import type { ProjectStatus } from "@/lib/constants/project-status";

const LABELS: Record<ProjectStatus, string> = {
  submitted: "Submitted",
  under_review: "Under Review",
  approved: "Approved",
  changes_requested: "Changes Requested",
  in_progress: "In Progress",
  completed: "Completed",
};

const VARIANTS: Record<ProjectStatus, "default" | "secondary" | "outline" | "destructive"> = {
  submitted: "outline",
  under_review: "secondary",
  approved: "default",
  changes_requested: "destructive",
  in_progress: "secondary",
  completed: "default",
};

export function ProjectStatusBadge({ status }: { status: ProjectStatus }) {
  return <Badge variant={VARIANTS[status]}>{LABELS[status]}</Badge>;
}
