import { getRecentAuditLogs } from "@/lib/data/audit";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/f1/empty-state";
import type { AuditAction } from "@/models/AuditLog";

const ACTION_LABELS: Record<AuditAction, string> = {
  role_changed: "Role",
  team_created: "Team created",
  team_roster_updated: "Roster",
  team_dissolved: "Team dissolved",
  project_status_changed: "Project",
  settings_updated: "Settings",
};

export default async function AdminActivityPage() {
  const logs = await getRecentAuditLogs();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Activity Log</h1>
        <p className="text-sm text-muted-foreground">
          Role changes, team edits, and project status changes made by admins. Points awards are
          logged separately under Leaderboard Config.
        </p>
      </div>

      {logs.length === 0 ? (
        <EmptyState title="No laps completed yet" description="No admin actions have been logged yet." />
      ) : (
        <Card>
          <CardContent className="divide-y divide-border pt-6">
            {logs.map((log) => (
              <div key={log._id} className="flex items-start justify-between gap-4 py-3 first:pt-0 last:pb-0">
                <div className="space-y-1">
                  <p className="text-sm">{log.summary}</p>
                  <p className="text-xs text-muted-foreground">
                    {log.actorName} · {new Date(log.createdAt).toLocaleString()}
                  </p>
                </div>
                <Badge variant="outline" className="shrink-0">
                  {ACTION_LABELS[log.action]}
                </Badge>
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
