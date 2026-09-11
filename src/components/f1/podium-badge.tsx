import { cn } from "@/lib/utils";

const RANK_STYLES: Record<number, string> = {
  1: "bg-gradient-to-b from-amber-300 to-amber-500 text-black border-amber-200",
  2: "bg-gradient-to-b from-slate-200 to-slate-400 text-black border-slate-100",
  3: "bg-gradient-to-b from-orange-400 to-orange-600 text-black border-orange-300",
};

export function PodiumBadge({ rank, className }: { rank: number; className?: string }) {
  const style = RANK_STYLES[rank];
  if (!style) {
    return (
      <span
        className={cn(
          "inline-flex h-8 w-8 items-center justify-center rounded-full border border-border text-xs font-semibold text-muted-foreground",
          className
        )}
      >
        P{rank}
      </span>
    );
  }

  return (
    <span
      className={cn(
        "inline-flex h-9 w-9 items-center justify-center rounded-full border-2 text-sm font-bold shadow-[0_0_14px_var(--primary)]",
        style,
        className
      )}
    >
      P{rank}
    </span>
  );
}
