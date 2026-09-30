import { cn } from "@/lib/utils";
import type { ProjectStatus } from "@/lib/constants/project-status";

export const PROJECT_STAGES: { key: ProjectStatus; label: string }[] = [
  { key: "submitted", label: "Submitted" },
  { key: "under_review", label: "Review" },
  { key: "approved", label: "Approved" },
  { key: "in_progress", label: "In progress" },
  { key: "completed", label: "Completed" },
];

/** Index of the current stage; "changes_requested" sits on the approved stage. */
export function stageIndexFor(status: ProjectStatus) {
  const effective = status === "changes_requested" ? "approved" : status;
  return PROJECT_STAGES.findIndex((s) => s.key === effective);
}

/** Five-segment lap strip: done segments solid, current pulsing (amber when changes are requested). */
export function StageStrip({ status }: { status: ProjectStatus }) {
  const stageIndex = stageIndexFor(status);
  const completed = status === "completed";
  const changesRequested = status === "changes_requested";

  return (
    <ol className="grid grid-cols-5 gap-1">
      {PROJECT_STAGES.map((s, i) => {
        const done = i < stageIndex || completed;
        const current = i === stageIndex && !completed;
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
  );
}
