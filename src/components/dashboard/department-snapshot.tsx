import type { DepartmentSnapshot as DepartmentSnapshotData } from "@/lib/data/dashboard";

const FIELDS: { key: keyof DepartmentSnapshotData; label: string }[] = [
  { key: "members", label: "Members" },
  { key: "teams", label: "Teams" },
  { key: "projects", label: "Projects" },
  { key: "completed", label: "Completed" },
];

// Minimal typography + dividers, deliberately not a card grid — this is
// department context, not another set of clickable tiles.
export function DepartmentSnapshot({ snapshot }: { snapshot: DepartmentSnapshotData }) {
  return (
    <div>
      <h2 className="mb-3 text-label-caps text-muted-foreground">Department</h2>
      <div className="grid grid-cols-2 divide-x divide-y divide-border rounded-xl border border-border sm:grid-cols-4 sm:divide-y-0">
        {FIELDS.map(({ key, label }) => (
          <div key={key} className="px-4 py-3 text-center">
            <p className="text-telemetry-md tabular-nums text-foreground">{snapshot[key]}</p>
            <p className="text-label-caps text-muted-foreground">{label}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
