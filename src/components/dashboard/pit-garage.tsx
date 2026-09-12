import Link from "next/link";
import { Car, Users, FolderKanban, LayoutGrid, Trophy, BookUser, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

const GARAGES = [
  { number: "01", href: "/dashboard/team", label: "My Team", description: "View your team and members", icon: Users },
  { number: "02", href: "/dashboard/project", label: "My Project", description: "Submit and track your project", icon: FolderKanban },
  { number: "03", href: "/dashboard/showcase", label: "Projects", description: "Explore department projects", icon: LayoutGrid },
  { number: "04", href: "/dashboard/leaderboard", label: "Leaderboard", description: "View department rankings", icon: Trophy },
  { number: "05", href: "/dashboard/directory", label: "Members", description: "Find developers and their tech stacks", icon: BookUser },
];

// Small angled racing-stripe mark, reused next to the section title and on
// the fascia beam — the one recurring decorative motif, kept tiny.
function SpeedStripes({ className }: { className?: string }) {
  return (
    <div className={cn("flex items-end gap-0.5", className)} aria-hidden="true">
      <span className="h-3.5 w-1 -skew-x-[20deg] bg-primary" />
      <span className="h-3.5 w-1 -skew-x-[20deg] bg-primary/60" />
      <span className="h-3.5 w-1 -skew-x-[20deg] bg-primary/30" />
    </div>
  );
}

/**
 * "The Garage" — one continuous pit-building facade with five shared bays,
 * not five independent cards: a single dark container, an angled fascia
 * beam spanning the whole row, and bays separated by shared pillar borders.
 * Each bay keeps its own angled lintel (doubling as the overhead light) so
 * the "garage door" shape reads clearly instead of a flat rectangle.
 *
 * Each bay is still its own real <Link> so it stays independently
 * clickable/hoverable. Click feedback rides on the app's existing global
 * RouteTransitionLoader (the car that flies across the top on every
 * navigation) rather than a bespoke per-bay animation, so a click never
 * delays the actual navigation.
 */
export function PitGarage() {
  return (
    <div>
      <div className="mb-3 flex items-center gap-2">
        <SpeedStripes />
        <div>
          <h2 className="text-label-caps text-muted-foreground">The Garage</h2>
          <p className="text-xs text-muted-foreground/70">Choose where you want to go.</p>
        </div>
      </div>

      <div className="overflow-hidden rounded-xl border border-white/10 bg-neutral-950">
        {/* Angled fascia beam spanning the whole building */}
        <div className="relative h-3 w-full overflow-hidden bg-gradient-to-r from-white/10 via-white/[0.06] to-white/10 [clip-path:polygon(0_0,100%_0,100%_60%,0_100%)]">
          <div className="absolute inset-x-0 bottom-0 h-px bg-primary/50" />
        </div>

        <div className="flex overflow-x-auto snap-x snap-mandatory sm:snap-none">
          {GARAGES.map((garage, i) => (
            <Link
              key={garage.href}
              href={garage.href}
              className={cn(
                "group relative flex w-36 shrink-0 snap-start flex-col items-center gap-1.5 px-4 pb-5 pt-3 text-center transition-colors duration-200 hover:bg-white/[0.03] sm:w-auto sm:flex-1 sm:shrink",
                i !== 0 && "border-l-2 border-white/10 hover:border-primary/40"
              )}
            >
              {/* Angled lintel / overhead light — the bay's "garage door" shape */}
              <span
                aria-hidden="true"
                className="h-2 w-16 bg-white/15 [clip-path:polygon(15%_0,85%_0,100%_100%,0%_100%)] transition-all duration-200 group-hover:bg-primary group-hover:shadow-[0_0_10px_var(--primary)]"
              />

              <span className="font-mono text-[11px] text-white/30">{garage.number}</span>

              <Car
                strokeWidth={1.5}
                className="size-8 text-white/25 transition-all duration-200 group-hover:translate-x-1 group-hover:scale-110 group-hover:text-white/60"
              />

              <garage.icon className="size-4 text-white/35 transition-colors duration-200 group-hover:text-primary" />

              <span className="font-condensed text-sm font-bold uppercase tracking-wide text-white/90 transition-colors duration-200 group-hover:text-white">
                {garage.label}
              </span>
              <span className="text-[11px] leading-snug text-white/40">{garage.description}</span>

              <span className="mt-1 flex items-center gap-1 text-[11px] font-medium text-white/30 transition-colors duration-200 group-hover:text-primary">
                Explore
                <ArrowRight className="size-3 transition-transform duration-200 group-hover:translate-x-0.5" />
              </span>
            </Link>
          ))}
        </div>
      </div>

      {/* Pit lane floor */}
      <div className="mt-3 flex items-center gap-3">
        <div className="h-px flex-1 bg-border" />
        <span className="text-label-mono text-muted-foreground/50">Pit Lane</span>
        <div className="h-px flex-1 bg-border" />
      </div>
    </div>
  );
}
