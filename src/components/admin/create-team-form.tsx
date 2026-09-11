"use client";

import { useActionState, useEffect, useState } from "react";
import { toast } from "sonner";
import { manualCreateTeam } from "@/lib/actions/admin";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SubmitButton } from "@/components/submit-button";

export function CreateTeamForm({ candidates }: { candidates: { _id: string; name: string; email: string }[] }) {
  const [state, action] = useActionState(manualCreateTeam, {});
  const [selected, setSelected] = useState<string[]>([]);
  const [leaderId, setLeaderId] = useState<string>("");

  useEffect(() => {
    if (state.error) toast.error(state.error);
    if (state.success) {
      toast.success("Team created.");
      // Reset local selection to match the now-cleared candidate pool
      // once the server action confirms the team was created.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setSelected([]);
      setLeaderId("");
    }
  }, [state]);

  function toggle(id: string) {
    setSelected((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  }

  return (
    <form action={action} className="space-y-4">
      <input type="hidden" name="memberIds" value={selected.join(",")} />
      <input type="hidden" name="leaderId" value={leaderId} />
      <div className="space-y-1.5">
        <Label htmlFor="name">Team name</Label>
        <Input id="name" name="name" required />
      </div>
      <div className="space-y-1.5">
        <Label>Members (unassigned members shown)</Label>
        <div className="max-h-56 space-y-1 overflow-y-auto rounded-md border border-border p-2">
          {candidates.length === 0 && <p className="text-sm text-muted-foreground">No unassigned members.</p>}
          {candidates.map((c) => (
            <label key={c._id} className="flex items-center gap-2 rounded px-1.5 py-1 text-sm hover:bg-muted">
              <input
                type="checkbox"
                checked={selected.includes(c._id)}
                onChange={() => toggle(c._id)}
              />
              {c.name} <span className="text-xs text-muted-foreground">{c.email}</span>
            </label>
          ))}
        </div>
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="leaderId-select">Leader</Label>
        <select
          id="leaderId-select"
          value={leaderId}
          onChange={(e) => setLeaderId(e.target.value)}
          className="h-9 w-full rounded-md border border-input bg-background px-2 text-sm"
          required
        >
          <option value="">Select a leader...</option>
          {candidates
            .filter((c) => selected.includes(c._id))
            .map((c) => (
              <option key={c._id} value={c._id}>
                {c.name}
              </option>
            ))}
        </select>
      </div>
      <SubmitButton pendingLabel="Creating...">Create team</SubmitButton>
    </form>
  );
}
