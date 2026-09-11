import { Badge } from "@/components/ui/badge";
import type { UserRole } from "@/models/User";

const LABELS: Record<UserRole, string> = {
  admin: "Race Control",
  senior: "Senior",
  fresher: "Fresher",
};

const VARIANTS: Record<UserRole, "default" | "secondary" | "outline"> = {
  admin: "default",
  senior: "secondary",
  fresher: "outline",
};

export function RoleBadge({ role }: { role: UserRole }) {
  return <Badge variant={VARIANTS[role]}>{LABELS[role]}</Badge>;
}
