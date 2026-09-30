import { getLeaderboard } from "@/lib/data/users";
import { requireUser } from "@/lib/dal";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { RoleBadge } from "@/components/role-badge";
import { cn } from "@/lib/utils";

type Entry = Awaited<ReturnType<typeof getLeaderboard>>[number];

const PODIUM = {
  1: { ring: "ring-amber-400", text: "text-amber-400", block: "h-36 from-amber-400/25", label: "WINNER" },
  2: { ring: "ring-slate-300", text: "text-slate-300", block: "h-24 from-slate-300/20", label: "P2" },
  3: { ring: "ring-orange-500", text: "text-orange-500", block: "h-16 from-orange-500/20", label: "P3" },
} as const;

function initials(name: string) {
  return name.slice(0, 2).toUpperCase();
}

function PodiumStep({ entry, isMe }: { entry: Entry; isMe: boolean }) {
  const s = PODIUM[entry.rank as 1 | 2 | 3];
  return (
    <div className="flex min-w-0 flex-1 flex-col items-center">
      <Avatar className={cn("ring-2 ring-offset-4 ring-offset-background", s.ring, entry.rank === 1 ? "h-20 w-20" : "h-14 w-14")}>
        <AvatarImage src={entry.photoUrl} alt={entry.name} />
        <AvatarFallback>{initials(entry.name)}</AvatarFallback>
      </Avatar>
      <p className="mt-3 w-full truncate text-center font-condensed text-base font-semibold uppercase tracking-wide sm:text-lg">
        {entry.name}
      </p>
      {isMe && <span className="text-[10px] font-mono uppercase tracking-widest text-primary">You</span>}
      <p className={cn("font-mono text-xl font-bold tabular-nums", s.text)}>{entry.points}</p>
      <div
        className={cn(
          "mt-3 flex w-full items-start justify-center rounded-t-md border border-b-0 border-border bg-gradient-to-b to-transparent pt-2",
          s.block
        )}
      >
        <span className={cn("font-condensed text-2xl font-extrabold italic", s.text)}>{s.label}</span>
      </div>
    </div>
  );
}

export default async function LeaderboardPage() {
  const [leaderboard, me] = await Promise.all([getLeaderboard(), requireUser()]);
  const leaderPoints = leaderboard[0]?.points ?? 0;
  const podium = leaderboard.slice(0, 3);
  // Display order on the podium: P2, P1, P3
  const podiumOrder = [podium[1], podium[0], podium[2]].filter(Boolean) as Entry[];
  const myEntry = leaderboard.find((e) => String(e._id) === String(me._id));

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="page-title">Leaderboard</h1>
          <p className="text-sm text-muted-foreground">Department standings · {leaderboard.length} drivers</p>
        </div>
        {myEntry && (
          <div className="surface flex items-center gap-4 px-4 py-2">
            <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">Your position</span>
            <span className="font-condensed text-2xl font-extrabold italic text-primary">P{myEntry.rank}</span>
            <span className="font-mono text-sm tabular-nums">{myEntry.points} pts</span>
          </div>
        )}
      </div>

      {leaderboard.length === 0 ? (
        <p className="text-sm text-muted-foreground">No standings yet.</p>
      ) : (
        <>
          {/* Podium */}
          <section className="surface px-4 pt-8 sm:px-10">
            <div className="mx-auto flex max-w-2xl items-end gap-3 sm:gap-6">
              {podiumOrder.map((entry) => (
                <PodiumStep key={entry._id} entry={entry} isMe={String(entry._id) === String(me._id)} />
              ))}
            </div>
          </section>

          {/* Timing tower */}
          <section className="surface overflow-hidden">
            <div className="grid grid-cols-[3rem_1fr_auto] items-center gap-4 border-b border-border px-4 py-2 font-mono text-[10px] uppercase tracking-widest text-muted-foreground sm:grid-cols-[3rem_1fr_9rem_6rem_5rem]">
              <span>Pos</span>
              <span>Driver</span>
              <span className="hidden sm:block">Role</span>
              <span className="hidden text-right sm:block">Gap</span>
              <span className="text-right">Pts</span>
            </div>
            <ol>
              {leaderboard.map((entry) => {
                const isMe = String(entry._id) === String(me._id);
                const gap = leaderPoints - entry.points;
                const pct = leaderPoints > 0 ? (entry.points / leaderPoints) * 100 : 0;
                return (
                  <li
                    key={entry._id}
                    className={cn(
                      "relative grid grid-cols-[3rem_1fr_auto] items-center gap-4 border-b border-border/60 px-4 py-2.5 last:border-b-0 hover:bg-white/[0.03] sm:grid-cols-[3rem_1fr_9rem_6rem_5rem]",
                      isMe && "bg-primary/10"
                    )}
                  >
                    {isMe && <span className="absolute inset-y-0 left-0 w-1 bg-primary" />}
                    <span
                      className={cn(
                        "font-condensed text-xl font-extrabold italic tabular-nums",
                        entry.rank <= 3 ? PODIUM[entry.rank as 1 | 2 | 3].text : "text-muted-foreground"
                      )}
                    >
                      {entry.rank}
                    </span>
                    <div className="flex min-w-0 items-center gap-3">
                      <Avatar className="h-8 w-8 shrink-0">
                        <AvatarImage src={entry.photoUrl} alt={entry.name} />
                        <AvatarFallback className="text-xs">{initials(entry.name)}</AvatarFallback>
                      </Avatar>
                      <div className="min-w-0 flex-1">
                        <p className="truncate font-condensed text-base font-semibold uppercase tracking-wide">
                          {entry.name}
                          {isMe && <span className="ml-1.5 text-xs text-primary">(you)</span>}
                        </p>
                        <div className="mt-1 h-1 w-full max-w-xs overflow-hidden rounded-full bg-muted">
                          <div className="h-full rounded-full bg-primary" style={{ width: `${pct}%` }} />
                        </div>
                      </div>
                    </div>
                    <span className="hidden sm:block">
                      {entry.role ? <RoleBadge role={entry.role} /> : <span className="text-xs text-muted-foreground">—</span>}
                    </span>
                    <span className="hidden text-right font-mono text-xs tabular-nums text-muted-foreground sm:block">
                      {entry.rank === 1 ? "LEADER" : `+${gap}`}
                    </span>
                    <span className="text-right font-mono text-base font-bold tabular-nums">{entry.points}</span>
                  </li>
                );
              })}
            </ol>
          </section>
        </>
      )}
    </div>
  );
}
