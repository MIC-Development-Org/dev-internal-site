import { getAllUsersForAdmin } from "@/lib/data/users";
import { getAllTeams } from "@/lib/data/teams";
import { getRecentPointsLogs } from "@/lib/data/points";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AwardPointsForm } from "@/components/admin/award-points-form";

export default async function AdminLeaderboardPage() {
  const [users, teams, logs] = await Promise.all([getAllUsersForAdmin(), getAllTeams(), getRecentPointsLogs()]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Leaderboard Config</h1>
        <p className="text-sm text-muted-foreground">Award or deduct points. Reasons are internal only.</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Award points</CardTitle>
          </CardHeader>
          <CardContent>
            <AwardPointsForm
              users={users.map((u) => ({ _id: u._id, name: u.name }))}
              teams={teams.map((t) => ({ _id: t._id, name: t.name }))}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent activity</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {logs.length === 0 && <p className="text-sm text-muted-foreground">No points awarded yet.</p>}
            {logs.map((l) => (
              <div key={l._id} className="flex items-center justify-between border-b border-border py-2 text-sm last:border-0">
                <div>
                  <p className="font-medium">
                    {l.targetName} <span className="text-xs text-muted-foreground">({l.targetType})</span>
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {l.reason} · by {l.awardedByName}
                  </p>
                </div>
                <span className={`font-mono font-bold tabular-nums ${l.amount >= 0 ? "text-primary" : "text-destructive"}`}>
                  {l.amount >= 0 ? "+" : ""}
                  {l.amount}
                </span>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
