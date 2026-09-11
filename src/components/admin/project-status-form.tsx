"use client";

import { useActionState, useEffect, useState } from "react";
import { toast } from "sonner";
import { updateProjectStatus } from "@/lib/actions/admin";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { SubmitButton } from "@/components/submit-button";
import { PROJECT_STATUSES, type ProjectStatus } from "@/lib/constants/project-status";

export function ProjectStatusForm({ projectId, status }: { projectId: string; status: ProjectStatus }) {
  const [state, action] = useActionState(updateProjectStatus, {});
  const [statusValue, setStatusValue] = useState<ProjectStatus>(status);
  const [note, setNote] = useState("");

  useEffect(() => {
    if (state.error) toast.error(state.error);
    if (state.success) {
      toast.success("Project updated.");
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setNote("");
    }
  }, [state]);

  return (
    <form action={action} className="space-y-4">
      <input type="hidden" name="projectId" value={projectId} />
      <div className="space-y-1.5">
        <Label htmlFor="status">Status</Label>
        <select
          id="status"
          name="status"
          value={statusValue}
          onChange={(e) => setStatusValue(e.target.value as ProjectStatus)}
          className="h-9 w-full rounded-md border border-input bg-background px-2 text-sm"
        >
          {PROJECT_STATUSES.map((s) => (
            <option key={s} value={s}>
              {s.replace("_", " ")}
            </option>
          ))}
        </select>
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="note">Feedback note (optional, visible to the team)</Label>
        <Textarea id="note" name="note" value={note} onChange={(e) => setNote(e.target.value)} rows={3} />
      </div>
      <SubmitButton pendingLabel="Updating...">Update project</SubmitButton>
    </form>
  );
}
