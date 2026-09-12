// Mongoose-free constants so client components can import them without
// pulling the mongoose/mongodb driver (and its Node-only builtins) into the browser bundle.
export const PROJECT_STATUSES = [
  "submitted",
  "under_review",
  "approved",
  "changes_requested",
  "in_progress",
  "completed",
] as const;
export type ProjectStatus = (typeof PROJECT_STATUSES)[number];

// Lifecycle order (excludes the "changes_requested" side-state, which maps
// back onto "approved" for progress purposes — see getProjectProgressPercent).
const PROJECT_STATUS_ORDER = ["submitted", "under_review", "approved", "in_progress", "completed"] as const;

export function getProjectProgressPercent(status: ProjectStatus): number {
  const effective = status === "changes_requested" ? "approved" : status;
  const index = PROJECT_STATUS_ORDER.indexOf(effective as (typeof PROJECT_STATUS_ORDER)[number]);
  return index < 0 ? 0 : Math.round((index / (PROJECT_STATUS_ORDER.length - 1)) * 100);
}
