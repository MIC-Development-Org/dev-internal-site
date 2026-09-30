import Link from "next/link";
import { AlertTriangle, ArrowRight, Crown, Flag, UserPlus } from "lucide-react";
import { requireUser } from "@/lib/dal";
import {
  countSeniors,
  getMyTeam,
  TEAM_MAX_MEMBERS,
  TEAM_MAX_SENIORS,
  TEAM_MIN_MEMBERS,
  TEAM_MIN_SENIORS,
} from "@/lib/data/teams";
import { getSettings } from "@/lib/data/settings";
import { getProjectForTeam } from "@/lib/data/projects";
import { isDeadlinePassed } from "@/lib/deadline";
import { ALLOWED_EMAIL_DOMAIN } from "@/auth";
import { getProjectProgressPercent } from "@/lib/constants/project-status";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { RoleBadge } from "@/components/role-badge";
import { ProjectStatusBadge } from "@/components/project-status-badge";
import { EmptyState } from "@/components/f1/empty-state";
import { CountdownClock } from "@/components/f1/countdown-clock";
import { TeamFormationForm } from "@/components/dashboard/team-formation-form";

export default async function TeamPage() {
  const user = await requireUser();
  const team = await getMyTeam(user.teamId ? String(user.teamId) : null);

  if (!team) {
    const settings = await getSettings();
    const deadline = settings.teamFormationDeadline;
    const closed = !settings.formationPhaseOpen || isDeadlinePassed(deadline);

    return (
      <div className="space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="page-title">Team Formation</h1>
            <p className="text-sm text-muted-foreground">
              Create your team and add your teammates before team formation closes.
            </p>
          </div>
          {deadline && <CountdownClock deadlineIso={deadline.toISOString()} />}
        </div>

        {closed ? (
          <EmptyState
            title="You haven't joined a team yet."
            description="Team formation is closed. Ask an admin to assign you to a team."
          />
        ) : (
          <TeamFormationForm
            domain={ALLOWED_EMAIL_DOMAIN}
            minMembers={TEAM_MIN_MEMBERS}
            maxMembers={TEAM_MAX_MEMBERS}
            minSeniors={TEAM_MIN_SENIORS}
            maxSeniors={TEAM_MAX_SENIORS}
            me={{ name: user.name, photoUrl: user.photoUrl, role: user.role }}
          />
        )}
      </div>
    );
  }

  const project = await getProjectForTeam(team._id);
  const leader = team.members.find((m) => String(m._id) === team.leaderId);
  // Leader first, then everyone else alphabetically.
  const roster = [...team.members].sort((a, b) => {
    if (String(a._id) === team.leaderId) return -1;
    if (String(b._id) === team.leaderId) return 1;
    return a.name.localeCompare(b.name);
  });
  const seniorCount = countSeniors(team.members);
  const openSeats = Math.max(0, TEAM_MAX_MEMBERS - team.members.length);
  const rosterIssues = [
    team.members.length < TEAM_MIN_MEMBERS &&
      `${TEAM_MIN_MEMBERS - team.members.length} more driver${TEAM_MIN_MEMBERS - team.members.length === 1 ? "" : "s"} needed to reach the ${TEAM_MIN_MEMBERS}-member minimum.`,
    seniorCount < TEAM_MIN_SENIORS && `Teams need at least ${TEAM_MIN_SENIORS} senior member${TEAM_MIN_SENIORS === 1 ? "" : "s"}.`,
    seniorCount > TEAM_MAX_SENIORS && `Teams can have at most ${TEAM_MAX_SENIORS} senior members.`,
  ].filter(Boolean) as string[];
  const progress = project ? getProjectProgressPercent(project.status) : 0;

  const stats = [
    { label: "Team points", value: String(team.points), accent: true },
    { label: "Drivers", value: `${team.members.length}/${TEAM_MAX_MEMBERS}` },
    { label: "Seniors", value: `${seniorCount}/${TEAM_MIN_SENIORS}-${TEAM_MAX_SENIORS}` },
    {
      label: "On the grid since",
      value: new Date(team.createdAt).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Livery hero */}
      <section className="surface relative overflow-hidden">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-y-0 right-0 w-2/3 opacity-60"
          style={{
            background:
              "repeating-linear-gradient(115deg, transparent 0 28px, color-mix(in oklch, var(--primary) 14%, transparent) 28px 34px)",
            maskImage: "linear-gradient(to left, black, transparent)",
          }}
        />
        <div className="relative space-y-6 p-6">
          <div>
            <p className="font-mono text-[10px] uppercase tracking-widest text-primary">Team garage</p>
            <h1 className="page-title mt-1">{team.name}</h1>
            {leader && (
              <p className="mt-1 flex items-center gap-1.5 text-sm text-muted-foreground">
                <Crown className="size-3.5 text-amber-400" />
                Team principal <span className="text-foreground">{leader.name}</span>
              </p>
            )}
          </div>

          <dl className="grid grid-cols-2 gap-px overflow-hidden rounded-lg border border-border bg-border sm:grid-cols-4">
            {stats.map((s) => (
              <div key={s.label} className="bg-card/90 px-4 py-3">
                <dt className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">{s.label}</dt>
                <dd
                  className={cn(
                    "font-condensed text-3xl font-extrabold italic tabular-nums leading-tight",
                    s.accent && "text-primary"
                  )}
                >
                  {s.value}
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      {rosterIssues.length > 0 && (
        <div className="flex gap-3 rounded-xl border border-amber-500/30 bg-amber-500/5 px-4 py-3 text-sm">
          <AlertTriangle className="mt-0.5 size-4 shrink-0 text-amber-400" />
          <div>
            <p className="font-medium text-amber-300">Roster below regulations</p>
            <ul className="mt-0.5 space-y-0.5 text-xs text-muted-foreground">
              {rosterIssues.map((issue) => (
                <li key={issue}>{issue}</li>
              ))}
            </ul>
          </div>
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_22rem]">
        {/* Drivers */}
        <section className="space-y-3">
          <h2 className="font-condensed text-xl font-bold uppercase tracking-wide">Drivers</h2>
          <div className="grid gap-3 sm:grid-cols-2">
            {roster.map((member, i) => {
              const isLeader = String(member._id) === team.leaderId;
              const isMe = String(member._id) === String(user._id);
              return (
                <article
                  key={String(member._id)}
                  className={cn("surface relative overflow-hidden p-4", isMe && "border-primary/50")}
                >
                  <span
                    aria-hidden
                    className="pointer-events-none absolute -right-1 -top-4 select-none font-condensed text-[5.5rem] font-extrabold italic leading-none text-foreground/[0.05]"
                  >
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <div className="relative flex items-center gap-3">
                    <Avatar className={cn("h-12 w-12", isLeader && "ring-2 ring-amber-400 ring-offset-2 ring-offset-card")}>
                      <AvatarImage src={member.photoUrl} alt={member.name} />
                      <AvatarFallback>{member.name.slice(0, 2).toUpperCase()}</AvatarFallback>
                    </Avatar>
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-condensed text-lg font-semibold uppercase leading-tight tracking-wide">
                        {member.name}
                      </p>
                      <p className="truncate text-xs text-muted-foreground">{member.email}</p>
                    </div>
                  </div>
                  <div className="relative mt-3 flex flex-wrap items-center gap-2">
                    {isLeader && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-amber-400/10 px-2 py-0.5 font-mono text-[10px] uppercase tracking-widest text-amber-400">
                        <Crown className="size-3" /> Leader
                      </span>
                    )}
                    {isMe && (
                      <span className="rounded-full bg-primary/15 px-2 py-0.5 font-mono text-[10px] uppercase tracking-widest text-primary">
                        You
                      </span>
                    )}
                    <RoleBadge role={member.role} />
                    {member.batch && <span className="ml-auto font-mono text-xs text-muted-foreground">{member.batch}</span>}
                  </div>
                </article>
              );
            })}

            {Array.from({ length: openSeats }, (_, i) => {
              const seat = team.members.length + i + 1;
              return (
                <div
                  key={`open-${seat}`}
                  className="flex min-h-[7.5rem] items-center gap-3 rounded-xl border border-dashed border-border p-4 text-muted-foreground"
                >
                  <span className="flex size-12 items-center justify-center rounded-full border border-dashed border-border">
                    <UserPlus className="size-4" />
                  </span>
                  <div>
                    <p className="font-condensed text-lg font-semibold uppercase tracking-wide">Open seat</p>
                    <p className="text-xs">{seat <= TEAM_MIN_MEMBERS ? "Required to race" : "Optional reserve"}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* Project */}
        <aside className="space-y-3">
          <h2 className="font-condensed text-xl font-bold uppercase tracking-wide">Current project</h2>
          {project ? (
            <Link href="/dashboard/project" className="surface surface-hover group block space-y-4 p-5">
              <div className="flex items-start justify-between gap-3">
                <p className="font-condensed text-2xl font-bold uppercase leading-tight tracking-wide">{project.title}</p>
                <ProjectStatusBadge status={project.status} />
              </div>
              <p className="line-clamp-3 text-sm text-muted-foreground">{project.description}</p>

              <div className="space-y-1.5">
                <div className="flex justify-between font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                  <span>Race progress</span>
                  <span className="tabular-nums text-foreground">{progress}%</span>
                </div>
                <div className="h-1.5 overflow-hidden rounded-full bg-muted">
                  <div className="h-full rounded-full bg-primary shadow-[0_0_10px_var(--primary)]" style={{ width: `${progress}%` }} />
                </div>
              </div>

              {project.techStack.length > 0 && (
                <p className="font-mono text-xs text-muted-foreground">{project.techStack.join(" / ")}</p>
              )}

              <p className="flex items-center gap-1 font-mono text-xs uppercase tracking-widest text-primary">
                Open project <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-0.5" />
              </p>
            </Link>
          ) : (
            <Link
              href="/dashboard/project"
              className="flex flex-col items-center gap-2 rounded-xl border border-dashed border-border p-8 text-center text-sm text-muted-foreground hover:border-primary/50"
            >
              <Flag className="size-5" />
              No project yet.
              <span className="font-mono text-xs uppercase tracking-widest text-primary">Pick one →</span>
            </Link>
          )}
        </aside>
      </div>
    </div>
  );
}
