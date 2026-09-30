import Link from "next/link";
import { notFound } from "next/navigation";
import { isValidObjectId } from "mongoose";
import { ArrowLeft, ArrowUpRight, Briefcase, Crown, GitBranch, Globe, Users } from "lucide-react";
import { getMemberProfile } from "@/lib/data/users";
import { getTeamById } from "@/lib/data/teams";
import { requireUser } from "@/lib/dal";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { RoleBadge } from "@/components/role-badge";
import { safeHref } from "@/lib/url";
import { cn } from "@/lib/utils";

// Directory names often carry the registration number ("Name 25BCE1760"); show just the name.
function displayName(fullName: string) {
  return fullName.replace(/\s*\b\d{2}[A-Z]{3}\d{4}\b\s*/i, " ").trim();
}

function initials(name: string) {
  return name.slice(0, 2).toUpperCase();
}

export default async function MemberProfilePage({ params }: PageProps<"/dashboard/directory/[id]">) {
  const { id } = await params;
  if (!isValidObjectId(id)) notFound();

  const [profile, me] = await Promise.all([getMemberProfile(id), requireUser()]);
  if (!profile) notFound();

  // Rosters are private to each team, so teammates are only listed for members of the viewer's own team.
  const sameTeam = Boolean(profile.teamId) && profile.teamId === (me.teamId ? String(me.teamId) : null);
  const team = sameTeam ? await getTeamById(profile.teamId!) : null;
  const teammates = team
    ? [...team.members].sort((a, b) =>
        String(a._id) === team.leaderId ? -1 : String(b._id) === team.leaderId ? 1 : a.name.localeCompare(b.name)
      )
    : [];
  const isLeader = team?.leaderId === profile._id;
  const isMe = String(me._id) === profile._id;
  const name = displayName(profile.name);
  const hasPoints = profile.points > 0;

  const links = [
    { href: safeHref(profile.githubUrl), title: "GitHub", icon: GitBranch },
    { href: safeHref(profile.linkedinUrl), title: "LinkedIn", icon: Briefcase },
    { href: safeHref(profile.portfolioUrl), title: "Portfolio", icon: Globe },
  ].filter((l): l is { href: string; title: string; icon: typeof GitBranch } => Boolean(l.href));

  const stats = [
    { label: "Position", value: hasPoints ? `P${profile.rank}` : "—" },
    { label: "Points", value: String(profile.points), accent: true },
    { label: "Batch", value: profile.batch || "—" },
  ];

  return (
    <div className="space-y-6">
      <Link
        href="/dashboard/directory"
        className="inline-flex items-center gap-1.5 font-mono text-xs uppercase tracking-widest text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="size-3.5" /> Members
      </Link>

      {/* Driver hero */}
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
          <div className="flex flex-wrap items-center gap-5">
            <Avatar className="h-24 w-24 ring-2 ring-primary/40 ring-offset-4 ring-offset-card">
              <AvatarImage src={profile.photoUrl} alt={name} />
              <AvatarFallback className="text-2xl">{initials(name)}</AvatarFallback>
            </Avatar>
            <div className="min-w-0 flex-1 space-y-2">
              <p className="font-mono text-[10px] uppercase tracking-widest text-primary">
                Driver profile{isMe && " · You"}
              </p>
              <h1 className="page-title break-words">{name}</h1>
              <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
                <RoleBadge role={profile.role} />
                {isLeader && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-amber-400/10 px-2 py-0.5 font-mono text-[10px] uppercase tracking-widest text-amber-400">
                    <Crown className="size-3" /> Team leader
                  </span>
                )}
                <span>{profile.teamName ?? "Not on a team yet"}</span>
              </div>
            </div>
          </div>

          <dl className="grid grid-cols-3 gap-px overflow-hidden rounded-lg border border-border bg-border">
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

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_22rem]">
        <div className="space-y-6">
          {/* Tech */}
          <section className="surface space-y-4 p-5">
            <h2 className="font-condensed text-xl font-bold uppercase tracking-wide">Garage kit</h2>
            {profile.techStack && profile.techStack.length > 0 ? (
              <div className="flex flex-wrap gap-1.5">
                {profile.techStack.map((t) => (
                  <Link
                    key={t}
                    href={`/dashboard/showcase?tech=${encodeURIComponent(t)}`}
                    className="rounded-md border border-border bg-muted/40 px-2 py-1 font-mono text-xs text-zinc-200 transition-colors hover:border-primary/50 hover:text-foreground"
                  >
                    {t}
                  </Link>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">No tech stack listed yet.</p>
            )}
            {profile.hobbies && (
              <p className="border-t border-border/60 pt-4 text-sm text-muted-foreground">{profile.hobbies}</p>
            )}
          </section>

          {/* Teammates */}
          {team && (
            <section className="surface space-y-4 p-5">
              <h2 className="flex items-center gap-2 font-condensed text-xl font-bold uppercase tracking-wide">
                <Users className="size-4 text-primary" /> {team.name}
              </h2>
              <ul className="grid gap-2 sm:grid-cols-2">
                {teammates.map((m) => {
                  const current = String(m._id) === profile._id;
                  const mName = displayName(m.name);
                  return (
                    <li key={String(m._id)}>
                      <Link
                        href={`/dashboard/directory/${String(m._id)}`}
                        aria-current={current ? "page" : undefined}
                        className={cn(
                          "flex items-center gap-3 rounded-lg border border-border px-3 py-2 transition-colors hover:border-primary/50",
                          current && "border-primary/50 bg-primary/10"
                        )}
                      >
                        <Avatar className="h-8 w-8 shrink-0">
                          <AvatarImage src={m.photoUrl} alt={mName} />
                          <AvatarFallback className="text-[10px]">{initials(mName)}</AvatarFallback>
                        </Avatar>
                        <span className="min-w-0 flex-1 truncate text-sm">{mName}</span>
                        {String(m._id) === team.leaderId && <Crown className="size-3.5 shrink-0 text-amber-400" />}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </section>
          )}
        </div>

        {/* Links */}
        <aside className="space-y-3">
          <h2 className="font-condensed text-xl font-bold uppercase tracking-wide">Links</h2>
          {links.length === 0 ? (
            <p className="rounded-xl border border-dashed border-border p-4 text-sm text-muted-foreground">No links added yet.</p>
          ) : (
            links.map(({ href, title, icon: Icon }) => (
              <a
                key={title}
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                className="surface surface-hover group flex items-center gap-3 p-3"
              >
                <span className="flex size-10 shrink-0 items-center justify-center rounded-lg border border-border bg-muted/40">
                  <Icon className="size-5" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block font-mono text-[10px] uppercase tracking-widest text-muted-foreground">{title}</span>
                  <span className="block truncate font-mono text-sm">
                    {href.replace(/^https?:\/\/(www\.)?/i, "").replace(/\/$/, "")}
                  </span>
                </span>
                <ArrowUpRight className="size-4 shrink-0 text-muted-foreground transition-colors group-hover:text-primary" />
              </a>
            ))
          )}
        </aside>
      </div>
    </div>
  );
}
