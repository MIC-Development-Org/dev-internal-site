import type { ReactNode } from "react";

export function EmptyState({
  title,
  description,
  action,
}: {
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-lg border border-dashed border-border bg-card/50 px-6 py-16 text-center">
      <svg
        width="48"
        height="24"
        viewBox="0 0 48 24"
        fill="none"
        className="text-muted-foreground/60"
      >
        <rect x="2" y="9" width="34" height="6" rx="3" fill="currentColor" />
        <rect x="14" y="4" width="14" height="6" rx="2" fill="currentColor" />
        <circle cx="12" cy="19" r="4" fill="currentColor" />
        <circle cx="32" cy="19" r="4" fill="currentColor" />
      </svg>
      <p className="text-base font-semibold text-foreground">{title}</p>
      {description && (
        <p className="max-w-sm text-sm text-muted-foreground">{description}</p>
      )}
      {action}
    </div>
  );
}
