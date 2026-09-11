"use client";

import { useActionState, useEffect } from "react";
import { toast } from "sonner";
import { updateSettings } from "@/lib/actions/admin";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SubmitButton } from "@/components/submit-button";

function toLocalInputValue(iso: string | null) {
  if (!iso) return "";
  const d = new Date(iso);
  const pad = (n: number) => n.toString().padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export function SettingsForm({
  deadlineIso,
  formationPhaseOpen,
}: {
  deadlineIso: string | null;
  formationPhaseOpen: boolean;
}) {
  const [state, action] = useActionState(updateSettings, {});

  useEffect(() => {
    if (state.error) toast.error(state.error);
    if (state.success) toast.success("Settings saved.");
  }, [state]);

  return (
    <form action={action} className="space-y-4">
      <div className="space-y-1.5">
        <Label htmlFor="teamFormationDeadline">Team formation deadline</Label>
        <Input
          id="teamFormationDeadline"
          name="teamFormationDeadline"
          type="datetime-local"
          defaultValue={toLocalInputValue(deadlineIso)}
        />
      </div>
      <label className="flex items-center gap-2 text-sm">
        <input type="checkbox" name="formationPhaseOpen" defaultChecked={formationPhaseOpen} />
        Team formation phase is open
      </label>
      <SubmitButton pendingLabel="Saving...">Save settings</SubmitButton>
    </form>
  );
}
