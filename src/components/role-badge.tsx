import { Badge } from "@/components/ui/badge";
import type { UserRole } from "@/models/User";
import { cn } from "cn";

const LABELS: Record<UserRole, string> = {
  admin: "ADMIN",
  lead: "TEAM LEAD",
  senior: "SENIOR MEMBER",
  fresher: "JUNIOR MEMBER",
};

export function RoleBadge({ role, className }: { role: UserRole; className?: string }) {
  return (
    <Badge 
      variant="outline"
      className={cn(
        "rounded-none font-mono tracking-widest text-[10px] uppercase border-r-0 border-y-0 border-l-[3px] pl-2 shadow-none",
        role === "admin" ? "border-l-red-500 text-red-500 bg-red-500/10" : "",
        role === "lead" ? "border-l-red-400 text-red-400 bg-red-500/5" : "",
        role === "senior" ? "border-l-zinc-300 text-zinc-200 bg-zinc-400/10" : "",
        role === "fresher" ? "border-l-zinc-600 text-zinc-400 bg-zinc-800/30" : "",
        className
      )}
    >
      {LABELS[role]}
    </Badge>
  );
}
