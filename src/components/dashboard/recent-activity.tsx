import type { ActivityEntry } from "@/lib/data/activity";

function formatRelative(at: Date) {
  const date = new Date(at);
  const diffMin = Math.round((Date.now() - date.getTime()) / 60000);
  if (diffMin < 1) return "Just now";
  if (diffMin < 60) return `${diffMin}m ago`;
  const diffHr = Math.round(diffMin / 60);
  if (diffHr < 24) return `${diffHr}h ago`;
  const diffDay = Math.round(diffHr / 24);
  if (diffDay < 30) return `${diffDay}d ago`;
  return date.toLocaleDateString();
}

// Plain timeline list, not cards — matches the section's role as a log, not a nav surface.
export function RecentActivity({ activity }: { activity: ActivityEntry[] }) {
  return (
    <div>
      <h2 className="mb-3 text-label-caps text-muted-foreground">Recent Activity</h2>
      {activity.length === 0 ? (
        <p className="text-sm text-muted-foreground">No activity yet.</p>
      ) : (
        <ul>
          {activity.map((entry, i) => (
            <li
              key={i}
              className="flex items-start gap-3 border-b border-border/60 py-2.5 last:border-0"
            >
              <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-primary" aria-hidden="true" />
              <p className="flex-1 text-sm text-foreground">{entry.label}</p>
              <span className="shrink-0 text-xs text-muted-foreground">{formatRelative(entry.at)}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
