import { Check } from "lucide-react";
import { cn } from "@/lib/utils";
import type { ProjectStatus } from "@/models/Project";

const STEPS: { key: ProjectStatus; label: string }[] = [
  { key: "submitted", label: "Submitted" },
  { key: "under_review", label: "Under Review" },
  { key: "approved", label: "Approved" },
  { key: "in_progress", label: "In Progress" },
  { key: "completed", label: "Completed" },
];

export function ProjectProgressTracker({ status }: { status: ProjectStatus }) {
  const changesRequested = status === "changes_requested";
  const effectiveStatus = changesRequested ? "approved" : status;
  const currentIndex = STEPS.findIndex((s) => s.key === effectiveStatus);

  return (
    <div className="flex items-start">
      {STEPS.map((step, i) => {
        const blocked = step.key === "approved" && changesRequested;
        const done = i < currentIndex;
        const current = i === currentIndex;
        return (
          <div key={step.key} className="flex flex-1 items-center last:flex-none">
            <div className="flex flex-col items-center gap-1.5">
              <div
                className={cn(
                  "flex size-7 shrink-0 items-center justify-center rounded-full border-2 text-xs font-bold",
                  blocked
                    ? "border-destructive bg-destructive/10 text-destructive"
                    : done || (current && !blocked)
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-border text-muted-foreground"
                )}
              >
                {blocked ? "!" : done ? <Check className="size-3.5" /> : i + 1}
              </div>
              <span
                className={cn(
                  "w-16 text-center text-[11px] font-medium whitespace-nowrap",
                  blocked ? "text-destructive" : done || current ? "text-foreground" : "text-muted-foreground"
                )}
              >
                {blocked ? "Changes Requested" : step.label}
              </span>
            </div>
            {i < STEPS.length - 1 && (
              <div
                className={cn(
                  "mx-1 mt-3.5 h-0.5 flex-1 rounded-full bg-[repeating-linear-gradient(90deg,currentColor_0_6px,transparent_6px_10px)]",
                  i < currentIndex ? "text-primary" : "text-border"
                )}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}
