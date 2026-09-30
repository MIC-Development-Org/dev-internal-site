import { getLeaderboard } from "@/lib/data/users";
import { requireUser } from "@/lib/dal";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { RoleBadge } from "@/components/role-badge";
import { PodiumBadge } from "@/components/f1/podium-badge";
import { cn } from "@/lib/utils";

export default async function LeaderboardPage() {
  const [leaderboard, me] = await Promise.all([getLeaderboard(), requireUser()]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="page-title">Leaderboard</h1>
        <p className="text-sm text-muted-foreground">Department rankings.</p>
      </div>

      <div
        className="surface relative overflow-hidden"
        style={{
          backgroundImage:
            "repeating-conic-gradient(var(--muted) 0% 25%, transparent 0% 50%)",
          backgroundSize: "24px 24px",
        }}
      >
        <div className="divide-y divide-border bg-card/95">
          {leaderboard.map((entry) => {
            const isMe = String(entry._id) === String(me._id);
            return (
              <div
                key={entry._id}
                className={cn(
                  "flex items-center gap-4 px-4 py-3 transition-colors hover:bg-white/[0.03]",
                  entry.rank === 1 && "bg-gradient-to-r from-amber-400/15 to-transparent",
                  entry.rank === 2 && "bg-gradient-to-r from-slate-300/10 to-transparent",
                  entry.rank === 3 && "bg-gradient-to-r from-orange-500/10 to-transparent",
                  isMe && "border-l-2 border-l-primary bg-primary/10"
                )}
                title={`P${entry.rank} — ${entry.points} pts`}
              >
                <PodiumBadge rank={entry.rank} />
                <Avatar className="h-9 w-9">
                  <AvatarImage src={entry.photoUrl} alt={entry.name} />
                  <AvatarFallback>{entry.name.slice(0, 2).toUpperCase()}</AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <p className="font-condensed text-lg font-semibold uppercase tracking-wide">
                    {entry.name}
                    {isMe && <span className="ml-1.5 text-xs text-primary">(you)</span>}
                  </p>
                  {entry.batch && <p className="text-xs text-muted-foreground">{entry.batch}</p>}
                </div>
                <RoleBadge role={entry.role} />
                <div className="flex items-center gap-1.5 font-mono text-base font-bold tabular-nums text-primary">
                  🏁 {entry.points}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
