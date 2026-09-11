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
